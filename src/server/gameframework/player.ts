// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../..";
import { dataobject } from "../../interface/data/dataobj";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { servicesession } from "../../interface/service/servicesession";
import { player_datacomponent, player_datas } from "./player_datas";

export interface player_behaviour {

    readonly name:string;
    readonly player:player;
    
    init():Promise<boolean>;
    fin():Promise<void>;
}

export class player {
    protected _session:servicesession;
    protected _behaviours:player_behaviours_map;
    protected _datas:player_datas;
    protected _datacomponents:player_player_datacomponent_map;

    constructor(s:servicesession, d:player_datas) {
        this._session = s;
        this._behaviours = {};
        this._datas = d;
        this._datacomponents = {};
    }

    public get session() {
        return this._session;
    }
    public get behavoiurs() {
        return this._behaviours;
    }
    public get datas() {
        return this._datas;
    }
    public get datacomp() {
        return this._datacomponents;
    }

    public add_behaviours(beh:player_behaviour):void{
        this._behaviours[beh.name] = beh;
    }
    public add_datacomponent(dc:player_datacomponent):void{
        this._datacomponents[dc.name] = dc;
    }

    public async init():Promise<boolean> {
        for(const key in this._datacomponents) {
            this._datacomponents[key].prepare_default_data();
        }
        //let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._behaviours) {
            //promiseAry.push(this._behaviours[key].init());
            const succ = await this._behaviours[key].init();
            if(!succ){
                return false;
            }
        }
        //await Promise.all(promiseAry);

        return true;
    }
    public async fin():Promise<void>{
        let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._behaviours) {
            promiseAry.push(this._behaviours[key].fin());
        }
        await Promise.all(promiseAry);
    }

    public async sync_data_from_dbobj():Promise<boolean> {
        //let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._datacomponents) {
            //promiseAry.push(this._datacomponents[key].sync_data_from_dbobj());
            let succ = await this._datacomponents[key].sync_data_from_dbobj();
            if(!succ){
                return false;
            }
        }
        //await Promise.all(promiseAry);

        return true;
    }
    public async flush_data_to_dbobj(do_persisit:boolean):Promise<void> {
        let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._datacomponents) {
            promiseAry.push(this._datacomponents[key].flush_data_to_dbobj(do_persisit));
        }
        await Promise.all(promiseAry);
    }

}

export abstract class player_behaviour_base implements player_behaviour{

    protected _player:player;

    constructor(p:player) {
        this._player = p;
    }

    get player():player {
        return this._player;
    }
    get name():string {
        return "base";
    }
    
    public async init():Promise<boolean> {
        return true;
    }
    public async fin():Promise<void> {

    }
}

type player_behaviours_map = {
    [key: string]: player_behaviour;
  };

type player_player_datacomponent_map = {
    [key: string]: player_datacomponent;
  };

export { player_datas };
