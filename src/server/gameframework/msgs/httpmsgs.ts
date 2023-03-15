// natrium
// license : MIT
// author : Sean Chen

import * as crypto from "node:crypto";
import { http_request_like, http_response_like } from "../../../interface/network/httplistener";
import { network } from "../../../interface/network/network";
import { nat } from "../../../natrium";

export const http_unknown_cmd_json = `{"res":"Unknown command"}`;
export const http_param_err_json = `{"res":"Parameter error"}`;

function _generate_login_token(uid:string):string {
    const timestamp = nat.sys.getTimeStamp();
    const md5sum = crypto.createHash("md5");

    let ret = md5sum.update(`${timestamp}_${uid}`).digest('hex');
    return `${ret.slice(0, 8)}-${timestamp}-${uid}`;
}

export const on_verify_sign = async (req:http_request_like, res:http_response_like):Promise<void> => {
    if(req.postdata == undefined){
        res.write(http_param_err_json);
        res.end();
        return;
    }
    let postdata = JSON.parse(req.postdata);
    if(!("walletaddr" in postdata) || !("signmsg" in postdata)){
        res.write(http_param_err_json);
        res.end();
        return;
    }

    let retdata = {
        wallet:postdata.walletaddr,
        name:"",
        uid:"",
        token:"132-12-BIG",
        lastlogintm:nat.sys.getTimeStamp()
    };

    // TO DO : check walletaddr & check sign message 
    postdata.walletaddr;
    postdata.signmsg;

    let uid = await nat.datas.get_wallet_userid(retdata.wallet);
    if(uid == undefined || uid.length == 0){
        // new user
        let nuid = await nat.datas.generate_autoinc_id("userid");
        retdata.uid = nuid.toString();

        // bind wallet & user
        await nat.datas.set_wallet_userid(retdata.wallet, retdata.uid);

        // generate token
        retdata.token = _generate_login_token(retdata.uid);

        // insert user data
        await nat.datas.persistcaches.user.insert_data("base", retdata.uid,  retdata);
    }
    else {
        retdata.uid = uid;

        // generate token
        retdata.token = _generate_login_token(uid);

        // update user data
        await nat.datas.persistcaches.user.update_data("base", retdata.uid, retdata, "."); // TO DO : only update token & last login time
    }

    res.write(JSON.stringify({
        res:"OK",
        data:retdata
    }));
    res.end();
}

export const on_broadcast_msg = async (req:http_request_like, res:http_response_like):Promise<void> => {
    if(req.postdata == undefined){
        res.write(http_param_err_json);
        res.end();
        return;
    }
    let postdata = JSON.parse(req.postdata);
    if(!("type" in postdata) || !("msg" in postdata)){
        res.write(http_param_err_json);
        res.end();
        return;
    }

    let pkt = network.def_wslistener.pcodec.create_protopkt("borad_cast_msg", postdata);
    
    // borad cast to whole server
    network.def_wslistener.broadcast_packet(pkt);
}