// natrium
// license : MIT
// author : Sean Chen

import { nat } from "..";
import { http_request_like, http_response_like } from "../interface/network/httplistener";
import { network } from "../interface/network/network";

export const http_unknown_cmd_json = `{"res":"Unknown command"}`;
export const http_param_err_json = `{"res":"Parameter error"}`;
export const http_interal_json = `{"res":"Internal error"}`;

export const on_reg_evt_mon = async (req:http_request_like, res:http_response_like):Promise<void> => {
    if(req.postdata == undefined){
        res.write(http_param_err_json);
        res.end();
        return;
    }
    let postdata = JSON.parse(req.postdata);
    if(!("evt_name" in postdata) || !("cb_url" in postdata)){
        res.write(http_param_err_json);
        res.end();
        return;
    }

    // TO DO : regist event monitor 
    // var conn = nat.create_httpconnecter(false);
    // var url = "http://127.0.0.1:8090";
    // await conn.post(url+"/register_event_monitor", params)
}

export const on_get_tx_byhash = async (req:http_request_like, res:http_response_like):Promise<void> => {
    if(req.postdata == undefined){
        res.write(http_param_err_json);
        res.end();
        return;
    }
    let postdata = JSON.parse(req.postdata);
    if(!("txhash" in postdata)){
        res.write(http_param_err_json);
        res.end();
        return;
    }

    // TO DO : fetch & return tx with receipt
}