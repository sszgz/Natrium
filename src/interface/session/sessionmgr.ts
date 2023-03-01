// natrium
// license : MIT
// author : Sean Chen

import { session } from "./session";
import { sessiondata } from "./sessiondatas";

export interface sessionmgr {

    readonly session_count:number;

    add_session(sid:number):session;
    remove_session(sid:number):void;

    get_session_by_sid(sid:number):session;
    get_session_by_skey(skey:string):session;

    get_sessiondata_bysid(sid:number):sessiondata;
}