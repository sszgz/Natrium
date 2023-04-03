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

export async function mine_get_mineinfo(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_mineinfo_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_mineinfo_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    let retary = [];
    
    for(let i =0; i<data.mineids.length; ++i){
        let mineconf = map.get_mine_conf(data.mineids[i]);
        if(mineconf == null){
            continue;
        }

        let minedc = await map.get_mapmine_datacomp(data.mineids[i], mineconf);
        if(minedc == null){
            continue;
        }

        retary.push(minedc.minedata);
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_mineinfo_res", {res:ServerErrorCode.ResOK, info:retary});
}

export async function mine_start_manulmine(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    
    if(pla.runtimedata.manulmineid != undefined && pla.runtimedata.manulmineid != 0){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResPort_AlreadyInManulMine});
        return;
    }

    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
        
    let mineconf = map.get_mine_conf(data.mineid);
    if(mineconf == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResPort_MapMineNotExist});
        return;
    }

    let minedc = await map.get_mapmine_datacomp(data.mineid, mineconf);
    if(minedc == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }

    // check nearby
    if(!map.is_player_nearby(pl, mineconf, 128)){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResPort_MapMineTooFar});
        return;
    }

    if(minedc.minedata.curminingplys >= mineconf.maxminner){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResPort_MapMinePlyaerFull});
        return;
    }

    _recover_actpoint(pla.pdatas.player_gen.rundata);

    // add minning player
    minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid] = {
        uid:pla.cdatas.ses_base.rundata.uid,
        heronftid:"", // manul mine 
        startminetms:nat.sys.getTimeStamp()/1000,
        unfetchedoutput:0,
        heroactpoint:0
    };
    ++minedc.minedata.curminingplys;

    pla.runtimedata.manulmineid = data.mineid;
    _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResOK, 
        mineid:data.mineid, 
        actpoint:pla.pdatas.player_gen.rundata.actpoint
    });
}

export async function mine_stop_manulmine(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_manulmine_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_manulmine_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    if(pla.runtimedata.manulmineid == undefined || pla.runtimedata.manulmineid == 0){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_manulmine_res", {res:ServerErrorCode.ResPort_ManulMineNotStart});
        return;
    }

    let mineconf = map.get_mine_conf(pla.runtimedata.manulmineid);
    if(mineconf == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_manulmine_res", {res:ServerErrorCode.ResPort_MapMineNotExist});
        return;
    }

    let minedc = await map.get_mapmine_datacomp(pla.runtimedata.manulmineid, mineconf);
    if(minedc == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_manulmine_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }

    if(!(pla.pdatas.player_gen.rundata.playerid in minedc.minedata.players)) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_manulmine_res", {res:ServerErrorCode.ResPort_PlayerNotInThisManulMine});
        return;
    }

    // mark last actpoint recover time
    pla.pdatas.player_gen.rundata.lastAPRecTms = nat.sys.getTimeStamp()/1000;

    delete minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid];
    --minedc.minedata.curminingplys;
    pla.runtimedata.manulmineid = 0;

    if(minedc.minedata.curminingplys <= 0){
        minedc.flush_to_db(true);
    }
    else {
        // minedc will flush on map update
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "stop_manulmine_res", {res:ServerErrorCode.ResOK});
}

export async function mine_manulmine(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    if(pla.runtimedata.manulmineid == 0){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPort_ManulMineNotStart});
        return;
    }

    let mineconf = map.get_mine_conf(pla.runtimedata.manulmineid);
    if(mineconf == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPort_MapMineNotExist});
        return;
    }

    if(pla.pdatas.player_gen.rundata.actpoint < 1){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPort_PlayerActpointNotEnough});
        return;
    }

    --pla.pdatas.player_gen.rundata.actpoint;

    // TO DO : drop item
    mineconf.outputid;

    const dropeditem = {
        itemid:1,
        count:1
    }

    let md = pla.runtimedata.manulminedrops.get(dropeditem.itemid);
    if(md == undefined){
        pla.runtimedata.manulminedrops.set(dropeditem.itemid, dropeditem);
    }
    else {
        md.count += dropeditem.count;
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "manulmine_res", {outputitem:dropeditem, actpoint:pla.pdatas.player_gen.rundata.actpoint});
}

