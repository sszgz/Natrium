// natrium
// license : MIT
// author : Sean Chen

import * as path from 'path';
import { nat } from "..";
import { chainmonitor, transaction_like } from "../interface/blockchain/chainmonitor";
import { debug_level_enum } from "../interface/debug/debug_logger";
import { httplistener, httplistener_handler, httpmsgproc_map_type, httpmsgproc_type, http_request_like, http_response_like } from "../interface/network/httplistener";
import { ethers } from "ethers";
import { chain_interact } from "./chain_interact";
import { http_param_err_json, http_unknown_cmd_json, http_interal_json } from "../server/gameframework/msgs/httpmsgs";
import { rediscache } from '../interface/data/rediscache';
import { globaldatas } from '../server/gameframework/datacomponent/globaldata';

type contract_addr_to_name = {
    [key:string]:string; // address => name
};

const zeroaddr = "0x0000000000000000000000000000000000000000";

export class _chainwatcher_impl implements httplistener_handler {
    
    readonly chainId:number;
    readonly chainType:string;
    readonly rpchost:string;
    
    protected _httplistener:httplistener|null = null;
    protected _httpmsgprocs:httpmsgproc_map_type = {};
    
    protected _redis:rediscache;

    protected _contracts:contract_addr_to_name = {};

    constructor() {
    }

    public get httplistener() {
        return this._httplistener;
    }
    
    protected async _warrant_transfer(logevent:any, txrecp:any):Promise<void> {

        if(logevent.args.from == zeroaddr) {
            // mint, proce by mint event, don't proc here
        }
        else {
            // from user or contract

            const from_uid = await nat.datas.get_wallet_userid(logevent.args.from);
            if(from_uid != undefined){
                await globaldatas.on_user_data_change(from_uid, "rmv_warrant", logevent.args);
            }
            
            const to_uid = await nat.datas.get_wallet_userid(logevent.args.to);
            if(to_uid != undefined){
                await globaldatas.on_user_data_change(to_uid, "add_warrant", logevent.args);
            }
            
            // TO DO : modify warrant nftid 2 user data
        }
    }
    
    protected async _warrant_mint(logevent:any, txrecp:any):Promise<void> {
        const to_uid = await nat.datas.get_wallet_userid(logevent.args.to);
        if(to_uid != undefined){
            await globaldatas.on_user_data_change(to_uid, "mint_warrant", logevent.args);
        }

        // TO DO : insert warrant nftid 2 user data
    }
    
    protected async _warrant_modified(logevent:any, txrecp:any):Promise<void> {
        
        // TO DO : get warrant nftid 2 user data & notify on_user_data_change
    }

    protected async _proc_event(contract_addr:string, contract_name:string, logevent:any, txrecp:any):Promise<void> {
        switch(contract_name){
            case "WarrantNFT":
            {
                switch(logevent.name){
                    case "Transfer":
                        {
                            await this._warrant_transfer(logevent, txrecp);
                        }
                        break;
                    case "WarrantNFTMint":
                        {
                            await this._warrant_mint(logevent, txrecp);
                        }
                        break;
                    case "WarrantNFTModified":
                        {
                            await this._warrant_modified(logevent, txrecp);
                        }
                        break;
                }
            }
            break;
            // case "HeroNFT":
            // {
            //     switch(logevent.event){
            //         case "Transfer":
            //             {
            //                 await this._hero_transfer(logevent, txrecp);
            //             }
            //             break;
            //         case "HeroNFTMint":
            //             {
            //                 await this._hero_mint(logevent, txrecp);
            //             }
            //             break;
            //         case "HeroNFTModified":
            //             {
            //                 await this._hero_modified(logevent, txrecp);
            //             }
            //             break;
            //     }
            // }
            // break;
            case "GameService":
            {
                switch(logevent.name){
                    case "BindHeroNFTUsage":
                        {
                        }
                        break;
                    case "BindShipNFT":
                        {
                        }
                        break;
                    case "BindWarrant":
                        {
                        }
                        break;
                }
            }
            break;
        }
    }

