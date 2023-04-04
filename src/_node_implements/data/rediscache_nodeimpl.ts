// natrium
// license : MIT
// author : Sean Chen

import { redisconf } from "../../interface/config/configs";
import { rediscache } from "../../interface/data/rediscache";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { _redis_client } from "../_node/_redis";

export class rediscache_nodeimpl implements rediscache {

    protected _rc:_redis_client;

    constructor(c:redisconf) {
        this._rc = new _redis_client(c);
    }

    get rc():_redis_client {
        return this._rc;
    }

    get dbname():string {
        return this._rc.conf.name;
    }
    get is_persist():boolean {
        return this._rc.conf.persist;
    }
    get conf():redisconf {
        return this._rc.conf;
    }
    get connected():boolean {
        return this._rc.connected;
    }

    public async connect() : Promise<any> {
        await this._rc.connect();
    }
    
    public async read_data(table:string, key:string|number, path:string) : Promise<any> {
        if(this._rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `rediscache_nodeimpl read_data redis db [${this.dbname}] not exist`);
            return null;
        }

        let dkey = `${table}_${key}`;

        return await this._rc.get_json(dkey, path);
    }
    public async update_data(table:string, key:string|number, data:any, path:string) : Promise<boolean> {
        if(this._rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `rediscache_nodeimpl update_data redis db [${this.dbname}] not exist`);
            return false;
        }

        let dkey = `${table}_${key}`;
        
        return await this._rc.update_json(dkey, path, data);
    }
    public async clear_datas():Promise<boolean> {
        if(this._rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `rediscache_nodeimpl clear_datas redis db [${this.dbname}] not exist`);
            return false;
        }

        return this._rc.clearall();
    }
    public async insert_data(table:string, key:string|number, data:any) : Promise<boolean> {

        if(this._rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `rediscache_nodeimpl insert_data redis db [${this.dbname}] not exist`);
            return false;
        }

        let dkey = `${table}_${key}`;
        
        return await this._rc.insert_json(dkey, data);
    }
    public async delete_data(table:string, key:string|number, path:string) : Promise<boolean> {
        if(this._rc == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `rediscache_nodeimpl delete_data redis db [${this.dbname}] not exist`);
            return false;
        }

        let dkey = `${table}_${key}`;
        
        return await this._rc.delete_json(dkey, path);
    }
}