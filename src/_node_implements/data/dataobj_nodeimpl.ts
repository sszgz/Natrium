// natrium
// license : MIT
// author : Sean Chen

import * as crypto from "node:crypto";
import { dataobject } from "../../interface/data/dataobj";
import { object_util } from "../../util/object_util";
import { _redis_client } from "../_node/_redis";

export class dataobj_nodeimpl implements dataobject {

    protected _rc_key:string = "";
    protected _rc:_redis_client;

    protected _db_name:string = "";
    protected _key:string = "";
    protected _data:any = null;
    protected _last_write_data:any = null;

    public static make_rc_key(db_name:string, key:string):string {
        // const md5sum = crypto.createHash("md5");
        // return md5sum.update(`${db_name}_${key}`).digest('hex');
        return `${db_name}_${key}`;
    }

    constructor(r:_redis_client, tn:string, k:string, d:any) {
        this._rc = r;
        this._db_name = tn;
        this._key = k;
        this._data = d;
        this._last_write_data = d;

        this._rc_key = dataobj_nodeimpl.make_rc_key(this._db_name, this._key); // calc hash key
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

    // read data from db
    // if data not exist, than insert with default value
    public async get_data_initdef():Promise<any>{
        // read from cache
        let data = await this._rc.get_json(this._rc_key, ".");
        if(data == null){
            // TO DO : read from persist

            // new data with default value
            await this._rc.insert_json(this._rc_key, this._data);
        }
        else {
            this._data = data;
            this._last_write_data = data;
        }
            
        return this._data;
    }

    // only read data from db
    public async read_data():Promise<any> {
        let data = await this._rc.get_json(this._rc_key, ".");
        if(data==null){
            // TO DO : read from persist
            return null;
        }

        this._data = data;
        this._last_write_data = data;

        return this._data;
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