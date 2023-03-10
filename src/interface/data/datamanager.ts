// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "./dataobj";
import { globaldatas } from "./globaldata";

export interface datamanager {
    init():Promise<void>;
    
    create_session_dataobj(sid:number, key:string, default_data:any):dataobj|null;

    create_globaldatas(table_name:string):globaldatas|null;
}