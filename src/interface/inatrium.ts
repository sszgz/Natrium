// natrium
// license : MIT
// author : Sean Chen

import { debug_logger } from "./debug/debug_logger";
import { wsconnecter, wsconnecter_handler } from "./network/wsconnecter";
import { wslistener, wslistener_handler } from "./network/wslistener";
import { packetcodec } from "./protocol/packetcodec";
import { serviceworker } from "./service/serviceworker";
import { session } from "./session/session";
import { sessionmgr } from "./session/sessionmgr";
import { sys } from "./sys/sys";

export interface inatrium {

    readonly dbglog:debug_logger;
    readonly sys:sys;

    create_wslistener(h:wslistener_handler, p:packetcodec):wslistener;
    create_wsconnecter(h:wsconnecter_handler, p:packetcodec):wsconnecter;

    create_packetcodec():packetcodec;

    create_session(sid:number, skey:string, sn:string, si:number):session;
    create_sessionmgr():sessionmgr;
    
    create_serviceworker():serviceworker;
}