// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../..";
import { service } from "../../../../interface/service/service";
import { servicesession } from "../../../../interface/service/servicesession";
import { _Node_SessionContext } from "../../../../_node_implements/_node/_thread_contexts";
import { outgameservice } from "../../../services/outgameservice";
import { ServerErrorCode } from "../../../../share/msgs/msgcode";
import { player } from "../../player";
import { worldservice } from "../../../services/worldservice";
import { game_map } from "../../gameobjects/game_map";
import { generic_behaviour } from "../../behaviours/generic_behaviour";


export async function player_goto(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }

    if((pl as player).runtimedata.map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    if(data.goto.path.length < 1 || data.goto.path.length > 32){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResMsgParamError});
        return;
    }

    ((pl as player).behavoiurs.get("generic") as generic_behaviour).player_goto(pl, data.goto.path);
}
export async function player_stop(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    
    ((pl as player).behavoiurs.get("generic") as generic_behaviour).player_stop(pl, data.pos);
}
export async function player_changemapbegin(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    // TO DO : rmv player ?
}
export async function player_changemapend(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }

    let pla = (pl as player);

    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    if(data.tomapid == map.mapconf.id) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    let mapconf = (s as worldservice).get_mapconf(data.tomapid);
    if(mapconf == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerToMapNotExist});
        return;
    }
    if(mapconf.conf.bornpos.length <= 0) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerMapNoBornPos});
        return;
    }

    // TO DO : check change map condition

    pla.pdatas.player_gen.rundata.mapid = data.tomapid;
    pla.pdatas.player_gen.rundata.pos = game_map.random_bornpos(mapconf.conf.bornpos[0]); // bornpos 0 is transfer point

    let new_map = (s as worldservice).get_map(data.tomapid);
    if(new_map != undefined){
        map.rmv_player(pla);
        new_map.add_player(pla);
    }
    else {
        let index = data.tomapid % s.conf.service_count;
        ses.changeservice("worldservice", index);
    }
}
export async function player_get_player_sinfo(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }

    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    let ret = {
        sinfos:new Array<any>
    };
    for(let i=0; i<data.playerids.length; ++i){
        let othpl = map.pid_players.get(data.playerids[i]);
        if(othpl == undefined){
            continue;
        }
        ret.sinfos.push(othpl.pdatas.player_gen.rundata);
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_player_sinfo_res", ret);
}
export async function player_get_player_info(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }

    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    let ret = {
        infos:new Array<any>
    };
    for(let i=0; i<data.playerids.length; ++i){
        let othpl = map.pid_players.get(data.playerids[i]);
        if(othpl == undefined){
            continue;
        }
        ret.infos.push({
            sinfo:othpl.pdatas.player_gen.rundata
            // TO DO : add detail info
        });
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_player_info_res", ret);
}

export async function player_chat(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    const MAX_CHAT_MSG_LENGTH = 10;
    if(data.msg.length > MAX_CHAT_MSG_LENGTH){
        data.msg = data.msg.slice(0, MAX_CHAT_MSG_LENGTH);
    }

    switch(data.channel){
        case 1: // world
            {
                _Node_SessionContext.broadCastMsg("chat_msg", data);
            }
            break;
        case 2: // current map
            {
                _Node_SessionContext.broadCastMsgWith(0, map.player_sessionids, "chat_msg", data);
            }
            break;
        case 3: // near by
            {
                let cid_ary = map.get_player_nearby_sids(pl, 100, 100);
                cid_ary.push(ses.session_id);
                _Node_SessionContext.broadCastMsgWith(0, cid_ary, "chat_msg", data);
            }
            break;
    }
}

export async function player_manulmine(s:service, ses:servicesession, pl:any, data:any):Promise<void> {

}