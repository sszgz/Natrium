// natrium
// license : MIT
// author : Sean Chen

import { servicesession } from "../../interface/service/servicesession";

export interface player_behaviour {

    readonly name:string;
    readonly player:player;
    
    init():Promise<boolean>;
    fin():Promise<void>;
    prepare_default_data():void;

    sync_data_from_dbobj():Promise<void>;
    flush_data_to_dbobj(do_persisit:boolean):Promise<void>;
    
}

export class player {
    protected _session:servicesession;
    protected _behaviours:player_behaviours_map;

    constructor(s:servicesession) {
        this._session = s;
        this._behaviours = {};
    }

    public get session() {
        return this._session;
    }
    public get behavoiurs() {
        return this._behaviours;
    }

    public add_behaviours(beh:player_behaviour):void{
        this._behaviours[beh.name] = beh;
    }

    public async init():Promise<boolean> {
        for(const key in this._behaviours) {
            this._behaviours[key].prepare_default_data();
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

    public async sync_data_from_dbobj():Promise<void> {
        let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._behaviours) {
            promiseAry.push(this._behaviours[key].sync_data_from_dbobj());
        }
        await Promise.all(promiseAry);
    }
    public async flush_data_to_dbobj(do_persisit:boolean):Promise<void> {
        let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._behaviours) {
            promiseAry.push(this._behaviours[key].flush_data_to_dbobj(do_persisit));
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

    public prepare_default_data():void {

    }

    public async sync_data_from_dbobj():Promise<void> {

    }
    public async flush_data_to_dbobj(do_persisit:boolean):Promise<void> {

    }
}

type player_behaviours_map = {
    [key: string]: player_behaviour;
  };