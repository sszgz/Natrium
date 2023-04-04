// natrium
// license : MIT
// author : Sean Chen

import { redisconf } from "../config/configs";

export interface rediscache {
    dbname:string;
    is_persist:boolean;
    conf:redisconf;

    connect() : Promise<any>;
    read_data(table:string, key:string|number, path:string) : Promise<any>;
    update_data(table:string, key:string|number, data:any, path:string) : Promise<boolean>;
    clear_datas():Promise<boolean>;
    insert_data(table:string, key:string|number, data:any) : Promise<boolean>;
    delete_data(table:string, key:string|number, path:string) : Promise<boolean>;
}