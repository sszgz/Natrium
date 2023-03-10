// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "../data/dataobj";
import { session } from "./session";

export interface sessiondata {

    set_default_value(key:string, data:any):void;
    
    init_dataobj(key:string):Promise<dataobj|null>;
    get_dataobj(key:string):dataobj|null;

    write_all(do_persisit:boolean):Promise<void>;
}