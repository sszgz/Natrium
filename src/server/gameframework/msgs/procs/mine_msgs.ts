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
import { item_data } from "../../datacomponent/define";

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

    // add minning player
    minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid] = {
        uid:pla.cdatas.ses_base.rundata.uid,
        heronftid:"", // manul mine 
        startminetms:nat.sys.getTimeStamp()/1000,
        unfetchedoutput:0
    };
    ++minedc.minedata.curminingplys;

    pla.runtimedata.manulmineid = data.mineid;
    _Node_SessionContext.sendWSMsg(ses.session_id, "start_manulmine_res", {res:ServerErrorCode.ResOK, mineid:data.mineid});
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

    _Node_SessionContext.sendWSMsg(ses.session_id, "manulmine_res", {outputitem:dropeditem});
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
    pla.runtimedata.manulminedrops = new Map<number, item_data>();

    // TO DO : check item load is full

    let additemary = [];
    addeditems.forEach((itemdata)=>{

        if(itemdata.itemid in curplyport.storehouse.items){
            curplyport.storehouse.items[itemdata.itemid] += itemdata.count;
        }
        else {
            curplyport.storehouse.items[itemdata.itemid] = itemdata.count;
        }

        additemary.push(itemdata);

        // TO DO : load item config and read item load
        curplyport.storehouse.curload += 1;
    });

    
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
    if(hero == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResPlayer_HeroNotExist});
        return;
    }
    if(hero.bindType != "mine") {
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResPlayer_HeroNotBindToMine});
        return;
    }
    if(hero.minnings != undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResPlayer_HeroAlreadyInMine});
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
        unfetchedoutput:0
    };
    ++minedc.minedata.curminingplys;

    _Node_SessionContext.sendWSMsg(ses.session_id, "start_heromine_res", {res:ServerErrorCode.ResOK, heronftid:data.heronftid, mineid:data.mineid});
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
    if(hero.bindType != "mine") {
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

    // TO DO : check unfetched mine?

    delete minedc.minedata.players[pla.pdatas.player_gen.rundata.playerid];
    --minedc.minedata.curminingplys;

    hero.minnings = undefined;
    pla.pdatas.player_hero.flush_to_db(false); // sync to cache

    if(minedc.minedata.curminingplys <= 0){
        minedc.flush_to_db(true);
    }
    else {
        // minedc will flush on map update
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResOK, heronftid:data.heronftid});
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
    if(hero.bindType != "mine") {
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

    _Node_SessionContext.sendWSMsg(ses.session_id, "get_heromine_infos_res", {res:ServerErrorCode.ResOK, info:mineply, unfetchedoutput:mineply.unfetchedoutput});
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
    if(hero.bindType != "mine") {
        _Node_SessionContext.sendWSMsg(ses.session_id, "stop_heromine_res", {res:ServerErrorCode.ResPlayer_HeroNotBindToMine});
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

    mineply.unfetchedoutput = 0;
    minedc.flush_to_db(false); // sync to cache

    let curplyport = pla.get_player_curr_port();
    if(curplyport == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResPort_PortNotExist});
        return;
    }

    let addeditems = pla.runtimedata.manulminedrops;
    pla.runtimedata.manulminedrops = new Map<number, item_data>();

    // TO DO : check item load is full

    if(dropeditem.itemid in curplyport.storehouse.items){
        curplyport.storehouse.items[dropeditem.itemid] += dropeditem.count;
    }
    else {
        curplyport.storehouse.items[dropeditem.itemid] = dropeditem.count;
    }

    // TO DO : load item config and read item load
    curplyport.storehouse.curload += 1;

    _Node_SessionContext.sendWSMsg(ses.session_id, "storhouse_change", {
        iteminfo:[dropeditem],
        curload:curplyport.storehouse.curload
    });
    _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_heromine_output_res", {res:ServerErrorCode.ResOK, heronftid:data.heronftid});
}