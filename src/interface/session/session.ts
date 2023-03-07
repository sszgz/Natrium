// natrium
// license : MIT
// author : Sean Chen

import { serviceworker } from "../service/serviceworker";

export interface session {

    readonly session_id:number;
    readonly session_key:string;

    readonly service_name:string;
    readonly service_index:number;

    readonly current_service:serviceworker|null;

    set_service(s:serviceworker|null):void;
}