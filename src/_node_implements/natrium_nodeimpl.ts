// natrium
// license : MIT
// author : Sean Chen

import { inatrium } from "../interface/inatrium";
import { wsconnecter, wsconnecter_handler } from "../interface/network/wsconnecter";
import { wslistener, wslistener_handler } from "../interface/network/wslistener";
import { packetcodec } from "../interface/protocol/packetcodec";
import { serviceworker } from "../interface/service/serviceworker";
import { session } from "../interface/session/session";
import { sessionmgr } from "../interface/session/sessionmgr";
import { sys } from "../interface/sys/sys";
import { configs_nodeimpl } from "./config/configs_nodeimpl";
import { debug_logger_nodeimpl } from "./debug/debug_logger_nodeimpl";
import { wsconnecter_nodeimpl } from "./network/wsconnecter_nodeimpl";
import { wslistener_nodeimpl } from "./network/wslistener_nodeimpl";
import { packetcodec_nodeimpl } from "./protocol/packetcodec_nodeimpl";
import { serviceworker_nodeimpl } from "./service/serviceworker_nodeimpl";
import { sessionmgr_nodeimpl } from "./session/sessionmgr_nodeimpl";
import { session_nodeimpl } from "./session/session_nodeimpl";
import { sys_nodeimpl } from "./sys/sys_nodeimpl";

export class natrium_nodeimpl implements inatrium  {

    public static readonly impl:natrium_nodeimpl = new natrium_nodeimpl();

    protected _dbg_logger:debug_logger_nodeimpl = new debug_logger_nodeimpl();
    protected _sys:sys_nodeimpl = new sys_nodeimpl();
    protected _conf:configs_nodeimpl = new configs_nodeimpl();

    constructor(){

    }

    public get dbglog() {
        return this._dbg_logger;
    }
    public get sys() {
        return this._sys;
    }
    public get conf() {
        return this._conf;
    }

    public create_wslistener(h:wslistener_handler, p:packetcodec):wslistener {
        return new wslistener_nodeimpl(h,p);
    }
    public create_wsconnecter(h:wsconnecter_handler, p:packetcodec):wsconnecter {
        return new wsconnecter_nodeimpl(h, p);
    }

    public create_packetcodec():packetcodec {
        return new packetcodec_nodeimpl();
    }
    
    public create_session(sid:number, skey:string, sn:string, si:number):session {
        return new session_nodeimpl(sid, skey, sn, si);
    }
    public create_sessionmgr():sessionmgr {
        return new sessionmgr_nodeimpl();
    }

    public create_serviceworker():serviceworker {
        return new serviceworker_nodeimpl();
    }
}