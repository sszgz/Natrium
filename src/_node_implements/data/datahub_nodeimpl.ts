// natrium
// license : MIT
// author : Sean Chen

import { datacomp } from "../../interface/data/datacomp";
import { datahub, mysql_map, redis_map } from "../../interface/data/datahub";
import { mysqlclient } from "../../interface/data/mysqlclient";
import { rediscache } from "../../interface/data/rediscache";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { _redis_client } from "../_node/_redis";
import { rediscache_nodeimpl } from "./rediscache_nodeimpl";

export class datahub_nodeimpl implements datahub {

    protected _memcaches:redis_map = {};
    protected _persistcaches:redis_map = {};
    protected _mysqls:mysql_map = {};

    protected _session_rc:rediscache_nodeimpl|null = null;
    protected _user_rc:rediscache_nodeimpl|null = null;
    protected _uniquename_rc:rediscache_nodeimpl|null = null;

    constructor() {

    }
    get memcaches() :redis_map {
        return this._memcaches;
    }
    get persistcaches() :redis_map {
        return this._persistcaches;
    }
    get mysqls() :mysql_map {
        return this._mysqls;
    }

    public async init():Promise<boolean> {
        
        const svrconf = natrium_nodeimpl.impl.conf.get_serverconf();
        if(svrconf == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datahub_nodeimpl startup server config not exist`);
            return false;
        }

        // connect redis
        for(const key in svrconf.redis_confs) {
            const rcc = svrconf.redis_confs[key];
            const rc = new rediscache_nodeimpl(rcc);

            await rc.connect();
            if(rc.connected) {
                natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `datahub_nodeimpl startup redis [${key}] connected`);
                if(rcc.persist){
                    this._persistcaches[key] = rc;
                    
                    if(key == "user"){
                        this._user_rc = rc;
                    }
                    else if(key == "uniquename") {
                        this._uniquename_rc = rc;
                    }
                }
                else {
                    this._memcaches[key] = rc;
                    
                    if(key == "session") {
                        this._session_rc = rc;
                    }
                }
            }
            else {
                natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl startup redis [${key}] not ready`);
            }
        }
        
        if(this._uniquename_rc == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datahub_nodeimpl startup uniquename redis config not exist`);
            return false;
        }
        if(this._user_rc == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datahub_nodeimpl startup user redis config not exist`);
            return false;
        }
        if(this._session_rc == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datahub_nodeimpl startup session redis config not exist`);
            return false;
        }

        // TO DO : connect mysql
        
        return true;
    }
    
    public async set_wallet_userid(walletaddr:string, uid:string):Promise<boolean> {
        if(this._user_rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl set_wallet_userid redis db [user] not exist`);
            return false;
        }

        let dkey = `__wu_${walletaddr}`;

        return await this._user_rc.rc.set(dkey, uid);
    }
    public async get_wallet_userid(walletaddr:string):Promise<string> {
        if(this._user_rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl get_wallet_userid redis db [user] not exist`);
            return "";
        }

        let dkey = `__wu_${walletaddr}`;

        return await this._user_rc.rc.get(dkey);
    }

    public async set_user_sessionid(uid:string, sid:number):Promise<boolean> {
        if(this._session_rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl set_user_sessionid redis db [session] not exist`);
            return false;
        }

        let dkey = `__bindsid_${uid}`;

        return await this._session_rc.rc.set(dkey, sid);
    }
    public async get_user_sessionid(uid:string):Promise<any> {
        if(this._session_rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl get_user_sessionid redis db [session] not exist`);
            return null;
        }

        let dkey = `__bindsid_${uid}`;

        return await this._session_rc.rc.get(dkey);
    }
    public async del_user_sessionid(uid:string):Promise<boolean> {
        if(this._session_rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl del_user_sessionid redis db [session] not exist`);
            return false;
        }

        let dkey = `__bindsid_${uid}`;

        return await this._session_rc.rc.del(dkey);
    }

    public async generate_autoinc_id(key:string):Promise<number> {
        if(this._uniquename_rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl generate_autoinc_id redis db [user] not exist`);
            return 0;
        }
        
        let dkey = `autoinc_${key}`;
        
        return await this._uniquename_rc.rc.incr(dkey);
    }
    
    public create_redis_datacomp<T extends datacomp>(
        type: { new(rc:rediscache, tablename:string, key:string|number): T ;}, 
        dbname:string, tablename:string, key:string|number, persist:boolean):datacomp|null 
    {
        if(persist){

            if(!(dbname in this._persistcaches)){
                return null;
            }
            
            return new type(this._persistcaches[dbname], tablename, key);
        }
        else {

            if(!(dbname in this._memcaches)){
                return null;
            }
            
            return new type(this._memcaches[dbname], tablename, key);
        }
    }
    public create_mysql_datacomp<T extends datacomp>(
        type: { new(mc:mysqlclient, rc:rediscache, tablename:string, key:string|number): T ;}, 
        dbname:string, tablename:string, key:string|number):datacomp|null 
    {
        if(!(dbname in this._memcaches)){
            return null;
        }
        
        if(!(dbname in this._mysqls)){
            return null;
        }
        
        return new type(this._mysqls[dbname], this._memcaches[dbname], tablename, key);
    }
}