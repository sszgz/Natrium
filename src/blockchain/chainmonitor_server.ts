// natrium
// license : MIT
// author : Sean Chen

import { ethers } from 'ethers';
import * as path from 'path';
import { debug_level_enum } from "../interface/debug/debug_logger";
import { httpconnecter } from '../interface/network/httpconnecter';
import { httplistener, httplistener_handler, httpmsgproc_map_type, httpmsgproc_type, http_request_like, http_response_like } from "../interface/network/httplistener";
import { nat } from "../natrium";
import { http_interal_json, http_param_err_json, http_unknown_cmd_json } from '../server/gameframework/msgs/httpmsgs';
import { _redis_client } from '../_node_implements/_node/_redis';
import { chain_interact } from "./chain_interact";

interface event_watcher {
    contract_addr:string;
    callback_url:string;
}
type event_watcher_map = {
    [key:string]:event_watcher
}

export class chainmonitor_server implements httplistener_handler {
    protected _httplistener:httplistener|null = null;
    protected _httpconnector: httpconnecter;

    protected _httpmsgprocs:httpmsgproc_map_type = {};
    protected _chainact:chain_interact = new chain_interact();

    // protected _event_watchers:event_watcher_map;
    protected _event_watcher_cb_url:string;
    protected _current_block_height:number;

    protected _redis:_redis_client;

    constructor() {
    }

    public get httplistener() {
        return this._httplistener;
    }
    public get chainact() {
        return this._chainact;
    }

    public async startup(configfile:string) {
        
        // init session mgr

        // reg http msg
        // this.reg_httpmsg_proc("/reg_evt_mon", this._on_reg_evt_mon);
        // this.reg_httpmsg_proc("/unreg_evt_mon", this._on_unreg_evt_mon);
        // this.reg_httpmsg_proc("/get_tx_byhash", this._on_get_tx_byhash);

        // start up http listener
        this._httplistener = nat.create_httplistener(this);

        // create http connector to watcher
        this._httpconnector = nat.create_httpconnecter(false);

        // init config
        let conffile = path.resolve(__dirname, `../../${configfile}`);
        let conf = require(conffile);
        if(conf == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server init config file [${conffile}] not exist`);
            return;
        }
        // config start height
        if(conf.start_height != undefined){
            this._current_block_height = conf.start_height;
        }
        this._event_watcher_cb_url = conf.watcher_url;

        // init chain interact
        if(!this._chainact.init(conf.chainId, conf.chainType, conf.rpchost, conf.contractjson))
        {
            return;
        }

        // init redis
        this._redis = new _redis_client(conf.redis);
        await this._redis.connect();
        if(!this._redis.connected){
            nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server connect redis error`);
            return;
        }
        // this._event_watchers = await this._redis.get_json("_event_watchers", ".");
        // if(this._event_watchers == undefined) {
        //     await this._redis.insert_json("_event_watchers", {});
        //     nat.dbglog.log(debug_level_enum.dle_system, `chainmonitor_server init redis _event_watchers`);
        // }
        // else {
        //     nat.dbglog.log(debug_level_enum.dle_system, `chainmonitor_server readfrom redis _event_watchers`);
        // }

        let height = await this._redis.get("current_height");
        if(height != undefined) {
            this._current_block_height = parseInt(height);
        }
        nat.dbglog.log(debug_level_enum.dle_system, `chainmonitor_server current block height:${this._current_block_height}`);

