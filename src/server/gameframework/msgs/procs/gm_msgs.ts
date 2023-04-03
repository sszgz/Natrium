// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../..";
import { service } from "../../../../interface/service/service";
import { servicesession } from "../../../../interface/service/servicesession";
import { _Node_SessionContext } from "../../../../_node_implements/_node/_thread_contexts";
import { ServerErrorCode } from "../../../../share/msgs/msgcode";
import { hero_bind_type, player } from "../../player";
import { worldservice } from "../../../services/worldservice";
import { game_map } from "../../gameobjects/game_map";
import { generic_behaviour } from "../../behaviours/generic_behaviour";
import { hero_data, item_data } from "../../datacomponent/define";

export async function gm_get_storehouse_item(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    let ply = pl as player;
    if(!ply.pdatas.user_base.rundata.isgm){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResNotGM});
        return;
    }

    let curplyport = ply.get_player_curr_port();
    if(curplyport == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPort_PortNotExist});
        return;
    }

    if(!ply.add_player_storehouse_items([data])){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPort_AddStoreHouseItemFailed});
        return;
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "storhouse_change", {
        iteminfo:[data],
        curload:curplyport.storehouse.curload
    });
}