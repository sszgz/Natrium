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
    public override async init():Promise<boolean> {
        return true;
    }
    public override async fin():Promise<void> {

    }
    public override  on_update(): void {
        
    }
}