export async function mine_fetch_manulmine_output(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_manulmine_output_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    if(pla.runtimedata.manulminedrops.size == 0){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_manulmine_output_res", {res:ServerErrorCode.ResPort_ManulMineNothingToFetch});
        return;
    }

    let curplyport = pla.get_player_curr_port();
    if(curplyport == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_manulmine_output_res", {res:ServerErrorCode.ResPort_PortNotExist});
        return;
    }

    let addeditems = pla.runtimedata.manulminedrops;

    let additemary = new Array<item_data>();
    addeditems.forEach((itemdata)=>{
        additemary.push(itemdata);
    });
    // TO DO : check item load is full

    if(!pla.add_player_storehouse_items(additemary)){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_manulmine_output_res", {res:ServerErrorCode.ResPort_AddStoreHouseItemFailed});
        return;
    }

    // clear drop data
    pla.runtimedata.manulminedrops = new Map<number, item_data>();
    
    pla.pdatas.player_port.flush_to_db(false); // sync to cache

    _Node_SessionContext.sendWSMsg(ses.session_id, "storhouse_change", {
        iteminfo:additemary,
        curload:curplyport.storehouse.curload
    });
    _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_manulmine_output_res", {res:ServerErrorCode.ResOK});
}

export async function mine_start_heromine(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    
    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }

    let mineconf = map.get_mine_conf(data.mineid);
    if(mineconf == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResPort_MapMineNotExist});
        return;
    }

    let minedc = await map.get_mapmine_datacomp(data.mineid, mineconf);
    if(minedc == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }

    // check nearby
    if(!map.is_player_nearby(pl, mineconf, 128)){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResPort_MapMineTooFar});
        return;
    }

    if(minedc.minedata.curminingplys >= mineconf.maxminner){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResPort_MapMinePlyaerFull});
        return;
    }
    
    // check nft card owner
    let hero = pla.get_player_hero(data.heronftid);
    let checkres = pla.check_player_hero_usage(hero, hero_bind_type.mine);
    if(checkres != ServerErrorCode.ResOK) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:checkres});
        return;
    }
    
    _recover_actpoint(hero);

    if(hero.actpoint < 1){
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResPort_HeroActpointNotEnough});
        return;
    }

    let currTms = nat.sys.getTimeStamp()/1000;

    // mark hero minning
    hero.minnings = {
        mineid:data.mineid,
        startminetms:currTms,
    }

    // add minning player
    minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid] = {
        uid:pla.cdatas.ses_base.rundata.uid,
        heronftid:data.heronftid, // manul mine 
        startminetms:currTms,
        unfetchedoutput:0,
        heroactpoint:hero.actpoint
    };
    ++minedc.minedata.curminingplys;
    
    minedc.flush_to_db(false); // sync to cache
    pla.pdatas.player_hero.flush_to_db(false); // sync to cache

    _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResOK, 
        heronftid:data.heronftid, 
        mineid:data.mineid,
        actpoint:hero.actpoint,
        lastAPRecTms:hero.lastAPRecTms
    });
}

export async function mine_stop_heromine(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    
    // check nft card owner
    let hero = pla.get_player_hero(data.heronftid);
    if(hero == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResPlayer_HeroNotExist});
        return;
    }
    if(hero.bindType != hero_bind_type.mine) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResPlayer_HeroNotBindToMine});
        return;
    }
    if(hero.minnings == undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResPlayer_HeroNotInMine});
        return;
    }

    let mineconf = map.get_mine_conf(hero.minnings.mineid);
    if(mineconf == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResPort_MapMineNotExist});
        return;
    }

    let minedc = await map.get_mapmine_datacomp(hero.minnings.mineid, mineconf);
    if(minedc == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }

    if(!(pla.pdatas.player_gen.rundata.playerid in minedc.minedata.players)) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResPlayer_NotInThisMine});
        return;
    }
    
    let mineply = minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid];
    
    // mark last actpoint recover time
    hero.lastAPRecTms = nat.sys.getTimeStamp()/1000;
    hero.actpoint = mineply.heroactpoint;

    // TO DO : check unfetched mine?

    delete minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid];
    --minedc.minedata.curminingplys;

    delete hero.minnings;
    pla.pdatas.player_hero.flush_to_db(false); // sync to cache

    if(minedc.minedata.curminingplys <= 0){
        minedc.flush_to_db(true);
    }
    else {
        // minedc will flush on map update
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResOK, 
        heronftid:data.heronftid,
        actpoint:hero.actpoint,
        lastAPRecTms:hero.lastAPRecTms
    });
}

