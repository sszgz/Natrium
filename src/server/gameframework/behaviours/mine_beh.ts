// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../natrium";
import { player_behaviour_base, player, player_behaviour } from "../player";

export class mine_beh extends player_behaviour_base {

    public static readonly beh_name = "mine";
    public static creater(p:player):player_behaviour {
        return new mine_beh(p);
    }
    public get name():string {
        return mine_beh.beh_name;
    }
    constructor(p:player) {
        super(p);
    }
    
    public override async firstin_init():Promise<boolean> {

        return true;
    }

    public override prepare_data():void {

    }

    public override async init():Promise<boolean> {
        return true;
    }
    public override async fin():Promise<void> {
        await this._try_remove_manulmine();
    }
    public override  on_update(): void {
        
    }

    // ------------------------------------------------------------------------
    protected async _try_remove_manulmine():Promise<void> {
        if(this._player.runtimedata.manulmineid == undefined || this._player.runtimedata.manulmineid == 0){
            return;
        }
        // remove manulmine
        let mineconf = this._player.runtimedata.map.get_mine_conf(this._player.runtimedata.manulmineid);
        if(mineconf == null){
            return;
        }

        let minedc = await this._player.runtimedata.map.get_mapmine_datacomp(this._player.runtimedata.manulmineid, mineconf);
        if(minedc == null){
            return;
        }

        if(!(this._player.pdatas.player_gen.rundata.playerid in minedc.minedata.players)) {
            return;
        }

        // mark last actpoint recover time
        this._player.pdatas.player_gen.rundata.lastAPRecTms = nat.sys.getTimeStamp()/1000;

        delete minedc.minedata.players[this._player.pdatas.player_gen.rundata.playerid];
        --minedc.minedata.curminingplys;
        this._player.runtimedata.manulmineid = 0;

        if(minedc.minedata.curminingplys <= 0){
            minedc.flush_to_db(true);
        }
        else {
            // minedc will flush on map update
        }
    }
    public get_mineinfo(mineid:string):void {
        
    }

    public start_manulmine(mineid:string):void {

    }
    public stop_manulmine():void {

    }
    public manulmine():void {

    }

    public start_heromine(mineid:string, heronftid:number) {

    }
    public stop_heromine(heronftid:number){

    }
    public get_heromine_infos(heronftid:Array<number>){

    }
    public fetch_heromine_output(heronftid:number){

    }
}