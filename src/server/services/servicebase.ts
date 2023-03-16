
// natrium
// license : MIT
// author : Sean Chen

import * as path from 'path';
import { serviceconf } from "../../interface/config/configs";
import { datacomp } from '../../interface/data/datacomp';
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { service } from "../../interface/service/service";
import { servicesession } from "../../interface/service/servicesession";
import { msg_proc_func_map_type } from "../../interface/service/service_msgproc";
import { nat } from "../../natrium";
import { game } from "../gameframework/game";
import { player } from "../gameframework/player";

export abstract class servicebase implements service {
    
    protected _service_index:number = 0;
    protected _conf:serviceconf;
    protected _sessions:Map<number, servicesession> = new Map<number, servicesession>();
    protected _players:Map<number, player> = new Map<number, player>();

    protected _msg_procs:msg_proc_func_map_type = {};

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

    public async startup():Promise<boolean> {
        for(var i=0;i<this._conf.service_msgprocs.length; ++i){
            let procfile = this._conf.service_msgprocs[i];

            // require funcprocess file
            let procfunc = await import(path.resolve(__dirname, `../../../${procfile}`));
            for(var funcname in procfunc.procs){
                if(funcname in this._msg_procs) {
                    nat.dbglog.log(debug_level_enum.dle_error, `service:${this.service_name}:${this.service_index} startup msgproc:${funcname} from file:${procfile} already exist`);
                    continue;
                }
                this._msg_procs[funcname] = procfunc.procs[funcname];
            }
        }
        return true;
    }
    public async shutdown():Promise<boolean> {

        // TO DO : exit clear

        return true;
    }
    public async startshutingdown():Promise<boolean> {

        // clear sessions & save data
        let sessionids = new Array<number>();
        this._sessions.forEach((s)=>{
            sessionids.push(s.session_id);
        });

        // manully call on_session_close
        for(let i=0; i<sessionids.length; ++i){
            await this.on_session_close(sessionids[i]);
        }

        nat.dbglog.log(debug_level_enum.dle_system, `${this._conf.service_name}:${this._service_index} service shutingdown close:${sessionids.length} sessoins`);

        return true;
    }

    public get_session(sid:number):servicesession|undefined {
        return this._sessions.get(sid);
    }

    protected async _sync_playerdatas(new_pl:player):Promise<boolean> {

        return true;
    }

    public async create_player(ses:servicesession, datas:Array<datacomp>):Promise<player|null> {
        const new_pl = game.impl.create_player(ses, datas);
        let succ = await new_pl.init();
        if(!succ){
            return null;
        }
        await this._sync_playerdatas(new_pl);
        new_pl.prepare_behdata();
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
            this._players.delete(sid);
        }
        else {
            // err
            nat.dbglog.log(debug_level_enum.dle_error, `service:${this.service_name}:${this.service_index} on_remove_session sid:${sid} player not found`);
        }

        // don't clear nat.datas session data cache!

        // delete session
        this._sessions.delete(sid);
    }
    public async on_session_close(sid:number):Promise<void> {
        const pl = this._players.get(sid);
        if(pl != undefined) {
            await this._do_remove_player(pl);
            await pl.flush_data_to_dbobj(true);
            pl.fin();
            this._players.delete(sid);
        }
        else {
            // err
            nat.dbglog.log(debug_level_enum.dle_error, `service:${this.service_name}:${this.service_index} on_session_close sid:${sid} player not found`);
        }

        // clear nat.datas session cache
        this._do_clear_session(sid);

        // delete session
        this._sessions.delete(sid);
    }

    protected async _do_clear_session(sid:number):Promise<void> {

        let ses_base_data = await nat.datas.memcaches.session.read_data("base", sid, ".");
        if(ses_base_data != null) {
            // delete user ses data
            await nat.datas.del_user_sessionid(ses_base_data.uid);
        }

        // delete base session data
        await nat.datas.memcaches.session.delete_data("base", sid);
    }

    protected async _do_remove_player(pl:player):Promise<void> {

    }

    public async on_service_task(command:string, data:any):Promise<void> {

    }

    public async on_broadcast_session_msg(command:string, data:any):Promise<void> {

    }
    public async on_session_message(sid:number, command:string, data:any):Promise<void> {

        nat.dbglog.log(debug_level_enum.dle_debug, `on_session_message session ${sid} c:${command} d:${JSON.stringify(data)}`);

        const ses = this._sessions.get(sid);
        if(ses == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `on_session_message session ${sid} c:${command} d:${data}, session not exist`);
            return;
        }

        if(!(command in this._msg_procs)){
            nat.dbglog.log(debug_level_enum.dle_error, `on_session_message session ${sid} c:${command} d:${data}, unknown command`);
            return;
        }

        const pl = this._players.get(sid);

        await this._msg_procs[command](this, ses, pl, data);
    }

    //on_session_rpc_sync(sid:number, cmd:string, data:any):any;

    public async on_service_update():Promise<void> {

    }
}