// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../..";
import { dataobject } from "../../interface/data/dataobj";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { object_util } from "../../util/object_util";
import { player } from "./player";


export interface player_datacomponent {

    readonly name:string;
    readonly data:any;
    readonly dataobj:dataobject|null;

    prepare_default_data():void;

    sync_data_from_dbobj():Promise<boolean>;
    flush_data_to_dbobj(do_persisit:boolean):Promise<void>;
}

export abstract class player_datacomp_base implements player_datacomponent{

    protected _player:player;
    protected _data:any = undefined;
    protected _dataobj:dataobject|null = null;


    constructor(p:player) {
        this._player = p;
    }

    get player():player {
        return this._player;
    }
    get name():string {
        return "base";
    }
    
    get data():any {
        return this._data;
    }
    get dataobj():dataobject|null {
        return this._dataobj;
    }
    
    public prepare_default_data():void {
        this._player.datas.set_default_value(this.name, this.data);
    }

    public async sync_data_from_dbobj():Promise<boolean> {
        
        if(this._dataobj == null){

            // get from dataobj
            this._dataobj = this._player.datas.get_dataobj(this.name);

            if(this._dataobj == null) {

                // init from db
                this._dataobj = await this._player.datas.init_dataobj(this.name);
                if(this._dataobj == null) {
    
                    // err
                    nat.dbglog.log(debug_level_enum.dle_error, `player_datacomponent:${this.name} sync_data_from_dbobj user:${this._player.datas.uid} dataobj is null`);
    
                    return false;
                }
            }
        }

        let data = object_util.deepClone(this._dataobj.data);

        this._data = this._format_data_fromdbdata(data);

        return true;
    }
    public async flush_data_to_dbobj(do_persisit:boolean):Promise<void> {

        if(this._dataobj == null){
            // err
            nat.dbglog.log(debug_level_enum.dle_error, `player_datacomponent:${this.name} flush_data_to_dbobj user:${this._player.datas.uid} dataobj is null`);
            return;
        }

        let data = object_util.deepClone(this._data);
        data = this._format_data_fromruntime(data);

        this._dataobj.mod_data(data);
        this._dataobj.write_back(do_persisit);
    }

    protected _format_data_fromdbdata(dbdata:any):any {
        // format data
        return dbdata;
    }
    protected _format_data_fromruntime(runtimedata:any):any {
        // format data
        return runtimedata;
    }
}

export class player_datas {
    
    protected _uid:string = "";
    protected _default_value:Map<string, any> = new Map<string, any>();
    protected _datas:Map<string, dataobject> = new Map<string, dataobject>();
    
    constructor(uid:string) {
        this._uid = uid;
    }

    public get uid(){
        return this._uid;
    }
    
    public set_default_value(key:string, data:any):void {
        this._default_value.set(key, data);
    }

    public async init_dataobj(key:string):Promise<dataobject|null> {
        const def = this._default_value.get(key);
        const newd = await nat.datas.create_user_dataobj(this._uid, "player", key, def);
        if(newd == null) {
            nat.dbglog.log(debug_level_enum.dle_error, `init_dataobj uid:${this._uid} key:${key} create user dataobj error`);
            return null;
        }

        this._datas.set(key, newd);
        return newd;
    }
    
    public get_dataobj(key:string):dataobject|null {
        const d = this._datas.get(key);
        if(d != undefined){
            return d;
        }

        return null;
    }

    public async write_all(do_persisit:boolean):Promise<void> {
        let promiseAry = new Array<Promise<any>>();
        this._datas.forEach((v, k)=>{
            promiseAry.push(v.write_back(do_persisit));
        });
        await Promise.all(promiseAry);
    }
}