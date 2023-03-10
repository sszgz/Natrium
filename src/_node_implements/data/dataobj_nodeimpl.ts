// natrium
// license : MIT
// author : Sean Chen

import * as crypto from "node:crypto";
import { dataobj } from "../../interface/data/dataobj";
import { object_util } from "../../util/object_util";
import { _redis_client } from "../_node/_redis";

export class dataobj_nodeimpl implements dataobj {

    protected static _md5sum = crypto.createHash("md5");

    protected _rc_key:string = "";
    protected _rc:_redis_client;

    protected _db_name:string = "";
    protected _key:string = "";
    protected _data:any = null;
    protected _last_write_data:any = null;

    constructor(r:_redis_client, tn:string, k:string, d:any) {
        this._rc = r;
        this._rc_key = dataobj_nodeimpl._md5sum.update(`${this._db_name}_${this._key}`).digest('hex'); // calc hash key
        this._db_name = tn;
        this._key = k;
        this._data = d;
        this._last_write_data = d;
    }

    public get db_name():string {
        return this._db_name;
    }
    public get key():string {
        return this._key;
    }
    public get data():any {
        return this._data;
    }
    public get last_write_data():any {
        return this._last_write_data;
    }

    public mod_data(new_data:any):void {
        this._data = new_data;
    }

    public async write_back(do_persist:boolean):Promise<boolean> {
        // TO DO :compare _data & _last_write_data
        // if(object_util.deepEqual(this._data, this._last_write_data)){
        //     // no change
        //     return true;
        // }

        // write to cache
        this._rc.update_json(this._rc_key, ".", this._data);

        if(do_persist){
            // TO DO : write to disk
        }

        return true;
    }
}