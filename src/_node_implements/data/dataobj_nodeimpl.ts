// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "../../interface/data/dataobj";
import { _redis_client } from "../_node/_redis";

export class dataobj_nodeimpl implements dataobj {

    protected _rc:_redis_client;

    protected _table_name:string = "";
    protected _key:string = "";
    protected _data:any = null;
    protected _last_write_data:any = null;

    constructor(r:_redis_client, tn:string, k:string, d:any) {
        this._rc = r;
        this._table_name = tn;
        this._key = k;
        this._data = d;
        this._last_write_data = d;
    }

    public get table_name():string {
        return this._table_name;
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

        // write to cache

        if(do_persist){
            // write to disk
        }

        return true;
    }
}