// natrium
// license : MIT
// author : Sean Chen

import { createClient } from 'redis';
import { redisconf } from '../../interface/config/configs';
import { debug_level_enum } from '../../interface/debug/debug_logger';
import { natrium_nodeimpl } from '../natrium_nodeimpl';

export class _redis_client {

    protected _client:any = null;
    protected _conf:redisconf;

    constructor(conf:redisconf) {
        this._conf = conf;

        this._client = createClient({
            //url: 'redis://alice:foobared@awesome.redis.server:6380'
            url: this._conf.url,
            username:this._conf.username,
            password:this._conf.password,
            name:this._conf.name,
            database:this._conf.database
          });
    }

    public get connected():boolean{
        return this._client.isReady;
    }
    public get conf():redisconf {
        return this._conf;
    }

    public async connect():Promise<void> {

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
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} disconnect client not open`);
            return;
        }

        await this._client.quit();
    }

    public async clearall():Promise<boolean> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} clearall client is null`);
            return false;
        }
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} clearall client not open`);
            return false;
        }

        //await this._client.flushdb();
        await this._client.sendCommand(['FLUSHDB']);

        return true;
    }

    public async set(key:string, value:any):Promise<boolean> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} set key:${key} client is null`);
            return false;
        }
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} set key:${key} client not open`);
            return false;
        }

        await this._client.set(key, value);

        return true;
    }
    
    public async get(key:string):Promise<any> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} get key:${key} client is null`);
            return false;
        }
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} get key:${key} client not open`);
            return false;
        }

        return await this._client.get(key);
    }

    public async del(key:string):Promise<boolean> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} del key:${key} client is null`);
            return false;
        }
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} del key:${key} client not open`);
            return false;
        }

        await this._client.del(key);

        return true;
    }
    
    public async incr(key:string):Promise<number> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} incr key:${key} client is null`);
            return 0;
        }
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} incr key:${key} client not open`);
            return 0;
        }

        return await this._client.incr(key);
    }

    public async decr(key:string):Promise<number> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} decr key:${key} client is null`);
            return 0;
        }
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} decr key:${key} client not open`);
            return 0;
        }

        return await this._client.decr(key);
    }

    public async insert_json(key:string, value:any):Promise<boolean> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} insert_json key:${key} client is null`);
            return false;
        }
        if(!this._client.isReady) {
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
        if(!this._client.isReady) {
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
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} get_json key:${key} client not open`);
            return null;
        }

        return await this._client.json.get(key, {
            path: path,
        });
    }

    public async delete_json(key:string, path:string):Promise<boolean> {
        if(this._client == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} delete_json key:${key} client is null`);
            return false;
        }
        if(!this._client.isReady) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_redis ${this._conf.name}-${this._conf.database} delete_json key:${key} client not open`);
            return false;
        }
        
        await this._client.json.del(key, path);

        return true;
    }

}