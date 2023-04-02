// natrium
// license : MIT
// author : Sean Chen

import { forEach } from "lodash";
import { nat } from "../..";
import { datacomp, datacomp_map } from "../../interface/data/datacomp";
import { rediscache } from "../../interface/data/rediscache";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { servicesession } from "../../interface/service/servicesession";
import { ServerErrorCode } from "../../share/msgs/msgcode";
import { factory_line_data, hero_data, item_data, pet_data, port_data, pos2d } from "./datacomponent/define";
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
    ver:number;
    manulmineid:number;
    manulminedrops:Map<number, item_data>;
}

export enum hero_bind_type {
    mine = "mine",
    battle = "battle"
}

export class player {
    protected _session:servicesession;
    protected _behaviours:Map<string, player_behaviour>;
    protected _runtimedata:runtimedata;
    protected _pdatas:datacomp_map; // persist datas
    protected _cdatas:datacomp_map; // cache datas

    protected _last_flushdb_time:number;
    protected static _flushdb_interval:number = 0;

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
            ver:0,
            moving:null,
            map:null,
            lastmvmsgtm:0,
            manulmineid:0,
            inzoneplayer:new Array<player>,
            manulminedrops:new Map<number, item_data>()
        }

        this._last_flushdb_time = nat.sys.getTimeStamp();
        if(player._flushdb_interval == 0) {
            player._flushdb_interval = nat.conf.get_config_data("game").base.playerflushtime_ms;
            if(player._flushdb_interval == undefined){
                player._flushdb_interval = 300000;
            }
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
        });

        let curtm_ms = nat.sys.getTimeStamp();
        if(curtm_ms - this._last_flushdb_time > player._flushdb_interval){
            this.flush_data_to_dbobj(true); // TO DO : await?
            this._last_flushdb_time = curtm_ms;
        }
    }

    public get_player_hero(heronftid:string):hero_data|null {
        
        // check nft card owner
        let heros = [];
        if(!("player_hero" in this._pdatas)){
            return null;
        }
        heros = this._pdatas.player_hero.rundata.heros;

        let hero = null;
        for(let i=0; i<heros.length; ++i){
            if(heros[i].heronftid == heronftid){
                hero = heros[i];
                break;
            }
        }
        
        return hero;
    }

    public check_player_hero_usage(hero:hero_data, bindType:hero_bind_type):number {
        if(hero == null) {
            return ServerErrorCode.ResPlayer_HeroNotExist;
        }
        if(hero.bindType != bindType) {
            return ServerErrorCode.ResPlayer_HeroNotBindToMine;
        }
        if(hero.minnings != undefined) {
            return ServerErrorCode.ResPlayer_HeroAlreadyInMine;
        }
        if(hero.factory != undefined) {
            return ServerErrorCode.ResPlayer_HeroAlreadyInFactory;
        }

        return ServerErrorCode.ResOK;
    }

    public get_player_pet(heronftid:string):pet_data|null {
        
        let pets = [];
        if(!("player_pet" in this._pdatas)){
            return null;
        }
        pets = this._pdatas.player_pet.rundata.pets;

        let pet = null;
        for(let i=0; i<pets.length; ++i){
            if(pets[i].heronftid == heronftid){
                pet = pets[i];
                break;
            }
        }
        return pet;
    }

    public check_player_pet_usage(pet:pet_data, bindType:hero_bind_type):number {
        if(pet == null) {
            return ServerErrorCode.ResPlayer_HeroNotExist;
        }
        if(pet.bindType != bindType) {
            return ServerErrorCode.ResPlayer_HeroNotBindToMine;
        }
        if(pet.minnings != undefined) {
            return ServerErrorCode.ResPlayer_HeroAlreadyInMine;
        }
        if(pet.factory != undefined) {
            return ServerErrorCode.ResPlayer_HeroAlreadyInFactory;
        }

        return ServerErrorCode.ResOK;
    }

    public get_player_curr_port():port_data|undefined {
        // TO DO : create port store house for player
        if(!("player_port" in this._pdatas)){
            return undefined;
        }
        for(let i=0; i<this._pdatas.player_port.rundata.ports.length; ++i){
            if(this._pdatas.player_port.rundata.ports[i].portid == this.runtimedata.map.portid){
                return this._pdatas.player_port.rundata.ports[i];
            }
        }
        return undefined;
    }

    public get_player_curr_factory_line(lineidx:number):factory_line_data|undefined {
        let curplyport = this.get_player_curr_port();
        if(curplyport == undefined){
            return undefined;
        }
        if(!("factory" in curplyport)) {
            return undefined;
        }
        if(lineidx >= curplyport.factory.lines.length){
            return undefined;
        }
        return curplyport.factory.lines[lineidx];
    }
    
    // ------------------------------------------------------------------------
    public add_player_storehouse_items(items:Array<item_data>):boolean {
        let curplyport = this.get_player_curr_port();
        if(curplyport == undefined){
            return false;
        }

        for(let i=0; i< items.length; ++i){

            if(items[i].itemid in curplyport.storehouse.items){
                curplyport.storehouse.items[items[i].itemid] += items[i].count;
            }
            else {
                curplyport.storehouse.items[items[i].itemid] = items[i].count;
            }

            // TO DO : load item config and read item load
            // for Debug ...
            curplyport.storehouse.curload += items[i].count;
        }

        return true;
    }

    public cost_player_storehouse_items(items:Array<item_data>):boolean{
        let curplyport = this.get_player_curr_port();
        if(curplyport == undefined){
            return false;
        }

        for(let i=0; i< items.length; ++i){
            if(!(items[i].itemid in curplyport.storehouse.items)){
                return false;
            }
            if(curplyport.storehouse.items[items[i].itemid] < items[i].count){
                return false;
            }
        }

        for(let i=0; i< items.length; ++i){
            curplyport.storehouse.items[items[i].itemid] -= items[i].count;
            if(curplyport.storehouse.items[items[i].itemid] <= 0){
                delete curplyport.storehouse.items[items[i].itemid];
            }

            // TO DO : read load from config
            // for Debug ...
            curplyport.storehouse.curload -= items[i].count;
        }

        return true;
    }

    
    
    // ------------------------------------------------------------------------
    public get_port_factory_conf():any {
        const facconfs = nat.conf.get_config_data("factory");
        if(!(this.runtimedata.map.portid.toString() in facconfs)){
            return undefined;
        }

        return facconfs[this.runtimedata.map.portid.toString()];
    }

    public get_heropet_factory_accrate(nftid:string):number {
        // TO DO : get accrate from config

        return 0.0;
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
