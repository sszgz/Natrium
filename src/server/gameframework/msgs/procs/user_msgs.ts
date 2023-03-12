// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../..";
import { service } from "../../../../interface/service/service";
import { servicesession } from "../../../../interface/service/servicesession";
import { _Node_SessionContext } from "../../../../_node_implements/_node/_thread_contexts";
import { outgameservice } from "../../../services/outgameservice";
import { player_datas } from "../../player";
import { ServerErrorCode } from "../../../../share/msgs/msgcode";

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

    let ses_base_data = await nat.datas.read_session_data(ses.session_id, "base");
    if(ses_base_data != undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResAlreadyLogin});
        return;
    }
    
    let user_sid = await nat.datas.get_user_sessionid(data.uid);
    if(user_sid != undefined) {
        // TO DO : kick other user ?
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResUserLoginedByOther});
        return;
    }

    // TO DO : read from persist
    let user_base_data = await nat.datas.read_user_data(data.uid, "base");
    if(user_base_data == undefined) {
        // TO DO : kick other user ?
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResUserNotExist});
        return;
    }

    if(user_base_data.uid != data.uid) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResLoinedOtherUid});
        return;
    }
    if(user_base_data.token != data.token) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResLoginTokenError});
        return;
    }
    
    // insert session=>user data
    await nat.datas.insert_session_data(ses.session_id, "base", {name:data.name, uid:data.uid, token:data.token});

    // insert user=>session data
    await nat.datas.set_user_sessionid(data.uid, ses.session_id);

    // TO DO : check player exist
    let res_data = {
        res:ServerErrorCode.ResOK, 
        data:{name:data.name},
        is_new:true
    }

    let player_base_data = await nat.datas.read_player_data(data.uid, "generic");
    if(player_base_data != undefined) {

        const succ = await (s as outgameservice).create_player(ses, new player_datas(data.uid));
        if(!succ) {
            _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResCreatePlayerError});
            return;
        }

        res_data.is_new = false;
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
    
    let ses_base_data = await nat.datas.read_session_data(ses.session_id, "base");
    if(ses_base_data == undefined) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "create_player_res", {res:ServerErrorCode.ResSessionNotLogin});
        return;
    }

    const succ = await (s as outgameservice).create_player(ses, new player_datas(ses_base_data.uid));
    if(!succ) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "create_player_res", {res:ServerErrorCode.ResCreatePlayerError});
        return;
    }
    
    _Node_SessionContext.sendWSMsg(ses.session_id, "create_player_res", {res:ServerErrorCode.ResOK});
}

export async function user_entergame(s:service, ses:servicesession, pl:any, data:any):Promise<void> {

}