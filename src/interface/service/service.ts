// natrium
// license : MIT
// author : Sean Chen

import { session } from "../session/session";

export interface serviceconf {
    readonly service_name:string;
}

export interface service {

    readonly thread_id:number;

    readonly service_name:string;
    readonly service_index:number;

    readonly session_count:number;

    readonly conf:serviceconf;

    set_service_index(si:number):void;

    startup():boolean;
    shutdown():boolean;

    get_session(sid:number):session;

    on_add_session(s:session):void;
    on_remove_session(s:session):void;
    on_session_close(s:session):void;

    on_service_task(command:string, data:object):void;

    on_broadcast_session_msg(command:string, data:object):void;
    on_session_message(s:session, command:string, data:object):void;

    on_session_rpc_sync(sid:session, cmd:string, data:any):any;

    on_service_update():void;
}

// export abstract class service_base implements service {

// }

export class natrium_services {
    
    protected static _serviceTypeMap:Map<string, ()=>service> = new Map<string, any>();

    public static register(name:string, serviceCtor:()=>service):void {
        natrium_services._serviceTypeMap.set(name, serviceCtor);
    }

    public static create_service(name:string):service|null {
        let ctor = natrium_services._serviceTypeMap.get(name);
        if(ctor == undefined) {
            return null;
        }
        return ctor();
    }
    
}