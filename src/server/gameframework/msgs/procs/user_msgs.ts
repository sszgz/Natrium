// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../..";
import { service } from "../../../../interface/service/service";
import { servicesession } from "../../../../interface/service/servicesession";
import { _Node_SessionContext } from "../../../../_node_implements/_node/_thread_contexts";
import { outgameservice } from "../../../services/outgameservice";
import { player } from "../../player";
import { ServerErrorCode } from "../../../../share/msgs/msgcode";
import { session_basedatacomp } from "../../datacomponent/session_datas";
import { player_genericdatacomp, user_basedatacomp } from "../../datacomponent/user_datas";

export async function user_login(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl != undefined){
        // already logined
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResAlreadyLogin});
        return;
    }

    if(s.constructor.name != "outgameservice") {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResServiceWrong});
        return;
    }

    let ses_basedata = nat.datas.create_redis_datacomp(session_basedatacomp, "session", "base", ses.session_id, false);
    if(ses_basedata == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }

    await ses_basedata.sync_from_db();
    if(ses_basedata.rundata != undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResAlreadyLogin});
        return;
    }
    
    let user_sid = await nat.datas.get_user_sessionid(data.uid);
    if(user_sid != undefined) {
        // TO DO : kick other user ?
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResUserLoginedByOther});
        return;
    }
    
    let user_basedata = nat.datas.create_redis_datacomp(user_basedatacomp, "user", "base", data.uid, true);
    if(user_basedata == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }
    let player_gendata = nat.datas.create_redis_datacomp(player_genericdatacomp, "player", "generic", data.uid, true);
    if(player_gendata == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }

    // read from persist
    await user_basedata.sync_from_db();
    if(user_basedata.rundata == undefined) {
        // TO DO : kick other user ?
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResUserNotExist});
        return;
    }

    if(user_basedata.rundata.uid != data.uid) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResLoinedOtherUid});
        return;
    }
    if(user_basedata.rundata.token != data.token) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResLoginTokenError});
        return;
    }
    
    // insert session=>user data
    ses_basedata.mod_rundata({
        name:data.name, 
        uid:data.uid, 
        token:data.token,
        firstin:true
    });
    await ses_basedata.flush_to_db(false); // session data is cache data, not persist

    // insert user=>session data
    await nat.datas.set_user_sessionid(data.uid, ses.session_id);

    // TO DO : check player exist
    let res_data = {
        res:ServerErrorCode.ResOK, 
        data:user_basedata.rundata,
        isNew:true
    }

    await player_gendata.sync_from_db();
    if(player_gendata.dbdata_readed) {
        
        const succ = await (s as outgameservice).create_player(ses, [ses_basedata, user_basedata, player_gendata]);
        if(!succ) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResCreatePlayerError});
            return;
        }

        res_data.isNew = false;
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", res_data);
}

export async function user_createplayer(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    
    if(pl != undefined){
        // already logined
        // for Debug ...
        _Node_SessionContext.sendWSMsg(ses.session_id, "create_player_res", {res:ServerErrorCode.ResCreatePlayerAlreadyExist});
        return;
    }
    
    let ses_base_data = await nat.datas.memcaches.session.read_data("base", ses.session_id, ".");
    if(ses_base_data == undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "create_player_res", {res:ServerErrorCode.ResSessionNotLogin});
        return;
    }
    
    let player_gendata = nat.datas.create_redis_datacomp(player_genericdatacomp, "player", "generic", ses_base_data.uid, true);
    if(player_gendata == null){
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResDatacompCreateError});
        return;
    }
    
    await player_gendata.sync_from_db();
    if(player_gendata.rundata != undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "create_player_res", {res:ServerErrorCode.ResCreatePlayerAlreadyExist});
        return;
    }
    
    // TO DO : check msg data
    data.gender;
    data.pname;

    // insert player data
    let player_generic_data = {
        playerid:await nat.datas.generate_autoinc_id("playerid"),
        mapid:1, // TO DO : init map id
        heroava:data.gender, // TO DO : get heroava from gender
        gender:data.gender,
        pname:data.pname
    };
    player_gendata.mod_rundata(player_generic_data);
    await player_gendata.flush_to_db(true); // write back

    const pla = await (s as outgameservice).create_player(ses, [player_gendata]);
    if(pla == null) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "create_player_res", {res:ServerErrorCode.ResCreatePlayerError});
        return;
    }
    
    _Node_SessionContext.sendWSMsg(ses.session_id, "create_player_res", {res:ServerErrorCode.ResOK, sinfo:player_generic_data});
}

export async function user_entergame(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    
    if(pl == undefined){
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResSessionNotLogin});
        return;
    }

    let serviceconf = nat.conf.get_serverconf()?.service_confs.worldservice;
    if(serviceconf == undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "server_error", {res:ServerErrorCode.ResInternalError});
        return;
    }

    let pla = (pl as player);

    // calc service index by mapid
    let index = pla.pdatas.player_gen.rundata.mapid % serviceconf.service_count;
    ses.changeservice("worldservice", index);
}