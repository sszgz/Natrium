// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "../../interface/data/dataobj";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { sessiondata } from "../../interface/session/sessiondatas";
import { dataobj_nodeimpl } from "../data/dataobj_nodeimpl";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { _redis_client } from "../_node/_redis";

export class sessiondata_nodeimpl implements sessiondata {

    protected _sid:number = 0;
    protected _default_value:Map<string, any> = new Map<string, any>();
    protected _datas:Map<string, dataobj> = new Map<string, dataobj>();
    
    constructor(sid:number) {
        this._sid = sid;
    }
    
    public set_default_value(key:string, data:any):void {
        this._default_value.set(key, data);
    }
    
    public get_dataobj(key:string):dataobj|null {
        const d = this._datas.get(key);
        if(d != undefined){
            return d;
        }

        const def = this._default_value.get(key);
        const newd = natrium_nodeimpl.impl.datas.create_session_dataobj(this._sid, key, def);
        if(newd == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `get_dataobj session:${this._sid} key:${key} create session data error`);
            return null;
        }

        this._datas.set(key, newd);
        return newd;
    }

    public write_all(do_persisit:boolean):void {
        this._datas.forEach((v, k)=>{
            v.write_back(do_persisit);
        });
    }
}