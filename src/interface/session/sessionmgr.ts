// natrium
// license : MIT
// author : Sean Chen

import { session } from "./session";

export interface sessionmgr {

    readonly session_count:number;

    add_session(sid:number, skey:string):session;
    remove_session(sid:number):void;

    get_session_by_sid(sid:number):session|undefined;
    get_session_by_skey(skey:string):session|undefined;
}