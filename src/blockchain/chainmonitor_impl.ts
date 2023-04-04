// // natrium
// // license : MIT
// // author : Sean Chen

// import { nat } from "..";
// import { chainmonitor, transaction_like } from "../interface/blockchain/chainmonitor";
// import { debug_level_enum } from "../interface/debug/debug_logger";
// import { httplistener, httplistener_handler, httpmsgproc_map_type, httpmsgproc_type, http_request_like, http_response_like } from "../interface/network/httplistener";
// import { get_batch_block_transaction, get_batch_transaction_receipt, get_block_number, get_block_transaction, get_transaction_receipt } from "./chainmonitor_rpc";
// import { ethers } from "ethers";
// import { http_interal_json, http_param_err_json, http_unknown_cmd_json } from "../server/gameframework/msgs/httpmsgs";

// export class chainmonitor_impl implements chainmonitor, httplistener_handler {
    
//     readonly chainId:number; // TO DO : from config
//     readonly chainType:string;  // TO DO : from config
//     readonly rpchost:string = "https://testchain.dreamidols.app";  // TO DO : rom config
    
//     protected provider: ethers.Provider
//     protected contractMap: Map<string, ethers.BaseContract>;
//     protected eventMap: Map<string, string[]>;
//     protected callbackMap: Map<string, string>;
//     protected chainHeight: number;
//     protected handleHeight: number = 1329900;
//     protected transactionQueue: string[] = []
//     protected isPushPaused: boolean = false;
//     protected callbackQueue: any[] = []

//     protected _httplistener:httplistener|null = null;
//     protected _httpmsgprocs:httpmsgproc_map_type = {};

//     constructor() {
//     }

//     public get httplistener() {
//         return this._httplistener;
//     }
    

//     public on(contract_addr:string, event:string, cb: (this:chainmonitor, ...args) => void) {
//         // add cb
//         const lcontract_addr = contract_addr.toLocaleLowerCase()
//         if (this.eventMap == null) this.eventMap = new Map<string, string[]>()
//         if (this.eventMap.has(lcontract_addr)) {
//             const events = this.eventMap.get(lcontract_addr);
//             if(!events.includes(event)) {
//                 events.push(event)
//                 this.eventMap.set(lcontract_addr, events);
//             }
//         }else {
//             const events = [event]
//             this.eventMap.set(lcontract_addr, events)
//         }
//     }
//     public off(contract_addr:string, event:string, cb: (this:chainmonitor, ...args) => void) {
//         // delete cb
//     }

//     public async register_event_monitor(contract_addr:string, event:string) : Promise<void> {
//         // TO DO : call chainmonitor_server reg_evt_mon
//     }

//     public async get_transaction_byhash(hash:string):Promise<transaction_like | null> {
//         // TO DO : call chainmonitor_server reg_evt_mon

//         return null;
//     }

//     public async startup(configfile:string) {
        
//         // init config
//         nat.conf.init(configfile)

//         const contractsAbi = nat.conf.get_contractconf();
//         const contractAddrs = contractsAbi.get_contract_addrs()
//         this.provider = new ethers.JsonRpcProvider(this.rpchost, this.chainId)

//         // create map
//         this.contractMap = new Map<string, ethers.BaseContract>()
//         for (let i = 0; i < contractAddrs.length; i++) {
//             const contractconf = contractsAbi.get_contract_conf(contractAddrs[i].toLocaleLowerCase())
//             const contract = new ethers.Contract(contractAddrs[i].toLocaleLowerCase(), contractconf, this.provider)
//             this.contractMap.set(contractAddrs[i].toLocaleLowerCase(), contract)
//         }

//         // init session mgr

//         // reg http msg
//         this.reg_httpmsg_proc("/event_cb", this._on_event_cb);

//         // start up http listener
//         this._httplistener = nat.create_httplistener(this);

//         // update height
//         setInterval(async () => {
//             this.chainHeight = await get_block_number();
//         }, 1000);