        // listen on exit sig
        let thisptr = this;
        process.on('SIGINT', function() {
            console.log("Caught interrupt signal");
        
            // close all listener
            thisptr._httplistener?.shutdown();

            // let allexit = false;
            // while(!allexit){
            //     allexit = true;
            //     natrium_services.workers.forEach( (sw)=>{
            //         if(!sw.exited){
            //             allexit = false;
            //         }
            //     });
            // }

            console.log("shut down");

            process.exit();
        });
    }

    protected async delay(ms:number):Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            setTimeout(()=>{
                resolve();
            }, ms)
        });
    }

    public async start_sync_block():Promise<void> {

        while(true){
            try{
                await this._sync_block();
            }
            catch(e) {
                let err:Error = e as Error;
                nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server sync block exception:${err.message}\r\n${err.stack}`);
                await this.delay(500);
            }
        }
    }

    protected async _sync_block():Promise<void> {
        
        // update height
        let node_blockheight = await this._chainact.get_block_number();
        if(node_blockheight == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server get block number error`);
            await this.delay(500);
            return;
        }
        if(node_blockheight <= this._current_block_height){
            await this.delay(500);
            return;
        }

        let bactchcount = 0;
        let blocknums = new Array<number>();
        for(let blocknum = this._current_block_height + 1; blocknum <= node_blockheight; ++blocknum){
            blocknums.push(blocknum);
            ++bactchcount;

            // TO DO : find best batchcount
            if(bactchcount >= 100){
                break;
            }
        }

        let blocks = await this._chainact.batch_get_blocks(blocknums);
        if(blocks == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server get blocks error`);
            return;
        }

        let txhashs = new Array<string>();
        for(let i=0; i<blocks.length; ++i){
            for(let j=0; j<blocks[i].transactions.length; ++j){
                txhashs.push(blocks[i].transactions[j].hash);

                // TO DO : write tx to redis
            }
        }

        let receipts = await this._chainact.batch_get_receipts(txhashs);
        if(receipts == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server get receipts error`);
            return;
        }
        if(receipts.length == 0){
            return;
        }

        receipts.sort((a,b)=>{
            if(a.blockNumber > b.blockNumber){
                return 1;
            }
            else if(a.blockNumber < b.blockNumber){
                return -1;
            }
            else {
                return 0;
            }
        });

        // if(receipts[0].blockNumber != this._current_block_height + 1){
        //     nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server get receipts first blocknumber error`);
        //     return;
        // }
        let formated_receipts = [];
        let last_block_num = this._current_block_height;
        for(let i=0; i<receipts.length; ++i){
            // TO DO : check status
            // if(receipts[i].status == 0){
            //     continue;
            // }
            let iswatch_contract = false;
            last_block_num = parseInt(receipts[i].blockNumber, 16);
            let recp = {
                blockNumber:last_block_num,
                contractAddress:receipts[i].contractAddress,
                from:receipts[i].from,
                to:receipts[i].to,
                hash:receipts[i].hash?receipts[i].hash:receipts[i].transactionHash,
                status:receipts[i].status,
                logs:receipts[i].logs,
            };
            for(let j = 0; j < recp.logs.length; ++j){
                recp.logs[j].address = recp.logs[j].address.toLocaleLowerCase();
                if(!(recp.logs[j].address in this._chainact.contract_byaddr)){
                    continue;
                }

                const contract:ethers.BaseContract = this._chainact.contract_byaddr[recp.logs[j].address];
                let parsedLog = contract.interface.parseLog(recp.logs[j]);
                recp.logs[j] = {
                    address:recp.logs[j].address,
                    name:parsedLog.name,
                    args:{}
                };

                // for(let idx = 0; idx <parsedLog.fragment.inputs.length; ++idx) {
                //     recp.logs[j].args[parsedLog.fragment.inputs[idx].name] = parsedLog.args[parsedLog.fragment.inputs[idx].name];
                // }
                //recp.logs[j].args = parsedLog.args.toObject();
                recp.logs[j].args = this._parse_log_tuple_args(parsedLog.args, parsedLog.fragment.inputs);

                iswatch_contract = true;
            }
            if(iswatch_contract){
                formated_receipts.push(recp);
            }
        }

        if(formated_receipts.length > 0){
            let retrycount = 0;
            while(retrycount < 1000){
                let ret = await this._httpconnector.post(this._event_watcher_cb_url, formated_receipts);
                if(ret.res == "OK"){
                    // process success
                    // update block height
                    
                    nat.dbglog.log(debug_level_enum.dle_system, 
                        `chainmonitor_server process blocks from [${this._current_block_height+1}] to [${last_block_num}] with receipts[${formated_receipts.length}]`);

                    this._current_block_height = last_block_num;
                    this._redis.set("current_height", last_block_num);
                    break;
                }
                
                nat.dbglog.log(debug_level_enum.dle_system, 
                    `chainmonitor_server process blocks from [${this._current_block_height+1}] to [${last_block_num}] with receipts[${formated_receipts.length}] with post error:${ret.res}, retry count:${retrycount}`);

                ++retrycount;
                await this.delay(500);
            }
        }
        else {
            nat.dbglog.log(debug_level_enum.dle_system, 
                `chainmonitor_server process blocks from [${this._current_block_height+1}] to [${last_block_num}] with receipts[${formated_receipts.length}]`);
            
            this._current_block_height = last_block_num;
            this._redis.set("current_height", last_block_num);
        }
    }

    protected _parse_log_array_args(args:ethers.Result, param:ethers.ParamType):any {
        let ret = [];
        
        for(let idx = 0; idx <args.length; ++idx) {
            if(param.isTuple()){
                ret.push(this._parse_log_tuple_args(args[idx], param.components));
            }
            else {
                ret.push(args[idx]);
            }
        }

        return ret;
    }

    protected _parse_log_tuple_args(args:ethers.Result, param:readonly ethers.ParamType[]):any {
        let ret = {};
        for(let idx = 0; idx <param.length; ++idx) {
            if(param[idx].isArray()){
                ret[param[idx].name] = this._parse_log_array_args(args[param[idx].name], param[idx].arrayChildren);
            }
            else if(param[idx].isTuple()){
                ret[param[idx].name] = this._parse_log_tuple_args(args[param[idx].name], param[idx].components);
            }
            else {
                ret[param[idx].name] = args[param[idx].name];
            }
        }

        return ret;
    }

    public reg_httpmsg_proc(cmd:string, proc:httpmsgproc_type):void {
        if(cmd in this._httpmsgprocs){
            nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server register http msg proc [${cmd} already exist]`);
            return;
        }
        this._httpmsgprocs[cmd] = proc;
    }
    public open_httplistener(host:string, port:number) {
        if(this._httplistener == null){
            nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server open httplistener when _httplistener is null`);
            return;
        }
        
        // TO DO : use config
        this._httplistener.start(host, port);
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
            nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server on http request ${req.url} exception:${err.message}\r\n ${err.stack}`);
            res.write(http_interal_json);
            res.end();
        }
    }
    
    // protected async _on_reg_evt_mon(req:http_request_like, res:http_response_like):Promise<void> {
    //     if(req.postdata == undefined){
    //         res.write(http_param_err_json);
    //         res.end();
    //         return;
    //     }
    //     let postdata = JSON.parse(req.postdata);
    //     if(!("watcher" in postdata)){
    //         res.write(http_param_err_json);
    //         res.end();
    //         return;
    //     }

    //     let watcher:event_watcher = postdata.watcher;
    //     if(watcher.callback_url == undefined || watcher.callback_url.length == 0 ||
    //         watcher.contract_addr == undefined || watcher.contract_addr.length == 0) 
    //     {
    //         res.write(http_param_err_json);
    //         res.end();
    //         return;
    //     }

    //     if(!(watcher.contract_addr in this._chainact.contracts)){
    //         res.write(`{"res":"contract addr error"}`);
    //         res.end();
    //         return;
    //     }

    //     // TO DO : check callback_url & contract_addr is validate

    //     watcher.contract_addr = watcher.contract_addr.toLocaleLowerCase();
    //     this._event_watchers[watcher.contract_addr] = watcher;

    //     // write to redis
    //     this._redis.update_json("_event_watchers", `.${watcher.contract_addr}`, watcher);
        
    //     res.write(JSON.stringify({
    //         res:"OK",
    //         watcher:watcher
    //     }));
    //     res.end();
    // }

    // protected async _on_unreg_evt_mon(req:http_request_like, res:http_response_like):Promise<void> {
    //     if(req.postdata == undefined){
    //         res.write(http_param_err_json);
    //         res.end();
    //         return;
    //     }
    //     let postdata = JSON.parse(req.postdata);
    //     if(!("watcheraddr" in postdata)){
    //         res.write(http_param_err_json);
    //         res.end();
    //         return;
    //     }

    //     let addrlowercase = postdata.watcheraddr.toLocaleLowerCase();
    //     if(!(addrlowercase in this._event_watchers)){
    //         res.write(http_param_err_json);
    //         res.end();
    //         return;
    //     }

    //     delete this._event_watchers[addrlowercase];
        
    //     // delete from redis
    //     this._redis.delete_json("_event_watchers", `.${addrlowercase}`);
        
    //     res.write(JSON.stringify({
    //         res:"OK",
    //         watcheraddr:addrlowercase
    //     }));
    //     res.end();
    // }

    // protected async _on_get_tx_byhash(req:http_request_like, res:http_response_like):Promise<void> {
    //     // TO DO : get tx by hash
    // }
}