// natrium
// license : MIT
// author : Sean Chen

import { session } from "../../interface/session/session";

export class session_nodeimpl implements session {
    
    protected _session_id:number = 0;
    protected _session_key:string = "";

    protected _service_name:string = "";
    protected _service_index:number = 0;

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
    
    public set_service(service_name:string, service_index:number):void {
        this._service_name = service_name;
        this._service_index = service_index;
    }
}