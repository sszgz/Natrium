// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "../../interface/data/dataobj";
import { sessiondata } from "../../interface/session/sessiondatas";
import { dataobj_nodeimpl } from "../data/dataobj_nodeimpl";

export class sessiondata_nodeimpl implements sessiondata {
    
    set_default_value(key:string, data:any):void {

    }
    
    get_dataobj(key:string):dataobj {
        return new dataobj_nodeimpl();
    }

    write_all():void {

    }
}