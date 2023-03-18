// natrium
// license : MIT
// author : Sean Chen

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

    }
    public override  on_update(): void {
        
    }

    // ------------------------------------------------------------------------
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