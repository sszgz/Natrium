// natrium
// license : MIT
// author : Sean Chen

import { configs } from "./config/configs";
import { datahub } from "./data/datahub";
import { debug_logger } from "./debug/debug_logger";
import { httpconnecter } from "./network/httpconnecter";
import { httplistener, httplistener_handler } from "./network/httplistener";
import { wsconnecter, wsconnecter_handler } from "./network/wsconnecter";
import { wslistener, wslistener_handler } from "./network/wslistener";
import { packetcodec } from "./protocol/packetcodec";
import { service } from "./service/service";
import { servicesession } from "./service/servicesession";
import { serviceworker } from "./service/serviceworker";
import { sessionmgr } from "./session/sessionmgr";
import { sys } from "./sys/sys";

export interface inatrium {

    readonly dbglog:debug_logger;
    readonly sys:sys;
    readonly conf:configs;
    readonly datas:datahub;

    create_httplistener(h:httplistener_handler):httplistener;
    create_httpconnecter(usehttps:boolean):httpconnecter;

    create_wslistener(h:wslistener_handler, p:packetcodec):wslistener;
    create_wsconnecter(h:wsconnecter_handler, p:packetcodec):wsconnecter;

    create_packetcodec():packetcodec;

    create_servicesession(sid:number, skey:string, s:service):servicesession;
    create_sessionmgr():sessionmgr;
    
    create_serviceworker():serviceworker;
}