    protected async _on_event_cb(req:http_request_like, res:http_response_like) {
        if(req.postdata == undefined){
            res.write(http_param_err_json);
            res.end();
            return;
        }
        let formated_receipts = JSON.parse(req.postdata);
        if(formated_receipts.length <= 0){
            res.write(http_param_err_json);
            res.end();
            return;
        }
        // TO DO : (important!!!!) only local host & verify sign

        for(let i=0; i<formated_receipts.length; ++i){
            const txrecp = await this._redis.read_data("tx", formated_receipts[i].hash, ".");
            if(txrecp != undefined){
                nat.dbglog.log(debug_level_enum.dle_error, `chainwatcher_impl tx[${formated_receipts[i].hash}] already processed`);
                continue;
            }

            for(let j=0; j<formated_receipts[i].logs.length; ++j){
                let lowercase_addr = formated_receipts[i].logs[j].address.toLocaleLowerCase();

                let contract_name = "";
                if(lowercase_addr in this._contracts){
                    contract_name = this._contracts[lowercase_addr];
                    await this._proc_event(lowercase_addr, contract_name, formated_receipts[i].logs[j], formated_receipts[i]);
                }
            }

            // write to redis
            await this._redis.insert_data("tx", formated_receipts[i].hash, formated_receipts[i]);
        }

        res.write(JSON.stringify({
            res:"OK"
        }));
        res.end();
    }

    public async startup():Promise<boolean> {
        
        // init config
        let contractfile = path.resolve(__dirname, `../../${nat.conf.get_serverconf().chainwatcher_confs.contractjson}`);
        let conf = require(contractfile);
        if(conf == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `chainwatcher_impl init config file [${nat.conf.get_serverconf().chainwatcher_confs.contractjson}] not exist`);
            return false;
        }
        
        // create map
        for(const key in conf.contracts) {
            const con = conf.contracts[key];
            let lowercase_addr = con.addr.toLocaleLowerCase();
            this._contracts[lowercase_addr] = key;
        }

        // get redis
        this._redis = nat.datas.persistcaches["txreceipts"];
        if(this._redis == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `chainwatcher_impl init redis:txreceipts not exist`);
            return false;
        }

        // reg http msg
        let thisptr = this;
        this.reg_httpmsg_proc("/event_cb", async (req:http_request_like, res:http_response_like):Promise<void>=>{
            await this._on_event_cb(req, res);
        });

        // start up http listener
        this._httplistener = nat.create_httplistener(this);
        
        nat.dbglog.log(debug_level_enum.dle_error, `chainwatcher_impl success startup`);

        return true;
    }
    public async shutdown() {
        this._httplistener.shutdown();
    }
    
    public reg_httpmsg_proc(cmd:string, proc:httpmsgproc_type):void {
        if(cmd in this._httpmsgprocs){
            nat.dbglog.log(debug_level_enum.dle_error, `chainwatcher_impl register http msg proc [${cmd} already exist]`);
            return;
        }
        this._httpmsgprocs[cmd] = proc;
    }
    public open_httplistener() {
        if(this._httplistener == null){
            nat.dbglog.log(debug_level_enum.dle_error, `chainwatcher_impl open httplistener when _httplistener is null`);
            return;
        }
        
        // TO DO : (important!!!!) only local host & verify sign
        this._httplistener.start(nat.conf.get_serverconf().chainwatcher_confs.eventcb_listener.host, nat.conf.get_serverconf().chainwatcher_confs.eventcb_listener.port);
    }
    
    async on_request(req:http_request_like, res:http_response_like):Promise<void> {
        if(req.url == undefined) {
            res.write(http_unknown_cmd_json);
            res.end();
            return;
        }
        if(!(req.url in this._httpmsgprocs)){
            res.write(http_unknown_cmd_json);
            res.end();
            return;
        }
        try{
            await this._httpmsgprocs[req.url](req, res);
        }
        catch(e){
            let err:Error = e as Error;
            nat.dbglog.log(debug_level_enum.dle_error, `chainwatcher_impl on http request ${req.url} exception:${err.message}\r\n ${err.stack}`);
            res.write(http_interal_json);
            res.end();
        }
    }
}