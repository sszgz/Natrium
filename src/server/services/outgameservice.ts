// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../..";
import { serviceconf } from "../../interface/config/configs";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_services } from "../../interface/service/service";
import { servicesession } from "../../interface/service/servicesession";
import { _Node_SessionContext } from "../../_node_implements/_node/_thread_contexts";
import { user_behaviour } from "../gameframework/behaviours/user_behaviour";
import { game } from "../gameframework/game";
import { player } from "../gameframework/player";
import { ServerErrorCode } from "../msgs/msgcode";
import { servicebase } from "./servicebase";

export class outgameservice extends servicebase {

    public static create(c:serviceconf) {
        return new outgameservice(c);
    }
    
    constructor(c:serviceconf) {
        super(c);
    }

    public override startup():boolean {

        game.impl.register_player_behaviours(user_behaviour.beh_name, user_behaviour.creater);

        return super.startup();
    }
    public override shutdown():boolean {
        return super.startup();
    }

    public override async on_add_session(sid:number, skey:string):Promise<servicesession> {
        const new_ses = await super.on_add_session(sid, skey);

        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on add session  ${sid}, ${skey}`);

        return new_ses;
    }
    public override async on_remove_session(sid:number):Promise<void> {

        super.on_remove_session(sid);
        
        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on remove session  ${sid}`);
    }
    public override async on_session_close(sid:number):Promise<void> {

        super.on_session_close(sid);

        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on session close ${sid}`);
    }
    
    protected override async _do_remove_player(pl:player):Promise<void> {

        super._do_remove_player(pl);
    }

    public override async on_service_task(command:string, data:any):Promise<void> {

    }

    public override async on_broadcast_session_msg(command:string, data:any):Promise<void> {

    }
    public override async on_session_message(sid:number, command:string, data:any):Promise<void> {
        const ses = this._sessions.get(sid);
        if(ses == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `on_session_message session ${sid} c:${command} d:${data}, session not exist`);
            return;
        }

        switch(command){
            case "login":
                {
                    const pl = this._players.get(sid);
                    if(pl != undefined){
                        // already logined
                        // for Debug ...
                        _Node_SessionContext.sendWSMsg(sid, "login_res", {res:ServerErrorCode.ResAlreadyLogin});
                        return;
                    }

                    // for Debug ...
                    await nat.datas.insert_session_data(sid, "user", {name:data.name, uid:data.uid, token:data.token});

                    const user_data = await nat.datas.read_session_data(sid, "user");
                    if(user_data.uid != data.uid) {
                        _Node_SessionContext.sendWSMsg(sid, "login_res", {res:ServerErrorCode.ResLoinedOtherUid});
                        return;
                    }
                    if(user_data.token != data.token) {
                        _Node_SessionContext.sendWSMsg(sid, "login_res", {res:ServerErrorCode.ResLoginTokenError});
                        return;
                    }

                    const succ = await this._create_player(ses);
                    if(!succ) {
                        _Node_SessionContext.sendWSMsg(sid, "login_res", {res:ServerErrorCode.ResCreatePlayerError});
                        return;
                    }

                    _Node_SessionContext.sendWSMsg(sid, "login_res", {res:ServerErrorCode.ResOK, data:{name:data.name}});
                }
                break;
        }

        nat.dbglog.log(debug_level_enum.dle_debug, `on_session_message session ${sid} c:${command} d:${data}`);
    }

    //on_session_rpc_sync(sid:number, cmd:string, data:any):any;

    public override async on_service_update():Promise<void> {

    }
}

natrium_services.register("outgameservice", outgameservice.create);