// // natrium
// // license : MIT
// // author : Sean Chen

// import { datamanager } from "../../interface/data/datamanager";
// import { dataobject } from "../../interface/data/dataobj";
// import { globaldatas } from "../../interface/data/globaldata";
// import { debug_level_enum } from "../../interface/debug/debug_logger";
// import { natrium_nodeimpl } from "../natrium_nodeimpl";
// import { _redis_client } from "../_node/_redis";
// import { dataobj_nodeimpl } from "./dataobj_nodeimpl";

// export class datamanager_nodeimpl implements datamanager {
//     protected _redis_clients:Map<string, _redis_client> = new Map<string, _redis_client>();

//     protected _session_rc:_redis_client|null = null;
//     protected _user_rc:_redis_client|null = null;
    
//     public async init():Promise<void> {
        
//         const svrconf = natrium_nodeimpl.impl.conf.get_serverconf();
//         if(svrconf == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl startup server config not exist`);
//             return;
//         }
//         const session_redis_conf = svrconf.get_redis_conf("session");
//         if(session_redis_conf == null){
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl startup session redis config not exist`);
//             return;
//         }
//         const user_redis_conf = svrconf.get_redis_conf("user");
//         if(user_redis_conf == null){
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl startup user redis config not exist`);
//             return;
//         }

//         // connect redis
//         for(const key in svrconf.redis_confs) {
//             const rcc = svrconf.redis_confs[key];
//             const rc = new _redis_client(rcc);

//             await rc.connect();
//             if(rc.connected) {
//                 natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `datamanager_nodeimpl startup redis [${key}] connected`);
//                 if(key == "session") {
//                     this._session_rc = rc;
//                 }
//                 else if(key == "user"){
//                     this._user_rc = rc;
//                 }
//                 else {
//                     this._redis_clients.set(key, rc);
//                 }
//             }
//             else {
//                 natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl startup redis [${key}] not ready`);
//             }
//         }

//         // TO DO : connect mysql
        
//         return;
//     }
    
//     public async set_wallet_userid(walletaddr:string, uid:string):Promise<boolean> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl set_wallet_userid redis db [user] not exist`);
//             return false;
//         }

//         let dkey = `__wu_${walletaddr}`;

//         return await this._user_rc.set(dkey, uid);
//     }
//     public async get_wallet_userid(walletaddr:string):Promise<string> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl get_wallet_userid redis db [user] not exist`);
//             return "";
//         }

//         let dkey = `__wu_${walletaddr}`;

//         return await this._user_rc.get(dkey);
//     }

//     public async set_user_sessionid(uid:string, sid:number):Promise<boolean> {
//         if(this._session_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl set_user_sessionid redis db [session] not exist`);
//             return false;
//         }

//         let dkey = `__bindsid_${uid}`;

//         return await this._session_rc.set(dkey, sid);
//     }
//     public async get_user_sessionid(uid:string):Promise<any> {
//         if(this._session_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl get_user_sessionid redis db [session] not exist`);
//             return null;
//         }

//         let dkey = `__bindsid_${uid}`;

//         return await this._session_rc.get(dkey);
//     }
//     public async del_user_sessionid(uid:string):Promise<boolean> {
//         if(this._session_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl del_user_sessionid redis db [session] not exist`);
//             return false;
//         }

//         let dkey = `__bindsid_${uid}`;

//         return await this._session_rc.del(dkey);
//     }

//     public async clear_session_datas():Promise<boolean> {
//         if(this._session_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl read_session_data redis db [session] not exist`);
//             return false;
//         }

//         return this._session_rc.clearall();
//     }

//     public async read_session_data(sid:number, key:string):Promise<any> {
//         if(this._session_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl read_session_data redis db [session] not exist`);
//             return null;
//         }

//         let dkey = `${sid}_${key}`;

//         return await this._session_rc.get_json(dataobj_nodeimpl.make_rc_key("session", dkey), ".");
//     }
    
//     public async insert_session_data(sid:number, key:string, data:any):Promise<boolean> {
//         if(this._session_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [session] not exist`);
//             return false;
//         }

//         let dkey = `${sid}_${key}`;
        
//         return await this._session_rc.insert_json(dataobj_nodeimpl.make_rc_key("session", dkey), data);
//     }
    
