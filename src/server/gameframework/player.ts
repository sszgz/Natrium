// natrium
// license : MIT
// author : Sean Chen

import { forEach } from "lodash";
import { nat } from "../..";
import { datacomp, datacomp_map } from "../../interface/data/datacomp";
import { rediscache } from "../../interface/data/rediscache";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { servicesession } from "../../interface/service/servicesession";
import { pos2d } from "./datacomponent/define";
import { game_map } from "./gameobjects/game_map";

export interface player_behaviour {

    readonly name:string;
    readonly player:player;
    
    firstin_init():Promise<boolean>;
    prepare_data():void;
    init():Promise<boolean>;
    fin():Promise<void>;

    on_update():void;
}

export interface pathnode {
    x:number;
    y:number;
    cost:number;
}

export interface movedata {
    path:Array<pathnode>;
    lasttm:number;
}

export interface runtimedata {
    instid:number;
    inzoneplayer:Array<player>;
    moving:movedata|null;
    lastmvmsgtm:number;
    map:game_map|null;
}

export class player {
    protected _session:servicesession;
    protected _behaviours:Map<string, player_behaviour>;
    protected _runtimedata:runtimedata;
    protected _pdatas:datacomp_map; // persist datas
    protected _cdatas:datacomp_map; // cache datas

    constructor(s:servicesession, datas:Array<datacomp>) {
        this._session = s;
        this._behaviours = new Map<string, player_behaviour>();
        this._pdatas = {};
        this._cdatas = {};

        for(let i=0; i<datas.length; ++i){
            if(datas[i].is_persist) {
                this._pdatas[datas[i].name] = datas[i];
            }
            else {
                this._cdatas[datas[i].name] = datas[i];
            }
        }

        this._runtimedata = {
            instid:0,
            moving:null,
            map:null,
            lastmvmsgtm:0,
            inzoneplayer:new Array<player>
        }
    }

    public get session() {
        return this._session;
    }
    public get behavoiurs() {
        return this._behaviours;
    }
    public get runtimedata() {
        return this._runtimedata;
    }
    public get pdatas(){
        return this._pdatas;
    }
    public get cdatas(){
        return this._cdatas;
    }

    public add_behaviours(beh:player_behaviour):void{
        this._behaviours.set(beh.name, beh);
    }

    public async firstin_init():Promise<boolean> {
        //let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._behaviours.keys) {
            const succ = await this._behaviours.get(key)?.init();
            if(!succ){
                return false;
            }
        }
        //await Promise.all(promiseAry);

        return true;
    }

    public prepare_behdata():void {
        this._behaviours.forEach((beh)=>{
            beh.prepare_data();
        })
    }

    public async init():Promise<boolean> {
        //let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._behaviours.keys) {
            const succ = await this._behaviours.get(key)?.init();
            if(!succ){
                return false;
            }
        }
        //await Promise.all(promiseAry);

        return true;
    }
    public async fin():Promise<void>{
        let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        this._behaviours.forEach((beh)=>{
            promiseAry.push(beh.fin());
        })
        await Promise.all(promiseAry);
    }

    public async sync_redis_data(
        type: { new(rc:rediscache, tablename:string, key:string|number): datacomp ;}, 
        dbname:string, tablename:string, key:string|number, persist:boolean):Promise<boolean>
    {
        let dc = nat.datas.create_redis_datacomp(type, dbname, tablename, key, persist);
        if(dc == null){
            return false;
        }
        if((dc.is_persist && dc.name in this._pdatas) ||
            (!dc.is_persist && dc.name in this._cdatas) )
        {
            return false;
        }

        await dc.sync_from_db();
        if(dc.rundata == undefined) {
            return false;
        }
        if(dc.is_persist){
            this._pdatas[dc.name] = dc;
        }
        else {
            this._cdatas[dc.name] = dc;
        }

        return true;
    }

    public async sync_mysql_data():Promise<boolean>{
        return true;
    }

    public async flush_data_to_dbobj(do_persisit:boolean):Promise<void> {
        let promiseAry:Array<Promise<any>> = new Array<Promise<any>>();
        for(const key in this._pdatas) {
            promiseAry.push(this._pdatas[key].flush_to_db(do_persisit));
        }
        for(const key in this._cdatas) {
            promiseAry.push(this._cdatas[key].flush_to_db(do_persisit));
        }
        await Promise.all(promiseAry);
    }

    public on_update():void {
        this._behaviours.forEach((beh)=>{
            beh.on_update();
        })
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
    
    public async firstin_init():Promise<boolean> {
        return true;
    }
    public prepare_data():void {

    }
    public async init():Promise<boolean> {
        return true;
    }
    public async fin():Promise<void> {

    }
    public on_update(): void {
        
    }
}
