// natrium
// license : MIT
// author : Sean Chen

import { serviceworker } from "../service/serviceworker";
import { sessiondata } from "../session/sessiondatas";

export interface servicesession {

    readonly session_id:number;
    readonly session_key:string;

    readonly current_service:serviceworker;
    readonly datas:sessiondata;
}