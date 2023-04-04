// natrium
// license : MIT
// author : Sean Chen

import { isMainThread, Worker, MessageChannel, MessagePort, workerData, parentPort, threadId } from "node:worker_threads";
import { debug_level_enum } from "../../../interface/debug/debug_logger";
import { nat } from "../../../natrium";
import { _Node_ThreadContext } from "../../../_node_implements/_node/_thread_contexts";
import { natrium_server } from "../../natrium_server";
import { player } from "../player";
import { player_portdatacomp, player_warrantdatacomp } from "./user_datas";

class _mint_warrant implements _user_data_mod {

    public async direct_mod(uid:string, data:any):Promise<void> {
        let player_warrantdata = nat.datas.create_redis_datacomp(player_warrantdatacomp, "player", "warrant", uid, true);
        if(player_warrantdata == null){
            nat.dbglog.log(debug_level_enum.dle_error, `_mint_warrant direct_mod [${uid}] create_redis_datacomp error `);
            return;
        }

        let datas = await player_warrantdata.sync_from_db();
        if(datas == undefined){
            player_warrantdata.mod_rundata([{
                warrantnftid:data.tokenId,
                portID:data.portID,
                storehouseLv:data.storehouseLv,
                factoryLv:data.storehouseLv,
                shopLv:data.storehouseLv,
                shipyardLv:data.storehouseLv,
            }]);
            player_warrantdata.flush_to_db(true);
        }
        else {
            this._add(player_warrantdata as player_warrantdatacomp, data);
        }
    }

    public async service_mod(ply:player, data:any):Promise<void> {
        if("player_warrant" in ply.pdatas){
            this._add(ply.pdatas.player_warrant as player_warrantdatacomp, data);
        }
        else {
            let player_warrantdata = nat.datas.create_redis_datacomp(player_warrantdatacomp, "player", "warrant", ply.cdatas.ses_base.rundata.uid, true);
            if(player_warrantdata == null){
                nat.dbglog.log(debug_level_enum.dle_error, `_mint_warrant service_mod [${ply.cdatas.ses_base.rundata.uid}] create_redis_datacomp error `);
                return;
            }

            let datas = await player_warrantdata.sync_from_db();
            if(datas != undefined){
                ply.pdatas[player_warrantdata.name] = player_warrantdata;
            }
            else {
                player_warrantdata.mod_rundata([{
                    warrantnftid:data.tokenId,
                    portID:data.portID,
                    storehouseLv:data.storehouseLv,
                    factoryLv:data.storehouseLv,
                    shopLv:data.storehouseLv,
                    shipyardLv:data.storehouseLv,
                }]);
                player_warrantdata.flush_to_db(true);
                ply.pdatas[player_warrantdata.name] = player_warrantdata;
            }
        }
    }

    protected async _add(player_warrantdata:player_warrantdatacomp, data:any):Promise<void> {
        player_warrantdata.warrants.warrants.push({
            warrantnftid:data.tokenId,
            portID:data.portID,
            storehouseLv:data.storehouseLv,
            factoryLv:data.storehouseLv,
            shopLv:data.storehouseLv,
            shipyardLv:data.storehouseLv,
        });
        player_warrantdata.flush_to_db(true);
    }
}
class _add_warrant implements _user_data_mod {

    public async direct_mod(uid:string, data:any):Promise<void> {
        // TO DO : add warrant

    }

    public async service_mod(ply:player, data:any):Promise<void> {
        // TO DO : add warrant
    }

    protected async _mod(player_portdata:player_portdatacomp, data:any):Promise<void> {
        // TO DO : add warrant
    }
}
class _rmv_warrant implements _user_data_mod {

    public async direct_mod(uid:string, data:any):Promise<void> {
        // TO DO : add warrant

    }

    public async service_mod(ply:player, data:any):Promise<void> {
        // TO DO : add warrant
    }

    protected async _mod(player_portdata:player_portdatacomp, data:any):Promise<void> {
        // TO DO : add warrant
    }
}

export const user_data_change_proc:_user_data_mod_map = {
    "mint_warrant": new _mint_warrant(),
    "add_warrant": new _add_warrant(),
    "rmv_warrant": new _rmv_warrant(),
};

interface _user_data_mod {
    direct_mod(uid:string, data:any):Promise<void>;
    service_mod(ply:player, data:any):Promise<void>;
}
type _user_data_mod_map = {
    [key:string]:_user_data_mod
}

export class globaldatas {
    
    public static async _do_service_mod(ply:player, datamsg:string, data:any):Promise<void> {
        
        if(!(datamsg in user_data_change_proc)){
            nat.dbglog.log(debug_level_enum.dle_error, `globaldatas _do_service_mod [${datamsg}] not in user_data_change_proc`);
            return;        
        }

        // direct modify
        await user_data_change_proc[datamsg].service_mod(ply, data);
    }

    public static async on_user_data_change(uid:string, datamsg:string, data:any):Promise<void> {
        
        if(!(datamsg in user_data_change_proc)){
            nat.dbglog.log(debug_level_enum.dle_error, `globaldatas on_user_data_change [${datamsg}] not in user_data_change_proc`);
            return;        
        }

        // if(!isMainThread){
        //     _Node_ThreadContext.postOnUserDataChange(uid, datamsg, data);
        //     return;
        // }

        // direct modify
        await user_data_change_proc[datamsg].direct_mod(uid, data);

        let sid = await nat.datas.get_user_sessionid(uid);
        if(sid != undefined){
            // online, notify session modify
            let ses = natrium_server.inst.sessions.get_session_by_sid(sid);
            if(ses != undefined){
                ses.current_service.channel.dispatch_session_mod_data(sid, uid, datamsg, data);
            }
            else {
                nat.dbglog.log(debug_level_enum.dle_error, `globaldatas on_user_data_change [${datamsg}] sid[${sid}] not found in sessoins, go direct_mod`);
            }
        }
    }
    
    
}