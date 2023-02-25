// natrium
// license : MIT
// author : Sean Chen

interface service {

    service_name:string;
    service_id:number;

    session_count:number;

    get_session_byid(sid:number):session;
    get_session_bykey(skey:string):session;

    on_add_session(s:session):void;
    on_remove_session(s:session):void;
    on_session_close(s:session):void;

    on_session_message(s:session, command:string, data:object):void;

    on_service_update():void;

}