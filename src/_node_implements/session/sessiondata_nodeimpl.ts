// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "../../interface/data/dataobj";
import { sessiondata } from "../../interface/session/sessiondatas";
import { dataobj_nodeimpl } from "../data/dataobj_nodeimpl";

export class sessiondata_nodeimpl implements sessiondata {
    
    public set_default_value(key:string, data:any):void {

    }
    
    public get_dataobj(key:string):dataobj {
        return new dataobj_nodeimpl();
    }

    public write_all():void {

    }
}