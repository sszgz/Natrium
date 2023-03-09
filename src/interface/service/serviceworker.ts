// natrium
// license : MIT
// author : Sean Chen

import { serviceconf } from "../config/configs";
import { session } from "../session/session";

export interface servicechannel {

    dispatch_service_task(cmd:string, data:any):void;

    dispatch_session_msg(sid:number, cmd:string, data:any):void;
    brodcast_session_msg(cmd:string, data:any):void;
    
    //session_rpc_sync(sid:number, cmd:string, data:any):any;

}

export interface serviceworker {
    
    readonly thread_id:number;
    readonly service_name:string;
    readonly service_index:number;
    readonly channel:servicechannel;

    set_service_index(si:number):void;

    start_service(c:serviceconf):Promise<boolean>;
    finish_service():Promise<boolean>;

    add_session(s:session):void;
    remove_session(s:session):void;
    on_session_close(s:session):void;
}