// natrium
// license : MIT
// author : Sean Chen

import { inatrium } from "../interface/inatrium";
import { wsconnecter, wsconnecter_handler } from "../interface/network/wsconnecter";
import { wslistener, wslistener_handler } from "../interface/network/wslistener";
import { packetcodec } from "../interface/protocol/packetcodec";
import { sys } from "../interface/sys/sys";
import { debug_logger_nodeimpl } from "./debug/debug_logger_nodeimpl";
import { wsconnecter_nodeimpl } from "./network/wsconnecter_nodeimpl";
import { wslistener_nodeimpl } from "./network/wslistener_nodeimpl";
import { packetcodec_nodeimpl } from "./protocol/packetcodec_nodeimpl";
import { sys_nodeimpl } from "./sys/sys_nodeimpl";

export class natrium_nodeimpl implements inatrium  {

    static readonly impl:natrium_nodeimpl = new natrium_nodeimpl();

    _dbg_logger:debug_logger_nodeimpl = new debug_logger_nodeimpl();
    _sys:sys_nodeimpl = new sys_nodeimpl();
    _pktcodec:packetcodec_nodeimpl = new packetcodec_nodeimpl();

    constructor(){

    }

    get dbglog() {
        return this._dbg_logger;
    }
    get sys() {
        return this._sys;
    }
    get pktcodec() {
        return this._pktcodec;
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
}