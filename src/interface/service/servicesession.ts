// natrium
// license : MIT
// author : Sean Chen

import { service } from "./service";

export interface servicesession {

    readonly session_id:number;
    readonly session_key:string;

    readonly current_service:service;

    changeservice(tosn:string, tosi:number):void;
}