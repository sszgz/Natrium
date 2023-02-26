// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "../data/dataobj";
import { service } from "../service/service";

export interface session {

    readonly session_id:number;
    readonly session_key:string;

    readonly service:null|service;

    session_data:Map<string, dataobj>;
}