//     public async update_session_data(sid:number, key:string, data:any, path:string):Promise<boolean> {
//         if(this._session_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [session] not exist`);
//             return false;
//         }

//         let dkey = `${sid}_${key}`;
        
//         return await this._session_rc.update_json(dataobj_nodeimpl.make_rc_key("session", dkey), path, data);
//     }
    
//     public async delete_session_data(sid:number, key:string):Promise<boolean> {
//         if(this._session_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [session] not exist`);
//             return false;
//         }

//         let dkey = `${sid}_${key}`;
        
//         return await this._session_rc.delete_json(dataobj_nodeimpl.make_rc_key("session", dkey));
//     }

//     public async read_user_data(uid:string, key:string):Promise<any> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl read_session_data redis db [user] not exist`);
//             return null;
//         }

//         let dkey = `${uid}_${key}`;

//         return await this._user_rc.get_json(dataobj_nodeimpl.make_rc_key("user", dkey), ".");
//     }
    
//     public async insert_user_data(uid:string, key:string, data:any):Promise<boolean> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [user] not exist`);
//             return false;
//         }

//         let dkey = `${uid}_${key}`;
        
//         return await this._user_rc.insert_json(dataobj_nodeimpl.make_rc_key("user", dkey), data);
//     }
    
//     public async update_user_data(uid:string, key:string, data:any, path:string):Promise<boolean> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [user] not exist`);
//             return false;
//         }

//         let dkey = `${uid}_${key}`;
        
//         return await this._user_rc.update_json(dataobj_nodeimpl.make_rc_key("user", dkey), path, data);
//     }
    
//     public async delete_user_data(uid:string, key:string):Promise<boolean> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [user] not exist`);
//             return false;
//         }

//         let dkey = `${uid}_${key}`;
        
//         return await this._user_rc.delete_json(dataobj_nodeimpl.make_rc_key("user", dkey));
//     }
    
//     public async read_player_data(uid:string, key:string):Promise<any> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl read_session_data redis db [user] not exist`);
//             return null;
//         }

//         let dkey = `${uid}_${key}`;

//         return await this._user_rc.get_json(dataobj_nodeimpl.make_rc_key("player", dkey), ".");
//     }
    
//     public async insert_player_data(uid:string, key:string, data:any):Promise<boolean> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [user] not exist`);
//             return false;
//         }

//         let dkey = `${uid}_${key}`;
        
//         return await this._user_rc.insert_json(dataobj_nodeimpl.make_rc_key("player", dkey), data);
//     }
    
//     public async update_player_data(uid:string, key:string, data:any, path:string):Promise<boolean> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [user] not exist`);
//             return false;
//         }

//         let dkey = `${uid}_${key}`;
        
//         return await this._user_rc.update_json(dataobj_nodeimpl.make_rc_key("player", dkey), path, data);
//     }
    
//     public async delete_player_data(uid:string, key:string):Promise<boolean> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl write_session_data redis db [user] not exist`);
//             return false;
//         }

//         let dkey = `${uid}_${key}`;
        
//         return await this._user_rc.delete_json(dataobj_nodeimpl.make_rc_key("player", dkey));
//     }
    
//     public async generate_autoinc_id(key:string):Promise<number> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl generate_autoinc_id redis db [user] not exist`);
//             return 0;
//         }
        
//         let dkey = `autoinc_${key}`;
        
//         return await this._user_rc.incr(dkey);
//     }

//     public async create_user_dataobj(uid:string, dbname:string, key:string, default_data:any):Promise<dataobject|null> {
//         if(this._user_rc == null) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `datamanager_nodeimpl create_dataobj redis db [user] not exist`);
//             return null;
//         }

//         let dkey = `${uid}_${key}`;

//         let dataobj = new dataobj_nodeimpl(this._user_rc, dbname, dkey, default_data);
//         if(default_data == undefined) {
//             // no default data
//             let data = await dataobj.read_data();
//             if(data == null){
//                 // read from db failed
//                 return null;
//             }
//         }
//         else {
//             await dataobj.get_data_initdef();
//         }

//         return dataobj;
//     }

//     public create_globaldatas(table_name:string):globaldatas|null {
//         return null;
//     }

// }