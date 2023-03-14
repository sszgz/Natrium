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
import { generic_playerdata_comp } from "../../datacomponent/generic_playerdata";
import { worldservice } from "../../../services/worldservice";


export async function player_goto(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }

    if((pl as player).runtimedata.map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    (pl as player).runtimedata.map?.player_goto(pl, data.goto.from, data.goto.to);
}
export async function player_stop(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }

    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    map.player_stop(pl, data.pos);
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

    // TO DO : check change map condition

    pla.datacomp.generic.data.mapid = data.tomapid;

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
        ret.sinfos.push(othpl.datacomp.generic.data);
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
            sinfo:othpl.datacomp.generic.data
            // TO DO : add detail info
        });
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_player_info_res", ret);
}
export async function player_manulmine(s:service, ses:servicesession, pl:any, data:any):Promise<void> {

}