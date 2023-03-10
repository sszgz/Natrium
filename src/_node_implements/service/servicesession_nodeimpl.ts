// natrium
// license : MIT
// author : Sean Chen

import { service } from "../../interface/service/service";
import { servicesession } from "../../interface/service/servicesession";
import { sessiondata } from "../../interface/session/sessiondatas";
import { sessiondata_nodeimpl } from "../session/sessiondata_nodeimpl";

export class servicesession_nodeimpl implements servicesession {

    protected _session_id:number;
    protected _session_key:string;

    protected _current_service:service;
    protected _datas:sessiondata;

    constructor(sid:number, sk:string, s:service) {
        this._session_id = sid;
        this._session_key = sk;
        this._current_service = s;

        this._datas = new sessiondata_nodeimpl(sid);
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
    public get datas() {
        return this._datas;
    }
}