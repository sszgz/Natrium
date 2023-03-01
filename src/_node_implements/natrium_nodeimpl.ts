// natrium
// license : MIT
// author : Sean Chen

import { inatrium } from "../interface/inatrium";
import { wsconnecter, wsconnecter_handler } from "../interface/network/wsconnecter";
import { wslistener, wslistener_handler } from "../interface/network/wslistener";
import { packetcodec } from "../interface/protocol/packetcodec";
import { servicemgr } from "../interface/service/servicemgr";
import { sessionmgr } from "../interface/session/sessionmgr";
import { sys } from "../interface/sys/sys";
import { debug_logger_nodeimpl } from "./debug/debug_logger_nodeimpl";
import { wsconnecter_nodeimpl } from "./network/wsconnecter_nodeimpl";
import { wslistener_nodeimpl } from "./network/wslistener_nodeimpl";
import { packetcodec_nodeimpl } from "./protocol/packetcodec_nodeimpl";
import { servicemgr_nodeimpl } from "./service/servicemgr_nodeimpl";
import { sessionmgr_nodeimpl } from "./session/sessionmgr_nodeimpl";
import { sys_nodeimpl } from "./sys/sys_nodeimpl";

export class natrium_nodeimpl implements inatrium  {

    static readonly impl:natrium_nodeimpl = new natrium_nodeimpl();

    _dbg_logger:debug_logger_nodeimpl = new debug_logger_nodeimpl();
    _sys:sys_nodeimpl = new sys_nodeimpl();

    constructor(){

    }

    get dbglog() {
        return this._dbg_logger;
    }
    get sys() {
        return this._sys;
    }

    create_wslistener(h:wslistener_handler, p:packetcodec):wslistener {
        return new wslistener_nodeimpl(h,p);
    }
    create_wsconnecter(h:wsconnecter_handler, p:packetcodec):wsconnecter {
        return new wsconnecter_nodeimpl(h, p);
    }

    create_packetcodec():packetcodec {
        return new packetcodec_nodeimpl();
    }
    
    create_servicemgr():servicemgr {
        return new servicemgr_nodeimpl();
    }
    create_sessionmgr():sessionmgr {
        return new sessionmgr_nodeimpl();
    }
}