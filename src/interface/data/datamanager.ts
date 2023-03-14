// // natrium
// // license : MIT
// // author : Sean Chen

// import { dataobject } from "./dataobj";
// import { globaldatas } from "./globaldata";
// import { mysqlclient } from "./mysqlclient";
// import { rediscache } from "./rediscache";

// export interface datamanager {
//     init():Promise<void>;
    
//     set_user_sessionid(uid:string, sid:number):Promise<boolean>;
//     get_user_sessionid(uid:string):Promise<any>;
//     del_user_sessionid(uid:string):Promise<boolean>;

//     set_wallet_userid(walletaddr:string, uid:string):Promise<boolean>;
//     get_wallet_userid(walletaddr:string):Promise<string>;

//     clear_session_datas():Promise<boolean>;
//     insert_session_data(sid:number, key:string, data:any):Promise<boolean>;
//     update_session_data(sid:number, key:string, data:any, path:string):Promise<boolean>;
//     read_session_data(sid:number, key:string):Promise<any>;
//     delete_session_data(sid:number, key:string):Promise<boolean>;
    
//     insert_user_data(uid:string, key:string, data:any):Promise<boolean>;
//     update_user_data(uid:string, key:string, data:any, path:string):Promise<boolean>;
//     read_user_data(uid:string, key:string):Promise<any>;
//     delete_user_data(uid:string, key:string):Promise<boolean>;
    
//     insert_player_data(uid:string, key:string, data:any):Promise<boolean>;
//     update_player_data(uid:string, key:string, data:any, path:string):Promise<boolean>;
//     read_player_data(uid:string, key:string):Promise<any>;
//     delete_player_data(uid:string, key:string):Promise<boolean>;

//     generate_autoinc_id(key:string):Promise<number>;
    
//     create_user_dataobj(uid:string, dbname:string, key:string, default_data:any):Promise<dataobject|null>;

//     create_globaldatas(table_name:string):globaldatas|null;
// }