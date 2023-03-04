// natrium
// license : MIT
// author : Sean Chen

import { session } from "../session/session";
import { serviceworker } from "./serviceworker";

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

    on_add_session(sid:number, skey:string):void;
    on_remove_session(sid:number):void;
    on_session_close(sid:number):void;

    on_service_task(command:string, data:object):void;

    on_broadcast_session_msg(command:string, data:object):void;
    on_session_message(sid:number, command:string, data:object):void;

    //on_session_rpc_sync(sid:number, cmd:string, data:any):any;

    on_service_update():void;
}

// export abstract class service_base implements service {

// }

export class natrium_services {
    
    protected static _serviceTypeMap:Map<string, ()=>service> = new Map<string, any>();
    protected static _workerMap:Map<string, serviceworker> = new Map<string, serviceworker>();

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

    public static make_service_uname(service_name:string, service_index:number):string {
        return `${service_name}_${service_index}`;
    }
    
    public static add_worker(w:serviceworker):void {
        this._workerMap.set(this.make_service_uname(w.service_name, w.service_index), w);
    }

    public static get_worker(service_uname:string):serviceworker|undefined {
        return this._workerMap.get(service_uname);
    }
}