export async function mine_get_heromine_infos(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    
    // check nft card owner
    let hero = pla.get_player_hero(data.heronftid);
    if(hero == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResPlayer_HeroNotExist});
        return;
    }
    if(hero.bindType != hero_bind_type.mine) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResPlayer_HeroNotBindToMine});
        return;
    }
    if(hero.minnings == undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResPlayer_HeroNotInMine});
        return;
    }

    let mineconf = map.get_mine_conf(hero.minnings.mineid);
    if(mineconf == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResPort_MapMineNotExist});
        return;
    }

    let minedc = await map.get_mapmine_datacomp(hero.minnings.mineid, mineconf);
    if(minedc == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }

    if(!(pla.pdatas.player_gen.rundata.playerid in minedc.minedata.players)) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResPlayer_NotInThisMine});
        return;
    }

    let mineply = minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid];

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResOK, 
        info:mineply, 
        unfetchedoutput:mineply.unfetchedoutput,
        actpoint:mineply.heroactpoint
    });
}

export async function mine_fetch_heromine_output(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = pla.runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    
    // check nft card owner
    let hero = pla.get_player_hero(data.heronftid);
    if(hero == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPlayer_HeroNotExist});
        return;
    }
    if(hero.bindType != hero_bind_type.mine) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPlayer_HeroNotBindToMine});
        return;
    }
    if(hero.minnings == undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPlayer_HeroNotInMine});
        return;
    }

    let mineconf = map.get_mine_conf(hero.minnings.mineid);
    if(mineconf == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPort_MapMineNotExist});
        return;
    }

    let minedc = await map.get_mapmine_datacomp(hero.minnings.mineid, mineconf);
    if(minedc == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }

    if(!(pla.pdatas.player_gen.rundata.playerid in minedc.minedata.players)) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPlayer_NotInThisMine});
        return;
    }

    let mineply = minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid];

    // TO DO : give item by output id
    //mineconf.outputid;

    const dropeditem = {
        itemid:2,
        count:mineply.unfetchedoutput
    }

    let curplyport = pla.get_player_curr_port();
    if(curplyport == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPort_PortNotExist});
        return;
    }

    // TO DO : check item load is full
    
    if(!pla.add_player_storehouse_items([dropeditem])){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPort_AddStoreHouseItemFailed});
        return;
    }

    // update db
    mineply.unfetchedoutput = 0;
    minedc.flush_to_db(false); // sync to cache
    
    pla.pdatas.player_port.flush_to_db(false); // sync to cache

    _Node_SessionContext.sendWSMsg(ses.session_id, "storhouse_change", {
        iteminfo:[dropeditem],
        curload:curplyport.storehouse.curload
    });
    _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResOK, heronftid:data.heronftid});
}

interface actpoint_recover_like {
    actpoint:number;
    lastAPRecTms:number;
}

function _recover_actpoint(data:actpoint_recover_like){
    let cur_tm_s = nat.sys.getTimeStamp()/1000;
    let recover_tm_s = cur_tm_s - data.lastAPRecTms;
    if(recover_tm_s <= 0){
        return;
    }
    
    let init_ac = nat.conf.get_config_data("game").port.init_actpoint;

    let old_ap = data.actpoint;
    if(old_ap >= init_ac){
        return;
    }

    let single_rec_tm_s = nat.conf.get_config_data("game").port.actpoint_recove_tm_s;

    let ap = recover_tm_s / single_rec_tm_s;
    if(ap < 1){
        return;
    }

    data.lastAPRecTms = cur_tm_s;

    data.actpoint += ap;
    if(data.actpoint > init_ac) {
        data.actpoint = init_ac;
    }
}