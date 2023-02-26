// natrium
// license : MIT
// author : Sean Chen

import { session } from "../session/session";

export interface service {

    readonly service_name:string;
    readonly service_id:number;

    readonly session_count:number;

    get_session_byid(sid:number):session;
    get_session_bykey(skey:string):session;

    on_add_session(s:session):void;
    on_remove_session(s:session):void;
    on_session_close(s:session):void;

    on_session_message(s:session, command:string, data:object):void;

    on_service_update():void;

}