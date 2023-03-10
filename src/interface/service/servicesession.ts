// natrium
// license : MIT
// author : Sean Chen

import { sessiondata } from "../session/sessiondatas";
import { service } from "./service";

export interface servicesession {

    readonly session_id:number;
    readonly session_key:string;

    readonly current_service:service;
    readonly datas:sessiondata;
}