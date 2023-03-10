// natrium
// license : MIT
// author : Sean Chen

import { debug_level_enum } from "../../interface/debug/debug_logger";
import { servicesession } from "../../interface/service/servicesession";
import { nat } from "../../natrium";
import { player, player_behaviour } from "./player";

export class game {
    public static impl:game = new game();

    protected _behaviours:Map<string, (p:player)=>player_behaviour> = new Map<string, (p:player)=>player_behaviour>();

    public register_player_behaviours(name:string, ctor:(p:player)=>player_behaviour):void{
        if(this._behaviours.has(name)) {
            nat.dbglog.log(debug_level_enum.dle_error, `register_player_behaviours name:${name} already exist`);
            return;
        }
        this._behaviours.set(name, ctor);
    }

    public create_player(s:servicesession):player {
        const p = new player(s);

        this._behaviours.forEach((pctor, key)=>{
            const b = pctor(p);
            p.add_behaviours(b);
        });

        return p;
    }

    // public create_map():map {

    // }

    public on_msg():void {

    }

    public on_update():void {

    }
}