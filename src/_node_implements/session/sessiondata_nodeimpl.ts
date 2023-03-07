// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "../../interface/data/dataobj";
import { sessiondata } from "../../interface/session/sessiondatas";
import { dataobj_nodeimpl } from "../data/dataobj_nodeimpl";
import { _redis_client } from "../_node/_redis";

export class sessiondata_nodeimpl implements sessiondata {

    protected _rc:_redis_client;

    constructor(rc:_redis_client) {
        this._rc = rc;
    }
    
    public set_default_value(key:string, data:any):void {

    }
    
    public get_dataobj(key:string):dataobj {
        return new dataobj_nodeimpl(this._rc, "","",null);
    }

    public write_all():void {

    }
}