// natrium
// license : MIT
// author : Sean Chen

import { session } from "../session/session";

export namespace natrium_services {
    
}

export interface serviceconf {
    readonly service_name:string;
}

export interface service {

    readonly thread_id:number;

    readonly service_name:string;
    readonly service_index:number;

    readonly session_count:number;

    readonly conf:serviceconf;

    startup():boolean;
    shutdown():boolean;

    get_session(sid:number):session;

    on_add_session(s:session):void;
    on_remove_session(s:session):void;
    on_session_close(s:session):void;

    on_service_task(command:string, data:object):void;

    on_broadcast_session_msg(command:string, data:object):void;
    on_session_message(s:session, command:string, data:object):void;

    on_session_rpc_sync(sid:number, cmd:string, data:any):any;

    on_service_update():void;
}

// export class service_base implements service {

// }