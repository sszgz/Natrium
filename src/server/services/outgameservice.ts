// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../..";
import { serviceconf } from "../../interface/config/configs";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_services } from "../../interface/service/service";
import { servicesession } from "../../interface/service/servicesession";
import { _Node_SessionContext } from "../../_node_implements/_node/_thread_contexts";
import { game } from "../gameframework/game";
import { player } from "../gameframework/player";
import { servicebase } from "./servicebase";
import { generic_behaviour } from "../gameframework/behaviours/generic_behaviour";
import { generic_playerdata_comp } from "../gameframework/datacomponent/generic_playerdata";

export class outgameservice extends servicebase {

    public static create(c:serviceconf) {
        return new outgameservice(c);
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

        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on add session  ${sid}, ${skey}`);

        return new_ses;
    }
    public override async on_remove_session(sid:number):Promise<void> {

        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on remove session  ${sid}`);

        return super.on_remove_session(sid);
    }
    public override async on_session_close(sid:number):Promise<void> {

        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on session close ${sid}`);
        
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

natrium_services.register("outgameservice", outgameservice.create);