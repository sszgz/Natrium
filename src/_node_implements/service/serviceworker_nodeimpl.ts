// natrium
// license : MIT
// author : Sean Chen

import { isMainThread, Worker, MessageChannel, workerData, parentPort } from "node:worker_threads";

import { natrium_services, serviceconf } from "../../interface/service/service";
import { servicechannel, serviceworker } from "../../interface/service/serviceworker";
import { session } from "../../interface/session/session";

export class servicechannel_nodeimpl implements servicechannel {


    dispatch_service_task(cmd:string, data:any):void {

    }

    dispatch_session_msg(sid:number, cmd:string, data:any):void {

    }
    brodcast_session_msg(cmd:string, data:any):void {

    }
    
    session_rpc_sync(sid:number, cmd:string, data:any):any {

    }
}

export class serviceworker_nodeimpl implements serviceworker {

    _thread_id:number = 0;
    _service_name:string = "";
    _service_index:number = 0;
    _channel:servicechannel_nodeimpl = new servicechannel_nodeimpl();

    _worker_thread:null|Worker = null;

    get thread_id() {
        return this._thread_id;
    }
    get service_name() {
        return this._service_name;
    }
    get service_index() {
        return this._service_index;
    }
    get channel() {
        return this._channel;
    }

    set_service_index(i:number):void {
        this._service_index = i;
    }

    start_service(c:serviceconf):boolean {
        this._worker_thread = new Worker(__filename, {workerData:c});

        this._service_name = c.service_name;
        this._thread_id = this._worker_thread.threadId;

        let thisptr = this;

        this._worker_thread.on('message', (msg)=>{
            thisptr._on_worker_msg(msg);
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
    finish_service():boolean {

        // wait worker exit

        // TO DO : off _worker_thread listener

        return true;
    }

    add_session(s:session):void {

    }
    remove_session(s:session):void {

    }
    on_session_close(s:session):void {

    }

    _on_worker_msg(msg:any){

    }
    _on_worker_error(err:Error){

    }
    _on_worker_exit(exitCode: number){

    }
}

class _worker_thread {

}

if(!isMainThread) {
    // worker initialize

    let conf:serviceconf = workerData;
    // new (<any>natrium_services)[conf.service_name]();

}