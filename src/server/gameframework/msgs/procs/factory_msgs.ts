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
import { factory_line_data, item_data } from "../../datacomponent/define";

export async function fac_make_factory_product(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    let curplyport = pla.get_player_curr_port();
    if(curplyport == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_PortNotExist});
        return;
    }

    if(!("factory" in curplyport)) {
        // for debug ...
        curplyport.factory = {
            level:1,
            lines:[]
        };
    }

    const portfacconf = pla.get_port_factory_conf();
    if(portfacconf == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryConfError});
        return;
    }
    const faclvconf = portfacconf.level[curplyport.factory.level.toString()];
    if(faclvconf == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryConfError});
        return;
    }
    const prodconf = portfacconf.products[data.proditemid.toString()];
    if(prodconf == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryItemConfNotExist});
        return;
    }

    if(prodconf.require_lv > curplyport.factory.level) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryLevelRequire});
        return;
    }

    if(data.lineidx >= faclvconf.lines){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryLineIndexError});
        return;
    }

    // TO DO : check factory output repo space is enough

    _fill_empty_lines(curplyport, data.lineidx+1);

    const linedata:factory_line_data = curplyport.factory.lines[data.lineidx];
    
    const cur_tm_s = nat.sys.getTimeStamp()/1000;
    _output_products(ses, pla, data.lineidx, linedata, cur_tm_s);

    if(linedata.unfetchedcount > 0){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryLineOutputNotEmpty});
        return;
    }

    if(linedata.targetcount > linedata.outputcount){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryLineNotFinishWorking});
        return;
    }

    // cost storehouse input items
    let costitems = new Array<item_data>();
    for(const key in prodconf.cost){
        costitems.push({
            itemid:parseInt(key),
            count:prodconf.cost[key] * data.count
        })
    }
    if(costitems.length <= 0){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryInputItemConfError});
        return;
    }
    if(!pla.cost_player_storehouse_items(costitems)){
        _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResPort_FactoryNotEnoughInputItem});
        return;
    }

    for(let i=0; i<costitems.length; ++i){
        costitems[i].count = -costitems[i].count;
    }

    // TO DO : calc repo load
    _Node_SessionContext.sendWSMsg(ses.session_id, "storhouse_change", {iteminfo:costitems, curload:curplyport.storehouse.curload});

    linedata.singleprodtmms = _calc_singleprod_timems(pla, linedata, prodconf);
    linedata.proditemid = data.proditemid;
    linedata.unfetchedcount = 0;
    linedata.targetcount = data.count;
    linedata.outputcount = 0;
    linedata.starttms = cur_tm_s;
    linedata.lastoutputtms = cur_tm_s;

    // sync to cache
    pla.pdatas.player_port.flush_to_db(false);

    _Node_SessionContext.sendWSMsg(ses.session_id, "make_factory_product_res", {res:ServerErrorCode.ResOK, lineidx:data.lineidx, linedata:linedata});
}

export async function fac_set_factory_hero(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    let linedata = pla.get_player_curr_factory_line(data.lineidx);
    if(linedata == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryLineIndexError});
        return;
    }

    if(data.ispet){
        if(linedata.petnftid != ""){
            _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryHeroAlreadySet});
            return;
        }
    }
    else {
        if(linedata.heronftid != ""){
            _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryHeroAlreadySet});
            return;
        }
    }
    
    const portfacconf = pla.get_port_factory_conf();
    if(portfacconf == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryConfError});
        return;
    }
    const prodconf = portfacconf.products[linedata.proditemid.toString()];
    if(prodconf == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryItemConfNotExist});
        return;
    }

    // check nft card owner
    let heroorpet:any;
    if(data.ispet){
        let pet = pla.get_player_pet(data.nftid);
        let checkres = pla.check_player_pet_usage(pet, hero_bind_type.mine);
        if(checkres != ServerErrorCode.ResOK) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:checkres});
            return;
        }
        heroorpet = pet;
    } else {
        let hero = pla.get_player_hero(data.nftid);
        let checkres = pla.check_player_hero_usage(hero, hero_bind_type.mine);
        if(checkres != ServerErrorCode.ResOK) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:checkres});
            return;
        }
        heroorpet = hero;
    }

    // mark hero factory
    heroorpet.factory = {
        portid:pla.runtimedata.map.portid,
        lineidx:data.lineidx
    };

    // change linedata
    if(data.ispet) {
        linedata.petnftid = data.nftid;
    }
    else {
        linedata.heronftid = data.nftid;
    }
    linedata.singleprodtmms = _calc_singleprod_timems(pla, linedata, prodconf);
    
    // sync to cache
    if(data.ispet) {
        pla.pdatas.player_pet.flush_to_db(false);
    }
    else {
        pla.pdatas.player_hero.flush_to_db(false);
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "set_factory_hero_res", {res:ServerErrorCode.ResOK, 
        nftid:data.nftid, 
        lineidx:data.lineidx, 
        singleprodtmms:linedata.singleprodtmms
    });
}

