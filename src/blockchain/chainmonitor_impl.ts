// natrium
// license : MIT
// author : Sean Chen

import { nat } from "..";
import { chainmonitor, transaction_like } from "../interface/blockchain/chainmonitor";
import { debug_level_enum } from "../interface/debug/debug_logger";
import { httplistener, httplistener_handler, httpmsgproc_map_type, httpmsgproc_type, http_request_like, http_response_like } from "../interface/network/httplistener";
import { on_reg_evt_mon, on_get_tx_byhash, http_unknown_cmd_json, http_interal_json, http_param_err_json } from "./chainmonitor_server_httpmsg";

export class chainmonitor_impl implements chainmonitor, httplistener_handler {
    
    readonly chainId:number; // TO DO : from config
    readonly chainType:string;  // TO DO : from config
    readonly rpchost:string;  // TO DO : rom config

    protected _httplistener:httplistener|null = null;
    protected _httpmsgprocs:httpmsgproc_map_type = {};

    constructor() {
    }

    public get httplistener() {
        return this._httplistener;
    }
    

    public on(contract_addr:string, event:string, cb: (this:chainmonitor, ...args) => void) {
        // add cb
    }
    public off(contract_addr:string, event:string, cb: (this:chainmonitor, ...args) => void) {
        // add cb
    }

    public async register_event_monitor(contract_addr:string, event:string) : Promise<void> {
        // TO DO : call chainmonitor_server reg_evt_mon
    }

    public async get_transaction_byhash(hash:string):Promise<transaction_like | null> {
        // TO DO : call chainmonitor_server reg_evt_mon

        return null;
    }

    public async startup(configfile:string) {
        
        // init session mgr

        // reg http msg
        this.reg_httpmsg_proc("/event_cb", this._on_event_cb);

        // start up http listener
        this._httplistener = nat.create_httplistener(this);

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
    public async _on_event_cb(req:http_request_like, res:http_response_like):Promise<void> {
        if(req.postdata == undefined){
            res.write(http_param_err_json);
            res.end();
            return;
        }
        let postdata = JSON.parse(req.postdata);
        if(!("evt_name" in postdata) || !("evt_data" in postdata) || !("contract_addr" in postdata)){
            res.write(http_param_err_json);
            res.end();
            return;
        }
    
        // TO DO : process event in cb map 
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


}