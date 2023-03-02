// natrium
// license : MIT
// author : Sean Chen

import { isMainThread, Worker, MessageChannel, workerData, parentPort } from "node:worker_threads";
import { debug_level_enum } from "../../interface/debug/debug_logger";

import { natrium_services, service, serviceconf } from "../../interface/service/service";
import { servicechannel, serviceworker } from "../../interface/service/serviceworker";
import { session } from "../../interface/session/session";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { session_nodeimpl } from "../session/session_nodeimpl";

export class servicechannel_nodeimpl implements servicechannel {


    public dispatch_service_task(cmd:string, data:any):void {

    }

    public dispatch_session_msg(sid:number, cmd:string, data:any):void {

    }
    public brodcast_session_msg(cmd:string, data:any):void {

    }
    
    public session_rpc_sync(sid:number, cmd:string, data:any):any {

    }
}

export class serviceworker_nodeimpl implements serviceworker {

    protected _thread_id:number = 0;
    protected _service_name:string = "";
    protected _service_index:number = 0;
    protected _channel:servicechannel_nodeimpl = new servicechannel_nodeimpl();

    protected _worker_thread:null|Worker = null;

    public get thread_id() {
        return this._thread_id;
    }
    public get service_name() {
        return this._service_name;
    }
    public get service_index() {
        return this._service_index;
    }
    public get channel() {
        return this._channel;
    }

    public set_service_index(i:number):void {
        this._service_index = i;
    }

    public start_service(c:serviceconf):boolean {
        this._worker_thread = new Worker(__filename, {
            workerData:{
                conf:c,
                si:this._service_index
            },
            // resourceLimits:{
            //     maxYoungGenerationSizeMb:,
            //     maxOldGenerationSizeMb:,
            //     codeRangeSizeMb:,
            //     stackSizeMb:
            // }
        });

        this._service_name = c.service_name;
        this._thread_id = this._worker_thread.threadId;

        let thisptr = this;

        this._worker_thread.on('message', (msg)=>{
            thisptr._on_worker_msg(msg);
        });
        this._worker_thread.on('messageerror', (err)=>{
            thisptr._on_worker_error(err);
        });
        this._worker_thread.on('error', (err)=>{
            thisptr._on_worker_error(err);
        });
        this._worker_thread.on('exit', (code) => {
            if (code !== 0){
                thisptr._on_worker_error(new Error(`Worker stopped with exit code ${code}`));
            }
            else {
                thisptr._on_worker_exit(code);
            }
        });

        return true;
    }
    public finish_service():boolean {

        // wait worker exit

        // TO DO : off _worker_thread listener

        return true;
    }

    public add_session(s:session):void {

    }
    public remove_session(s:session):void {

    }
    public on_session_close(s:session):void {

    }

    protected _on_worker_msg(msg:any){

    }
    protected _on_worker_error(err:Error){

    }
    protected _on_worker_exit(exitCode: number){

    }
}

enum _woker_cmds {
    wc_add_session = 1,
    wc_rmv_session = 2,
    wc_close_session = 3,
    wc_msg = 4,
    wc_rpc_sync = 5,
    wc_service_task = 6,
    wc_bcast_msg = 7,
    wc_exit = 8
}

class _worker_thread {

    protected _service:service;

    constructor(s:service){
        this._service = s;
    }

    public start_up():void{
        this._service.startup();
    }
    public shut_down():void{
        this._service.shutdown();
    }

    public on_add_session(sid:number, skey:string):void{
        this._service.on_add_session(new session_nodeimpl(sid, skey, this._service.service_name, this._service.service_index));
    }
    public on_remove_session(sid:number):void{
        
    }
    public on_session_close(sid:number):void{

    }

    public on_service_task(command:string, data:object):void{

    }

    public on_broadcast_session_msg(command:string, data:object):void{

    }
    public on_session_message(sid:number, command:string, data:object):void{

    }

    public on_session_rpc_sync(sid:number, cmd:string, data:any):any{

    }

    public on_service_update():void{

    }

}

function _worker_routine() {

    let conf:serviceconf = workerData.conf;
    let service_index:number = workerData.si;

    if(parentPort == null) {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_worker_routine service:${conf.service_name} parent port null`);
        return;
    }

    let service = natrium_services.create_service(conf.service_name);
    if(service == null) {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_worker_routine service:${conf.service_name} class not exist`);
        return;
    }
    service.set_service_index(service_index);

    let worker_thread = new _worker_thread(service);

    worker_thread.start_up();
    
    let on_msg = (data:any)=>{
        switch(data.cmd){
            case _woker_cmds.wc_msg:
                worker_thread.on_session_message(data.sid, data.command, data.data);
                break;
            case _woker_cmds.wc_add_session:
                worker_thread.on_add_session(data.sid, data.skey);
                break;
            case _woker_cmds.wc_rmv_session:
                worker_thread.on_remove_session(data.sid);
                break;
            case _woker_cmds.wc_service_task:
                worker_thread.on_service_task(data.command, data.data);
                break;
            case _woker_cmds.wc_bcast_msg:
                worker_thread.on_broadcast_session_msg(data.command, data.data);
                break;
            case _woker_cmds.wc_rpc_sync:
                worker_thread.on_session_rpc_sync(data.sid, data.command, data.data);
                break;
            case _woker_cmds.wc_close_session:
                worker_thread.on_session_close(data.sid);
                break;
            case _woker_cmds.wc_exit:
                {
                    worker_thread.shut_down();
                    
                    // exit;
                    process.exit(0);
                }
                break;
        }
    }

    parentPort.on("close", ()=>{
        worker_thread.shut_down();
        
        // exit;
        process.exit(0);
    });
    parentPort.on("messageerror", (err)=>{

    });
    parentPort.on("message", on_msg);
}

if(!isMainThread) {
    // worker initialize
    _worker_routine();
}