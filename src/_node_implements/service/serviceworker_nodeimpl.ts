// natrium
// license : MIT
// author : Sean Chen

import { serviceconf } from "../../interface/service/service";
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

    start_service(c:serviceconf):boolean {
        return true;
    }
    finish_service():boolean {
        return true;
    }

    add_session(s:session):void {

    }
    remove_session(s:session):void {

    }
    on_session_close(s:session):void {

    }
}