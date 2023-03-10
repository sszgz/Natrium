// natrium
// license : MIT
// author : Sean Chen

import { datamanager } from "../../interface/data/datamanager";
import { dataobj } from "../../interface/data/dataobj";
import { globaldatas } from "../../interface/data/globaldata";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { _redis_client } from "../_node/_redis";
import { dataobj_nodeimpl } from "./dataobj_nodeimpl";

export class datamanager_nodeimpl implements datamanager {
    protected _redis_clients:Map<string, _redis_client> = new Map<string, _redis_client>();

    protected _session_rc:_redis_client|null = null;
    
    public async init():Promise<void> {
        
        const svrconf = natrium_nodeimpl.impl.conf.get_serverconf();
        if(svrconf == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl startup server config not exist`);
            return;
        }
        const session_redis_conf = svrconf.get_redis_conf("session");
        if(session_redis_conf == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl startup session redis config not exist`);
            return;
        }

        // connect redis
        for(const key in svrconf.redis_confs) {
            const rcc = svrconf.redis_confs[key];
            const rc = new _redis_client(rcc);

            await rc.connect();
            if(rc.connected) {
                natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `datamanager_nodeimpl startup redis [${key}] connected`);
                if(key == "session") {
                    this._session_rc = rc;
                }
                else {
                    this._redis_clients.set(key, rc);
                }
            }
            else {
                natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl startup redis [${key}] not ready`);
            }
        }

        // TO DO : connect mysql
        
        return;
    }
    
    public create_session_dataobj(sid:number, key:string, default_data:any):dataobj|null {
        if(this._session_rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl create_dataobj redis db [session] not exist`);
            return null;
        }

        let dkey = `${sid}_${key}`;
        return new dataobj_nodeimpl(this._session_rc, "session", dkey, default_data);
    }

    public create_globaldatas(table_name:string):globaldatas|null {
        return null;
    }

}