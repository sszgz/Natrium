// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../..";
import { service } from "../../../interface/service/service";
import { servicesession } from "../../../interface/service/servicesession";
import { _Node_SessionContext } from "../../../_node_implements/_node/_thread_contexts";
import { outgameservice } from "../../services/outgameservice";
import { ServerErrorCode } from "../msgcode";

export async function user_login(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl != undefined){
        // already logined
        // for Debug ...
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResAlreadyLogin});
        return;
    }

    // for Debug ...
    await nat.datas.insert_session_data(ses.session_id, "user", {name:data.name, uid:data.uid, token:data.token});

    const user_data = await nat.datas.read_session_data(ses.session_id, "user");
    if(user_data.uid != data.uid) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResLoinedOtherUid});
        return;
    }
    if(user_data.token != data.token) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResLoginTokenError});
        return;
    }

    const succ = await (s as outgameservice).create_player(ses);
    if(!succ) {
        _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResCreatePlayerError});
        return;
    }

    _Node_SessionContext.sendWSMsg(ses.session_id, "login_res", {res:ServerErrorCode.ResOK, data:{name:data.name}});
}