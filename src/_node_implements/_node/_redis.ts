// natrium
// license : MIT
// author : Sean Chen

import { createClient } from 'redis';
import { debug_level_enum } from '../../interface/debug/debug_logger';
import { natrium_nodeimpl } from '../natrium_nodeimpl';

export interface _redis_conf {
    readonly url:string;
    readonly username:string;
    readonly password:string;
    readonly name:string;
    readonly database:number;
}

export class _redis_client {

    protected _client:any = null;
    protected _conf:_redis_conf;

    constructor(conf:_redis_conf) {
        this._conf = conf;
    }

    public async connect():Promise<void> {
        this._client = createClient({
            //url: 'redis://alice:foobared@awesome.redis.server:6380'
            url: this._conf.url,
            username:this._conf.username,
            password:this._conf.password,
            name:this._conf.name,
            database:this._conf.database
          });

        this._client.on("error", (err:Error)=>{
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} error:${err.message}\r\n${err.stack}`);
            // TO DO : error
        });

        await this._client.connect();
    }

    public async disconnect():Promise<void> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} disconnect client is null`);
            return;
        }
        if(!this._client.isOpen) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} disconnect client not open`);
            return;
        }

        await this._client.quit();
    }

    public async insert_json(key:string, value:any):Promise<boolean> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} insert_json key:${key} client is null`);
            return false;
        }
        if(!this._client.isOpen) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} insert_json key:${key} client not open`);
            return false;
        }

        // RedisJSON uses JSON Path syntax. '.' is the root.
        await this._client.json.set(key, '.', value);

        return true;
    }

    public async update_json(key:string, path:string, value:any):Promise<boolean> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} update_json key:${key} client is null`);
            return false;
        }
        if(!this._client.isOpen) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} update_json key:${key} client not open`);
            return false;
        }
        
        // RedisJSON uses JSON Path syntax. '.' is the root.
        await this._client.json.set(key, path, value);

        return true;
    }

    public async get_json(key:string, path:string):Promise<any>{
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} get_json key:${key} client is null`);
            return null;
        }
        if(!this._client.isOpen) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} get_json key:${key} client not open`);
            return null;
        }

        return await this._client.json.get(key, {
            path: path,
        });
    }

    
}