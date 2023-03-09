
// natrium
// license : MIT
// author : Sean Chen

import { serviceconf } from "../../interface/config/configs";
import { service } from "../../interface/service/service";
import { session } from "../../interface/session/session";
import { nat } from "../../natrium";

export abstract class servicebase implements service {
    
    protected _service_index:number = 0;
    protected _conf:serviceconf;
    protected _sessions:Map<number, session> = new Map<number, session>();

    constructor(c:serviceconf) {
        this._conf = c;
    }

    public get thread_id() {
        return process.pid;
    }
    public get service_name() {
        return this._conf.service_name;
    }
    public get service_index() {
        return this._service_index;
    }
    public get session_count() {
        return this._sessions.size;
    }
    public get conf() {
        return this._conf;
    }

    public set_service_index(si:number):void {
        this._service_index = si;
    }

    public startup():boolean {
        return true;
    }
    public shutdown():boolean {
        return true;
    }

    public get_session(sid:number):session|undefined {
        return this._sessions.get(sid);
    }

    public on_add_session(sid:number, skey:string):void {
        this._sessions.set(sid, nat.create_session(sid, skey, this.service_name, this.service_index));
    }
    public on_remove_session(sid:number):void {
        this._sessions.delete(sid);
    }
    public on_session_close(sid:number):void {

    }

    public on_service_task(command:string, data:object):void {

    }

    public on_broadcast_session_msg(command:string, data:object):void {

    }
    public on_session_message(sid:number, command:string, data:object):void {

    }

    //on_session_rpc_sync(sid:number, cmd:string, data:any):any;

    public on_service_update():void {

    }
}