//         // find transaction with event
//         setInterval(async () => {
//             console.log(`handleHeight `, this.handleHeight)
//             const handleHeight = this.handleHeight
//             const currHeight = this.chainHeight;
//             if (handleHeight < currHeight) {
//                 if ((currHeight - handleHeight) >= 10) {
//                     const blocks = []
//                     for (let i = 0; i < 10; i++) {
//                         blocks.push(handleHeight+i)
//                     }
//                     const blocksInfo = await get_batch_block_transaction(blocks)
//                     if (blocksInfo != null && blocksInfo.length > 0) {
//                         for (let i = 0; i < blocksInfo.length; i++) {
//                             for (let j = 0; j < blocksInfo[i].transactions.length; j++) {
//                                 this.transactionQueue.push(blocksInfo[i].transactions[j].hash);
//                             }
//                         }
//                     }
//                     this.handleHeight+=10;
//                 } else {
//                     // 分配处理块高
//                     const blockInfo = await get_block_transaction(this.handleHeight);
//                     if (blockInfo != null && blockInfo.transactions != null && blockInfo.transactions.length > 0) {
//                         for (let i = 0; i < blockInfo.transactions.length; i++) {
//                             this.transactionQueue.push(blockInfo.transactions[i].hash);
//                         }
//                     }
//                     this.handleHeight++;
//                 }
//             }
//         }, 1000);

//         setInterval(async () => {
//             if (this.transactionQueue != null && this.transactionQueue.length > 0) {
//                 const receipt = await get_batch_transaction_receipt(this.transactionQueue.splice(0, 10));
//                 if (receipt != null && receipt.length > 0) {
//                     for (let i = 0; i < receipt.length; i++) {
//                         for (let j = 0; j < receipt[i].logs.length; j++) {
//                             console.log(`address in eventMap`, this.eventMap.has(receipt[i].logs[j].address.toLocaleLowerCase()))
//                             if (this.eventMap.has(receipt[i].logs[j].address.toLocaleLowerCase())) {
//                                 const contract:ethers.BaseContract = this.contractMap.get(receipt[i].logs[j].address.toLocaleLowerCase())
//                                 console.log(`receipt `, contract.interface.parseLog(receipt[i].logs[j]));
//                             }
//                         }
//                     }
//                 }
//             }
//         }, 1000);

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
//     public async _on_event_cb(req:http_request_like, res:http_response_like):Promise<void> {
//         if(req.postdata == undefined){
//             res.write(http_param_err_json);
//             res.end();
//             return;
//         }
//         let postdata = JSON.parse(req.postdata);
//         if(!("evt_name" in postdata) || !("evt_data" in postdata) || !("contract_addr" in postdata) || !("cb_url" in postdata)){
//             res.write(http_param_err_json);
//             res.end();
//             return;
//         }

//         if(this.callbackMap == null) this.callbackMap = new Map<string, string>()
//         this.callbackMap.set(postdata.contract_addr+"_"+postdata.evt_name, postdata.cb_url);
//         console.log(`callback map `, this.callbackMap)
//     }

//     public reg_httpmsg_proc(cmd:string, proc:httpmsgproc_type):void {
//         if(cmd in this._httpmsgprocs){
//             nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server register http msg proc [${cmd} already exist]`);
//             return;
//         }
//         this._httpmsgprocs[cmd] = proc;
//     }
//     public open_httplistener(host:string, port:number) {
//         if(this._httplistener == null){
//             nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server open httplistener when _httplistener is null`);
//             return;
//         }
        
//         // TO DO : use config
//         this._httplistener.start(host, port);
//     }
    
//     async on_request(req:http_request_like, res:http_response_like):Promise<void> {
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
//             nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server on http request ${req.url} exception:${err.message}\r\n ${err.stack}`);
//             res.write(http_interal_json);
//             res.end();
//         }
//     }

//     async push(item) {
//         this.callbackQueue.push(item);
//         this.process_cb()
//     }

//     async process_cb() {
//         if(this.isPushPaused) {
//             return;
//         }

//         while(this.callbackQueue.length > 0) {
//             const item = this.callbackQueue[0];
//             try {
//                 await this.pushItem(item)
//                 this.callbackQueue.shift()
//             } catch (error) {
//                 nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server on process_cb exception:${error}`);
//                 this.isPushPaused = true;
//                 break;
//             }
//         }
//     }

//     async pushItem(item) {

//     }

//     resume() {
//         this.isPushPaused = false;
//         this.process_cb()
//     }
// }