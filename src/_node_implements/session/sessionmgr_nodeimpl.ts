// natrium
// license : MIT
// author : Sean Chen

import { debug_level_enum } from "../../interface/debug/debug_logger";
import { session } from "../../interface/session/session";
import { sessiondata } from "../../interface/session/sessiondatas";
import { sessionmgr } from "../../interface/session/sessionmgr";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { sessiondata_nodeimpl } from "./sessiondata_nodeimpl";
import { session_nodeimpl } from "./session_nodeimpl";

export class sessionmgr_nodeimpl implements sessionmgr {

    protected _sessionmap:Map<number, session_nodeimpl> = new Map<number, session_nodeimpl>();
    protected _sessionkeymap:Map<string, session_nodeimpl> = new Map<string, session_nodeimpl>();

    public get session_count() {
        return this._sessionmap.size;
    }

    public add_session(sid:number, skey:string):session {

        let s = this._sessionmap.get(sid);
        if(s != undefined){
            return s;
        }

        s = this._sessionkeymap.get(skey);
        if(s != undefined){
            // err
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `add_session session:${sid} not exist but skey:${skey} exist`);
            this._sessionkeymap.delete(skey);
        }

        s = new session_nodeimpl(sid, skey, "",0);

        this._sessionmap.set(sid, s);
        this._sessionkeymap.set(skey, s);

        return s;
    }
    public remove_session(sid:number):void {
        let s = this._sessionmap.get(sid);
        if(s == undefined){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `remove_session session:${sid} not exist`);
            return;
        }

        this._sessionkeymap.delete(s.session_key);
        this._sessionmap.delete(sid);
    }

    public get_session_by_sid(sid:number):session|undefined {
        return this._sessionmap.get(sid);
    }
    public get_session_by_skey(skey:string):session|undefined {
        return this._sessionkeymap.get(skey);
    }

    public get_sessiondata_bysid(sid:number):sessiondata|undefined {
        // TO DO : session data
        return undefined;
    }
}