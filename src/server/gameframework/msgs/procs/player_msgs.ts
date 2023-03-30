// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../..";
import { service } from "../../../../interface/service/service";
import { servicesession } from "../../../../interface/service/servicesession";
import { _Node_SessionContext } from "../../../../_node_implements/_node/_thread_contexts";
import { ServerErrorCode } from "../../../../share/msgs/msgcode";
import { player } from "../../player";
import { worldservice } from "../../../services/worldservice";
import { game_map } from "../../gameobjects/game_map";
import { generic_behaviour } from "../../behaviours/generic_behaviour";
import { player_herodatacomp, player_petdatacomp, player_portdatacomp } from "../../datacomponent/user_datas";

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
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerInSameMap});
        return;
    }

    // check change map condition

    // get change map point
    if(!((data.tomapid.toString()) in map.mapconf.gotopos)) {
        if(data.tomapid > 1000) {
            // not port map id
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerToMapPointNotExist});
            return;
        }

        // port map id

        // check if this map has portto
        if(!("portto" in map.mapconf)) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerToMapPointNotExist});
            return;
        }

        // check is near by port
        if(!map.is_player_nearby(pl, map.mapconf.portto, map.mapconf.portto.radius)) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerToMapPointTooFar});
            return;
        }

        // check target port is in toports list
        if(map.mapconf.portto.toports.indexOf(data.tomapid) < 0){
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerToMapPointNotExist});
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
        pla.pdatas.player_gen.rundata.mapid = data.tomapid;
        pla.pdatas.player_gen.rundata.pos = game_map.random_bornpos(mapconf.conf.bornpos[0]); // bornpos 0 is transfer point
    }
    else {

        // check is near by change map point
        const cmpoint = map.mapconf.gotopos[data.tomapid.toString()];
        if(!map.is_player_nearby(pl, cmpoint, cmpoint.radius)) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerToMapPointTooFar});
            return;
        }

        let mapconf = (s as worldservice).get_mapconf(data.tomapid);
        if(mapconf == undefined){
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerToMapNotExist});
            return;
        }
        pla.pdatas.player_gen.rundata.mapid = data.tomapid;
        pla.pdatas.player_gen.rundata.pos.x = cmpoint.tox;
        pla.pdatas.player_gen.rundata.pos.y = cmpoint.toy;
    }

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
        versinfos:new Array<any>
    };
    for(let i=0; i<data.playerids.length; ++i){
        let othpl = map.pid_players.get(data.playerids[i]);
        if(othpl == undefined){
            continue;
        }
        ret.versinfos.push({
            ver:othpl.runtimedata.ver,
            sinfo:othpl.pdatas.player_gen.rundata
        });
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

export async function player_get_hero_info(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let gipl = pla.runtimedata.map.get_player_bypid(data.playerid);
    if(gipl == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResTargetPlayerNotExist});
        return;
    }

    let heros = [];
    if("player_hero" in gipl.pdatas){
        heros = gipl.pdatas.player_hero.rundata.heros;
    }
    else {
        // for Debug ... 
        // add test hero
        let player_herodata = nat.datas.create_redis_datacomp(player_herodatacomp, "player", "hero", gipl.cdatas.ses_base.rundata.uid, true);
        if(player_herodata == null){
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResDatacompCreateError});
            return;
        }

        // insert hero data
        heros = [{
            mintType:0,
            job:1,
            grade:1,
            mineAttr:1,
            battleAttr:2,
            bindType:"mine",
            heronftid:nat.sys.getTimeStamp().toString(),
        },
        {
            mintType:1,
            job:2,
            grade:2,
            mineAttr:3,
            battleAttr:4,
            bindType:"mine",
            heronftid:(nat.sys.getTimeStamp()+1).toString(),
        }];
        player_herodata.mod_rundata({heros:heros});
        await player_herodata.flush_to_db(true); // write back
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_hero_info_res", {
        playerid:gipl.pdatas.player_gen.rundata.playerid,
        heros:heros
    });
}
export async function player_get_pet_info(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let gipl = pla.runtimedata.map.get_player_bypid(data.playerid);
    if(gipl == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResTargetPlayerNotExist});
        return;
    }

    let pets = [];
    if("player_pet" in gipl.pdatas){
        pets = gipl.pdatas.player_pet.rundata.pets;
    }
    else {
        // for Debug ... 
        // add test hero
        let player_petdata = nat.datas.create_redis_datacomp(player_petdatacomp, "player", "pet", gipl.cdatas.ses_base.rundata.uid, true);
        if(player_petdata == null){
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResDatacompCreateError});
            return;
        }

        // insert hero data
        pets = [{
            mintType:0,
            petId:1,
            avatarSlots:[1,1,1,1,1,1],
            mineAttr:1,
            battleAttr:2,
            bindType:"mine",
            heronftid:nat.sys.getTimeStamp().toString(),
        },
        {
            mintType:1,
            petId:2,
            avatarSlots:[2,2,2,2,2,2],
            mineAttr:3,
            battleAttr:4,
            bindType:"mine",
            heronftid:(nat.sys.getTimeStamp()+1).toString(),
        }];
        player_petdata.mod_rundata({pets:pets});
        await player_petdata.flush_to_db(true); // write back
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_pet_info_res", {
        playerid:gipl.pdatas.player_gen.rundata.playerid,
        pets:pets
    });
}
export async function player_get_ship_info(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let gipl = pla.runtimedata.map.get_player_bypid(data.playerid);
    if(gipl == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResTargetPlayerNotExist});
        return;
    }

    // TO DO : get ship info
}
export async function player_change_avatar(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    let pla = pl as player;

    // check nft card owner
    let hero = pla.get_player_hero(data.heronftid);
    if(hero == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayer_HeroNotExist});
        return;
    }

    pla.pdatas.player_gen.rundata.heroava = hero.job;
    ++pla.runtimedata.ver;

    // broad cast message to all map player
    _Node_SessionContext.broadCastMsgWith(0, map.player_sessionids, "player_change_ava_res", {
        playerid:pla.pdatas.player_gen.rundata.playerid,
        heroava:pla.pdatas.player_gen.rundata.heroava,
        ver:pla.runtimedata.ver
    });
}

