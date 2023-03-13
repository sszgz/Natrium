// natrium
// license : MIT
// author : Sean Chen

import { service } from "../../interface/service/service";
import { servicesession } from "../../interface/service/servicesession";
import { _Node_SessionContext } from "../_node/_thread_contexts";

export class servicesession_nodeimpl implements servicesession {

    protected _session_id:number;
    protected _session_key:string;

    protected _current_service:service;

    constructor(sid:number, sk:string, s:service) {
        this._session_id = sid;
        this._session_key = sk;
        this._current_service = s;
    }

    public get session_id() {
        return this._session_id;
    }
    public get session_key() {
        return this._session_key;
    }

    public get current_service() {
        return this._current_service;
    }
    
    public changeservice(tosn:string, tosi:number):void {
        _Node_SessionContext.changeService(this._session_id, tosn, tosi);
    }
}