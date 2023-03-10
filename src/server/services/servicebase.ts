
// natrium
// license : MIT
// author : Sean Chen

import { serviceconf } from "../../interface/config/configs";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { service } from "../../interface/service/service";
import { servicesession } from "../../interface/service/servicesession";
import { session } from "../../interface/session/session";
import { nat } from "../../natrium";
import { game } from "../gameframework/game";
import { player } from "../gameframework/player";

export abstract class servicebase implements service {
    
    protected _service_index:number = 0;
    protected _conf:serviceconf;
    protected _sessions:Map<number, servicesession> = new Map<number, servicesession>();
    protected _players:Map<number, player> = new Map<number, player>();

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

    public get_session(sid:number):servicesession|undefined {
        return this._sessions.get(sid);
    }

    protected async _create_player(ses:servicesession):Promise<player|null> {

        const new_pl = game.impl.create_player(ses);
        const succ = await new_pl.init();
        if(!succ){
            return null;
        }
        await new_pl.sync_data_from_dbobj();
        this._players.set(ses.session_id, new_pl);

        return new_pl;
    }

    public async on_add_session(sid:number, skey:string):Promise<servicesession> {
        const ses = nat.create_servicesession(sid, skey, this);
        this._sessions.set(sid, ses);
        
        return ses;
    }
    public async on_remove_session(sid:number):Promise<void> {
        const pl = this._players.get(sid);
        if(pl != undefined) {
            await this._do_remove_player(pl);
            await pl.flush_data_to_dbobj(false);
            pl.fin();
        }
        else {
            // err
            nat.dbglog.log(debug_level_enum.dle_error, `service:${this.service_name}:${this.service_index} on_remove_session sid:${sid} player not found`);
        }

        this._sessions.delete(sid);
    }
    public async on_session_close(sid:number):Promise<void> {
        const pl = this._players.get(sid);
        if(pl != undefined) {
            await this._do_remove_player(pl);
            await pl.flush_data_to_dbobj(true);
            pl.fin();
        }
        else {
            // err
            nat.dbglog.log(debug_level_enum.dle_error, `service:${this.service_name}:${this.service_index} on_session_close sid:${sid} player not found`);
        }

        this._sessions.delete(sid);
    }

    protected async _do_remove_player(pl:player):Promise<void> {

    }

    public async on_service_task(command:string, data:any):Promise<void> {

    }

    public async on_broadcast_session_msg(command:string, data:any):Promise<void> {

    }
    public async on_session_message(sid:number, command:string, data:any):Promise<void> {

    }

    //on_session_rpc_sync(sid:number, cmd:string, data:any):any;

    public async on_service_update():Promise<void> {

    }
}