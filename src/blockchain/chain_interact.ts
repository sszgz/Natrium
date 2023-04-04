
// natrium
// license : MIT
// author : Sean Chen

import * as path from 'path';
import { ethers } from "ethers";
import { debug_level_enum } from "../interface/debug/debug_logger";
import { httpconnecter } from "../interface/network/httpconnecter";
import { nat } from "../natrium";

type contract_map = {
    [key:string]:ethers.BaseContract;
};

export class chain_interact {

    protected _chainId:number; 
    protected _chainType:string; 
    protected _rpchost:string; 
    
    protected _httpconnector: httpconnecter;

    protected _contract_byname: contract_map;
    protected _contract_byaddr: contract_map;

    protected _provider: ethers.Provider | undefined;

    public get contracts_byname() {
        return this._contract_byname;
    }
    public get contract_byaddr() {
        return this._contract_byaddr;
    }

    public async init(chainId:number, chainType:string, rpchost:string, contractjsonfile:string):Promise<boolean> {
        this._httpconnector = nat.create_httpconnecter(true);

        this._chainId = chainId;
        this._chainType = chainType;
        this._rpchost = rpchost;

        let contractfile = path.resolve(__dirname, `../../${contractjsonfile}`);
        let conf = require(contractfile);
        if(conf == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `chain_interact init config file [${contractjsonfile}] not exist`);
            return false;
        }
        
        // create map
        this._contract_byname = {};
        this._contract_byaddr = {};
        for(const key in conf.contracts) {
            const con = conf.contracts[key];
            let lowercase_addr = con.addr.toLocaleLowerCase();
            const contract = new ethers.Contract(lowercase_addr, con.abi);
            this._contract_byname[key] = contract;
            this._contract_byaddr[lowercase_addr] = contract;
        }

        nat.dbglog.log(debug_level_enum.dle_system, `chain_interact init with config file [${contractjsonfile}]`);

        return true;
    }
    
    public async get_block_number():Promise<number> {
        const blockRes = await this._requestRPC("eth_blockNumber", [])
        const currBlock = parseInt(blockRes, 16);
        return currBlock;
    }
    public async get_block(block: number):Promise<any> {
        const blockNumber = "0x" + block.toString(16);
        return await this._requestRPC("eth_getBlockByNumber", [blockNumber, true]);
    }

    public async batch_get_blocks(blocks: number[]):Promise<any> {
        let params = []
        for (let i = 0; i < blocks.length; i++) {
            const blockNumber = "0x" + blocks[i].toString(16);
            params.push({jsonrpc: "2.0", method: "eth_getBlockByNumber", params: [blockNumber, true],id: i+1})
        }
        return await this._batchRequestRpc(params);
    }
    public async batch_get_receipts(txhashs: string[]):Promise<any> {
        let params = []
        for (let i = 0; i < txhashs.length; i++) {
            params.push({jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [txhashs[i]],id: i+1})
        }
        return await this._batchRequestRpc(params);
    }

    protected async _requestRPC(method: string, params: any[], id:number = 1):Promise<any> {
        try {
            const response = await this._httpconnector.post(this._rpchost, {jsonrpc: "2.0", method: method, params: params,id:id});
            nat.dbglog.log(debug_level_enum.dle_detail, `chain_interact request rpc method [${method}] msg [${JSON.stringify(response.data)}]`);
            return response.result;
        } catch (error) {
            nat.dbglog.log(debug_level_enum.dle_error, `chain_interact request rpc method [${method}] msg [${error}]`);
            return undefined;
        }
    }
    protected async _batchRequestRpc(requests:any[]):Promise<any> {
        try {
            const response = await this._httpconnector.post(this._rpchost, requests)
            const result = []
            for (let i = 0; i < response.length; i++) {
                result.push(response[i].result)
            }
            return result;
        } catch (error) {
            nat.dbglog.log(debug_level_enum.dle_error, `chain_interact batch request rpc msg [${error}]`);
            return undefined;
        }
    }
}