// natrium
// license : MIT
// author : Sean Chen

import { dataobj } from "./dataobj";
import { globaldatas } from "./globaldata";

export interface datamanager {
    init():Promise<void>;
    
    insert_session_data(sid:number, key:string, data:any):Promise<boolean>;
    read_session_data(sid:number, key:string):Promise<any>;
    create_session_dataobj(sid:number, key:string, default_data:any):Promise<dataobj|null>;

    create_globaldatas(table_name:string):globaldatas|null;
}