export async function player_change_pet(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    let pla = pl as player;
    
    // check nft card owner
    let pet = pla.get_player_pet(data.heronftid);
    if(pet == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayer_PetNotExist});
        return;
    }

    pla.pdatas.player_gen.rundata.petava = {
        petId:pet.petId,
        avatarSlots:pet.avatarSlots
    };
    ++pla.runtimedata.ver;

    // broad cast message to all map player
    _Node_SessionContext.broadCastMsgWith(0, map.player_sessionids, "player_change_pet_res", {
        playerid:pla.pdatas.player_gen.rundata.playerid,
        petava:pla.pdatas.player_gen.rundata.petava,
        ver:pla.runtimedata.ver
    });
}

export async function player_get_portdata(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let ports = [];
    if("player_port" in pla.pdatas){
        ports = pla.pdatas.player_port.rundata.ports;
    }
    else {
        // for Debug ... 
        // add test port
        let player_portdata = nat.datas.create_redis_datacomp(player_portdatacomp, "player", "port", pla.cdatas.ses_base.rundata.uid, true);
        if(player_portdata == null){
            _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResDatacompCreateError});
            return;
        }

        // insert port data
        ports = [{
            portid:1,
            storehouse:{
                maxrepoload:nat.conf.get_config_data("game").port.init_repoload,
                level:1,
                curload:0,
                items:{}
            }
        }];
        player_portdata.mod_rundata({ports:ports});
        await player_portdata.flush_to_db(true); // write back
    }

    let target_port = null;
    for(let i=0; i< ports.length; ++i){
        if(ports[i].portid == data.portid){
            target_port = ports[i];
            break;
        }
    }
    if(target_port == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPort_PortNotExist});
        return;
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_portdata_res", {
        playerid:pla.pdatas.player_gen.rundata.playerid,
        data:target_port
    });
}
