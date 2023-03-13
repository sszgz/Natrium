// natrium
// license : MIT
// author : Sean Chen


import { nat } from "../..";
import { serviceconf } from "../../interface/config/configs";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_services } from "../../interface/service/service";
import { servicesession } from "../../interface/service/servicesession";
import { ServerErrorCode } from "../../share/msgs/msgcode";
import { _Node_SessionContext } from "../../_node_implements/_node/_thread_contexts";
import { generic_behaviour } from "../gameframework/behaviours/generic_behaviour";
import { generic_playerdata_comp } from "../gameframework/datacomponent/generic_playerdata";
import { game } from "../gameframework/game";
import { player, player_datas } from "../gameframework/player";
import { outgameservice } from "./outgameservice";
import { servicebase } from "./servicebase";

export class worldservice extends servicebase {

    public static create(c:serviceconf) {
        return new worldservice(c);
    }
    
    constructor(c:serviceconf) {
        super(c);
    }

    public override async startup():Promise<boolean> {
        // register behaviours
        game.impl.register_player_behaviours(generic_behaviour.beh_name, generic_behaviour.creater);

        // register datacomponents
        game.impl.register_player_datacomponents(generic_playerdata_comp.comp_name, generic_playerdata_comp.creater);

        return super.startup();
    }
    public override async shutdown():Promise<boolean> {
        return super.startup();
    }

    public override async on_add_session(sid:number, skey:string):Promise<servicesession> {
        const new_ses = await super.on_add_session(sid, skey);

        nat.dbglog.log(debug_level_enum.dle_debug, `worldservice on add session  ${sid}, ${skey}`);
        
        let ses_base_data = await nat.datas.read_session_data(sid, "base");
        if(ses_base_data == undefined) {
            _Node_SessionContext.sendWSMsg(sid, "server_error", {res:ServerErrorCode.ResServiceSessionNotExist});
            // error 
            // TO DO : kick player
            return new_ses;
        }
        
        let player_base_data = await nat.datas.read_player_data(ses_base_data.uid, "generic");
        if(player_base_data == undefined) {
            // error 
            // TO DO : kick player
            _Node_SessionContext.sendWSMsg(sid, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
            return new_ses;
        }

        const pl = await this.create_player(new_ses, new player_datas(ses_base_data.uid));
        if(pl == null) {
            // error 
            // TO DO : kick player
            _Node_SessionContext.sendWSMsg(new_ses.session_id, "server_error", {res:ServerErrorCode.ResCreatePlayerError});
            return new_ses;
        }

        let plgedata = pl.datas.get_dataobj(generic_playerdata_comp.comp_name);
        if(plgedata == null){
            // error 
            // TO DO : kick player
            _Node_SessionContext.sendWSMsg(new_ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerDataNotExist});
            return new_ses;
        }
        
        // TO DO : add player to map

        let enter_game_res = {
            res:ServerErrorCode.ResOK,
            data:{
                mapid:plgedata.data.mapid,
                info:{
                    sinfo:plgedata.data
                },
                heros:plgedata.data.heros,
                pets:[],
                ships:[]
            }
        }

        _Node_SessionContext.sendWSMsg(new_ses.session_id, "enter_game_res", enter_game_res);

        return new_ses;
    }
    public override async on_remove_session(sid:number):Promise<void> {

        nat.dbglog.log(debug_level_enum.dle_debug, `worldservice on remove session  ${sid}`);

        return super.on_remove_session(sid);
    }
    public override async on_session_close(sid:number):Promise<void> {

        nat.dbglog.log(debug_level_enum.dle_debug, `worldservice on session close ${sid}`);
        
        return super.on_session_close(sid);
    }
    protected async _do_clear_session(sid:number):Promise<void> {

        return super._do_clear_session(sid);
    }
    protected override async _do_remove_player(pl:player):Promise<void> {

        return super._do_remove_player(pl);
    }

    public override async on_service_task(command:string, data:any):Promise<void> {
        return super.on_service_task(command, data);
    }

    public override async on_broadcast_session_msg(command:string, data:any):Promise<void> {
        return super.on_broadcast_session_msg(command, data);
    }
    public override async on_session_message(sid:number, command:string, data:any):Promise<void> {
        return super.on_session_message(sid, command, data);
    }

    //on_session_rpc_sync(sid:number, cmd:string, data:any):any;

    public override async on_service_update():Promise<void> {
        return super.on_service_update();
    }
}

natrium_services.register("worldservice", worldservice.create);
