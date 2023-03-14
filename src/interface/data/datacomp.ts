// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../natrium";
import { object_util } from "../../util/object_util";
import { debug_level_enum } from "../debug/debug_logger";
import { mysqlclient } from "./mysqlclient";
import { rediscache } from "./rediscache";

export interface datacomp {
    readonly name:string;
    readonly dbname:string;
    readonly talbe:string;
    readonly key:string|number;
    readonly is_persist:boolean;

    readonly rundata:any;
    readonly dbdata_readed:boolean;

    mod_rundata(new_rundata:any):void;
    read_from_db():Promise<any>;

    sync_from_db():Promise<any>;
    flush_to_db(do_persist:boolean):Promise<boolean>;
}

export type datacomp_map = {
    [key:string]:datacomp;
}

export class datacomp_redis implements datacomp {

    protected _table:string;
    protected _key:string|number;
    protected _rc:rediscache;

    protected _rundata:any;
    protected _dbdata:any;
    protected _last_write_dbdata:any;

    constructor(rc:rediscache, t:string, k:string|number) {
        this._rc = rc;
        this._table = t;
        this._key = k;
    }
    
    get name():string{
        return "datacomp_redis";
    }
    get dbname():string {
        return this._rc.conf.name;
    }
    get talbe():string {
        return this.talbe;
    }
    get key():string|number {
        return this._key;
    }
    get is_persist():boolean {
        return this._rc.is_persist;
    }

    get rundata():any {
        return this._rundata;
    }
    get dbdata_readed():boolean {
        return this._dbdata != undefined;
    }
    // don't expose
    // get dbdata():any {
    //     return this._dbdata;
    // }
    // get last_write_dbdata():any {
    //     return this._last_write_dbdata;
    // }

    protected _format_to_dbdata(rundata:any):any {
        return rundata;
    }
    protected _format_to_rundata(dbdata:any):any {
        return dbdata;
    }

    public mod_rundata(new_rundata:any):void {
        this._rundata = new_rundata;
    }

    public async read_from_db():Promise<any> {
        if(this._dbdata != undefined){
            return this._dbdata;
        }
        this._dbdata = await this._rc.read_data(this._table, this._key, ".");
        this._last_write_dbdata = this._dbdata;
        return this._dbdata;
    }
    public async sync_from_db():Promise<any> {
        if(this._dbdata == undefined) {
            this._dbdata = await this._rc.read_data(this._table, this._key, ".");
            this._last_write_dbdata = this._dbdata;
            if(this._dbdata == undefined){
                return undefined;
            }
        }

        this._rundata = this._format_to_rundata(object_util.deepClone(this._dbdata));

        return this._rundata;
    }
    public async flush_to_db(do_persist:boolean):Promise<boolean> {
        if(this._rundata == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `datacomp_redis [${this.dbname}-${this.talbe}-${this.key}] flush_to_db rundata null`);
            return false;
        }

        this._dbdata = this._format_to_dbdata(object_util.deepClone(this._rundata));

        if(this._dbdata == undefined) {
            nat.dbglog.log(debug_level_enum.dle_error, `datacomp_redis [${this.dbname}-${this.talbe}-${this.key}] flush_to_db dbdata null`);
            return false;
        }

        // TO DO : compare with last write dbdata & fetch minimum update

        return await this._rc.update_data(this._table, this._key, this._dbdata, ".");
    }
}

export class datacomp_mysql extends datacomp_redis {

    protected _mc:mysqlclient;

    constructor(mc:mysqlclient, rc:rediscache, t:string, k:string|number) {
        super(rc, t, k);
        this._mc = mc;
    }

    override get name():string{
        return "datacomp_mysql";
    }
    override get is_persist():boolean {
        return true;
    }

    public async read_from_db():Promise<any> {
        this._dbdata = await super.read_from_db();
        if(this._dbdata == undefined) {
            // TO DO : read from mysql
            this._last_write_dbdata = this._dbdata;
        }
        return this._dbdata;
    }
    public async sync_from_db():Promise<any> {
        if(this._dbdata == undefined) {
            await this.read_from_db();
            if(this._dbdata == undefined) {
                return undefined;
            }
        }

        this._rundata = this._format_to_rundata(object_util.deepClone(this._dbdata));

        return this._rundata;
    }
    public async flush_to_db(do_persist:boolean):Promise<boolean> {
        let succ = await super.flush_to_db(do_persist);

        if(!succ){
            return false;
        }

        if(do_persist) {
            // TO DO : write back to mysql
            //return await this._mc;
        }

        return true;
    }
}