export async function fac_unset_factory_hero(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    let linedata = pla.get_player_curr_factory_line(data.lineidx);
    if(linedata == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryLineIndexError});
        return;
    }

    let isPet:boolean;

    if(linedata.heronftid == data.nftid){
        isPet = false;
    }
    else if(linedata.petnftid == data.nftid){
        isPet = true;
    }
    else {
        _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryHeroNotSet});
        return;
    }
    
    const portfacconf = pla.get_port_factory_conf();
    if(portfacconf == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryConfError});
        return;
    }
    const prodconf = portfacconf.products[linedata.proditemid.toString()];
    if(prodconf == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPort_FactoryItemConfNotExist});
        return;
    }

    // check nft card
    if(isPet){
        let pet = pla.get_player_pet(data.nftid);
        if(pet == null) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPlayer_HeroNotExist});
            return;
        }
        if(pet.bindType != hero_bind_type.mine) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPlayer_HeroNotBindToMine});
            return;
        }
        if(pet.factory == undefined) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPlayer_HeroNotInFactory});
            return;
        }
        
        // clear factory working info
        delete pet.factory;
    }
    else {
        let hero = pla.get_player_hero(data.nftid);
        if(hero == null) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPlayer_HeroNotExist});
            return;
        }
        if(hero.bindType != hero_bind_type.mine) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPlayer_HeroNotBindToMine});
            return;
        }
        if(hero.factory == undefined) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResPlayer_HeroNotInFactory});
            return;
        }

        // clear factory working info
        delete hero.factory;
    }

    // change linedata
    if(isPet) {
        linedata.petnftid = "";
    }
    else {
        linedata.heronftid = "";
    }
    linedata.singleprodtmms = _calc_singleprod_timems(pla, linedata, prodconf);
    
    // sync to cache
    pla.pdatas.player_port.flush_to_db(false);
    if(isPet) {
        pla.pdatas.player_pet.flush_to_db(false);
    }
    else {
        pla.pdatas.player_hero.flush_to_db(false);
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "unset_factory_hero_res", {res:ServerErrorCode.ResOK, 
        nftid:data.nftid, 
        lineidx:data.lineidx, 
        singleprodtmms:linedata.singleprodtmms
    });
}

export async function fac_fetch_factory_product(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_factory_product_res", {res:ServerErrorCode.ResServicePlayerNotExist});
        return;
    }
    let pla = pl as player;
    let map = (pl as player).runtimedata.map;
    if(map == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_factory_product_res", {res:ServerErrorCode.ResPlayerNotinMap});
        return;
    }
    let linedata = pla.get_player_curr_factory_line(data.lineidx);
    if(linedata == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_factory_product_res", {res:ServerErrorCode.ResPort_FactoryLineIndexError});
        return;
    }

    if(linedata.unfetchedcount <= 0){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_factory_product_res", {res:ServerErrorCode.ResPort_FactoryNothingToFetch});
        return;
    }

    let curplyport = pla.get_player_curr_port();
    if(curplyport == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_factory_product_res", {res:ServerErrorCode.ResPort_PortNotExist});
        return;
    }

    const dropeditem = {
        itemid:linedata.proditemid,
        count:linedata.unfetchedcount
    }

    // TO DO : check item load is full
    
    if(!pla.add_player_storehouse_items([dropeditem])){
        _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_factory_product_res", {res:ServerErrorCode.ResPort_AddStoreHouseItemFailed});
        return;
    }

    linedata.unfetchedcount = 0;
    
    // sync to cache
    pla.pdatas.player_port.flush_to_db(false);

    _Node_SessionContext.sendWSMsg(ses.session_id, "storhouse_change", {
        iteminfo:[dropeditem],
        curload:curplyport.storehouse.curload
    });

    _Node_SessionContext.sendWSMsg(ses.session_id, "fetch_factory_product_res", {res:ServerErrorCode.ResOK, 
        lineidx:data.lineidx, 
        unfetchedcount:linedata.unfetchedcount
    });
}

function _fill_empty_lines(curplyport:any, length:number):void {
    if(curplyport.factory.length > length) {
        return;
    }
    
    for(let i=curplyport.factory.lines.length; i < length; ++i){
        // fill empty lines
        curplyport.factory.lines.push({
            proditemid:0,
            unfetchedcount:0,
            outputcount:0,
            targetcount:0,
            singleprodtmms:0,
            starttms:0,
            lastoutputtms:0,
            heronftid:"",
            petnftid:""
        });
    }
}

function _calc_singleprod_timems(pla:player, linedata:factory_line_data, prodconf:any):number {

    const heroacc = pla.get_heropet_factory_accrate(linedata.heronftid);
    const petacc = pla.get_heropet_factory_accrate(linedata.petnftid);

    const prodtime_ms = prodconf.time_s * 1000 / (1.0+heroacc+petacc);

    return prodtime_ms;
}

function _output_products(ses:servicesession, pla:player, lineidx:number, linedata:factory_line_data, cur_tm_s:number):void {
    if(linedata.lastoutputtms <= 0){
        return;
    }

    if(linedata.lastoutputtms >= cur_tm_s){
        return;
    }

    if(linedata.outputcount >= linedata.targetcount){
        return;
    }

    const output_tm_s = cur_tm_s - linedata.lastoutputtms;


    let output_count = output_tm_s * 1000 / linedata.singleprodtmms;
    if(output_count < 1){
        return;
    }

    output_count = Math.trunc(output_count);
    if(output_count + linedata.outputcount > linedata.targetcount){
        output_count = linedata.targetcount - linedata.outputcount;
    }

    // TO DO : extra output

    linedata.lastoutputtms += output_count*linedata.singleprodtmms;
    linedata.outputcount += output_count;
    linedata.unfetchedcount += output_count;
    
    _Node_SessionContext.sendWSMsg(ses.session_id, "factory_line_change", {
        portid:pla.runtimedata.map.portid,
        lineidx:lineidx,
        unfetchedcount:linedata.unfetchedcount,
        outputcount:linedata.outputcount,
        lastoutputtms:linedata.lastoutputtms
    });
}