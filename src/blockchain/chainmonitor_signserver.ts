// // natrium
// // license : MIT
// // author : Sean Chen

// import { ethers } from "ethers";
// import { debug_level_enum } from "../interface/debug/debug_logger";
// import { httplistener, httplistener_handler, httpmsgproc_map_type, httpmsgproc_type, http_request_like, http_response_like } from "../interface/network/httplistener";
// import { nat } from "../natrium";
// import { http_interal_json, http_unknown_cmd_json, on_signature } from "./chainmonitor_signserver_httpmsg";

// export class chainmonitor_signserver implements httplistener_handler {
//     protected _httplistener:httplistener|null = null;

//     protected _httpmsgprocs:httpmsgproc_map_type = {};

//     readonly chainId:number; // TO DO : from config
//     readonly chainType:string;  // TO DO : from config
//     readonly rpchost:string = "https://testchain.dreamidols.app";  // TO DO : rom config
//     protected provider: ethers.Provider
//     protected contractMap: Map<string, ethers.BaseContract>;
//     protected _wallet: ethers.Wallet

//     constructor() {
//     }

//     public get httplistener() {
//         return this._httplistener;
//     }

//     public async startup(configfile:string) {
        
//         // init session mgr

//         // reg http msg
//         this.reg_httpmsg_proc("/signature", on_signature);

//         // start up http listener
//         this._httplistener = nat.create_httplistener(this);

//         // listen on exit sig
//         let thisptr = this;
//         process.on('SIGINT', function() {
//             console.log("Caught interrupt signal");
        
//             // close all listener
//             thisptr._httplistener?.shutdown();

//             // let allexit = false;
//             // while(!allexit){
//             //     allexit = true;
//             //     natrium_services.workers.forEach( (sw)=>{
//             //         if(!sw.exited){
//             //             allexit = false;
//             //         }
//             //     });
//             // }

//             console.log("shut down");

//             process.exit();
//         });
//     }

//     public reg_httpmsg_proc(cmd:string, proc:httpmsgproc_type):void {
//         if(cmd in this._httpmsgprocs){
//             nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_signserver register http msg proc [${cmd} already exist]`);
//             return;
//         }
//         this._httpmsgprocs[cmd] = proc;
//     }
//     public open_httplistener(host:string, port:number) {
//         if(this._httplistener == null){
//             nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_signserver open httplistener when _httplistener is null`);
//             return;
//         }
        
//         // TO DO : use config
//         this._httplistener.start(host, port);
//     }
    
//     public async on_request(req:http_request_like, res:http_response_like):Promise<void> {
//         if(req.url == undefined) {
//             res.write(http_unknown_cmd_json);
//             res.end();
//             return;
//         }
//         if(!(req.url in this._httpmsgprocs)){
//             res.write(http_unknown_cmd_json);
//             res.end();
//             return;
//         }
//         try{
//             await this._httpmsgprocs[req.url](req, res);
//         }
//         catch(e){
//             let err:Error = e as Error;
//             nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_signserver on http request ${req.url} exception:${err.message}\r\n ${err.stack}`);
//             res.write(http_interal_json);
//             res.end();
//         }
//     }
// }