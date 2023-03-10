// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../..";
import { dataobj } from "../../../interface/data/dataobj";
import { debug_level_enum } from "../../../interface/debug/debug_logger";
import { object_util } from "../../../util/object_util";
import { player, player_behaviour, player_behaviour_base } from "../player";

export interface session_user_data {
    name:string;
    uid:string;
    token:string;
}

export class user_behaviour extends player_behaviour_base {

    public static readonly beh_name = "user";
    public static creater(p:player):player_behaviour {
        return new user_behaviour(p);
    }
    public get name():string {
        return user_behaviour.beh_name;
    }

    protected _session_user_data:session_user_data;
    protected _session_user_dataobj:dataobj|null = null;

    public get session_ud():session_user_data{
        return this._session_user_data;
    }

    constructor(p:player){
        super(p);
        this._session_user_data = {
            name:"",
            uid:"",
            token:""
        };
    }
    
    public override prepare_default_data():void {
        //this._player.session.datas.set_default_value("user", this._session_user_data);
    }
    public override async init():Promise<boolean> {
        this._session_user_dataobj = this._player.session.datas.get_dataobj("user");
        if(this._session_user_dataobj == null) {
            this._session_user_dataobj = await this._player.session.datas.init_dataobj("user");
            if(this._session_user_dataobj == null) {

                // err
                nat.dbglog.log(debug_level_enum.dle_error, `user_behaviour init session user dataobj is null`);

                return false;
            }
        }

        return true;
    }
    public override async fin():Promise<void> {

    }

    public override async sync_data_from_dbobj():Promise<void> {
        let data = object_util.deepClone(this._session_user_dataobj?.data);

        // TO DO : format data

        this._session_user_data = data;
    }
    public override async flush_data_to_dbobj(do_persisit:boolean):Promise<void> {

        let data = object_util.deepClone(this._session_user_data);

        // TO DO : format data

        this._session_user_dataobj?.mod_data(data);
    }
    
}