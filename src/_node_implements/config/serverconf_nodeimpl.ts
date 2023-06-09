// natrium
// license : MIT
// author : Sean Chen

import { dbconf, httplistenerconf, redisconf, serverconf, serviceconf, wslistenerconf } from "../../interface/config/configs";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";

export class serverconf_nodeimpl implements serverconf {

    protected _data:any;

    protected _service_confs:any = {};

    constructor(d:any) {
        this._data = d;
    }

    public get db_confs(){
        return this._data.db;
    }
    public get redis_confs(){
        return this._data.redis;
    }
    public get service_confs(){
        return this._service_confs;
    }
    public get chainwatcher_confs(){
        return this._data.chainwatcher;
    }

    public format_server_conf(){
        for(let i=0; i<this._data.services.length; ++i){
            this._service_confs[this._data.services[i].service_name] = this._data.services[i];
        }
    }
    
    public get_db_conf(dbname:string):dbconf|null {
        if(!(dbname in this._data.db)) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serverconf_nodeimpl get_db_conf:${dbname} not exist`);
            return null;
        }
        return this._data.db[dbname];
    }
    public get_redis_conf(dbname:string):redisconf|null {
        if(!(dbname in this._data.redis)) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serverconf_nodeimpl get_redis_conf:${dbname} not exist`);
            return null;
        }
        return this._data.redis[dbname];
    }
    public get_services_conf():serviceconf[]|null {
        if(!("services" in this._data)) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serverconf_nodeimpl get_services_conf not exist`);
            return null;
        }
        return this._data.services;
    }
    public get_wslistener_conf():wslistenerconf|null {
        if(!("wslistener" in this._data)) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serverconf_nodeimpl get_wslistener_conf not exist`);
            return null;
        }
        return this._data.wslistener;
    }
    public get_httplistener_conf():httplistenerconf|null {
        if(!("httplistener" in this._data)) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serverconf_nodeimpl get_httplistener_conf not exist`);
            return null;
        }
        return this._data.httplistener;
    }

}