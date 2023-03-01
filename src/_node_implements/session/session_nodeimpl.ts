// natrium
// license : MIT
// author : Sean Chen

import { session } from "../../interface/session/session";

export class session_nodeimpl implements session {
    
    _session_id:number = 0;
    _session_key:string = "";

    _service_name:string = "";
    _service_index:number = 0;

    get session_id() {
        return this._session_id;
    }
    get session_key() {
        return this._session_key;
    }

    get service_name() {
        return this._service_name;
    }
    get service_index() {
        return this._service_index;
    }
    
    send_message(cmd:string, data:any):void{

    }
}