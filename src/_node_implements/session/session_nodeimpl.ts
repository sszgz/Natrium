// natrium
// license : MIT
// author : Sean Chen

import { service } from "../../interface/service/service";
import { serviceworker } from "../../interface/service/serviceworker";
import { session } from "../../interface/session/session";

export class session_nodeimpl implements session {
    
    protected _session_id:number = 0;
    protected _session_key:string = "";

    protected _service_name:string = "";
    protected _service_index:number = 0;
    
    protected _current_service:serviceworker|null = null;

    constructor(sid:number, skey:string, sn:string, si:number){
        this._session_id = sid;
        this._session_key = skey;
        this._service_name = sn;
        this._service_index = si;
    }

    public get session_id() {
        return this._session_id;
    }
    public get session_key() {
        return this._session_key;
    }

    public get service_name() {
        return this._service_name;
    }
    public get service_index() {
        return this._service_index;
    }
    public get current_service() {
        return this._current_service;
    }
    
    public set_service(s:serviceworker|null):void {
        if(s == null) {
            this._service_name = "";
            this._service_index = 0;
            this._current_service = null;
            return;
        }
        this._service_name = s.service_name;
        this._service_index = s.service_index;
        this._current_service = s;
    }
}