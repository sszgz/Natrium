// natrium
// license : MIT
// author : Sean Chen

import { session } from "../session/session";
import { serviceconf } from "./service";

export interface servicechannel {

    dispatch_service_task(cmd:string, data:any):void;

    dispatch_session_msg(sid:number, cmd:string, data:any):void;
    brodcast_session_msg(cmd:string, data:any):void;
    
    session_rpc_sync(sid:number, cmd:string, data:any):any;

}

export interface serviceworker {
    
    readonly thread_id:number;
    readonly service_name:string;
    readonly service_index:number;
    readonly channel:servicechannel;

    start_service(c:serviceconf):boolean;
    finish_service():boolean;

    add_session(s:session):void;
    remove_session(s:session):void;
    on_session_close(s:session):void;
}