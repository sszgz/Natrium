// natrium
// license : MIT
// author : Sean Chen

import { session } from "../../interface/session/session";
import { sessiondata } from "../../interface/session/sessiondatas";
import { sessionmgr } from "../../interface/session/sessionmgr";
import { sessiondata_nodeimpl } from "./sessiondata_nodeimpl";
import { session_nodeimpl } from "./session_nodeimpl";

export class sessionmgr_nodeimpl implements sessionmgr {

    protected _session_count:number = 0;

    public get session_count() {
        return this._session_count;
    }

    public add_session(sid:number):session {
        return new session_nodeimpl(0,"","",0);
    }
    public remove_session(sid:number):void {

    }

    public get_session_by_sid(sid:number):session {
        return new session_nodeimpl(0,"","",0);
    }
    public get_session_by_skey(skey:string):session {
        return new session_nodeimpl(0,"","",0);

    }

    public get_sessiondata_bysid(sid:number):sessiondata {
        return new sessiondata_nodeimpl();
    }

}