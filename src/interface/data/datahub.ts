// natrium
// license : MIT
// author : Sean Chen

import { datacomp } from "./datacomp";
import { mysqlclient } from "./mysqlclient";
import { rediscache } from "./rediscache";

export type redis_map = {
    [key:string]:rediscache;
}
export type mysql_map = {
    [key:string]:mysqlclient;
}

export interface datahub {
    readonly memcaches:redis_map;
    readonly persistcaches:redis_map;
    readonly mysqls:mysql_map;

    init():Promise<boolean>;
    generate_autoinc_id(key:string):Promise<number>;

    set_wallet_userid(walletaddr:string, uid:string):Promise<boolean>;
    get_wallet_userid(walletaddr:string):Promise<string>;

    set_user_sessionid(uid:string, sid:number):Promise<boolean>;
    get_user_sessionid(uid:string):Promise<any>;
    del_user_sessionid(uid:string):Promise<boolean>;

    create_redis_datacomp<T extends datacomp>(
        type: { new(rc:rediscache, tablename:string, key:string|number): T ;}, 
        dbname:string, tablename:string, key:string|number, persist:boolean):datacomp|null;
    create_mysql_datacomp<T extends datacomp>(
        type: { new(mc:mysqlclient, rc:rediscache, tablename:string, key:string|number): T ;}, 
        dbname:string, tablename:string, key:string|number):datacomp|null;
}