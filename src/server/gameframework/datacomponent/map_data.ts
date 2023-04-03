// natrium
// license : MIT
// author : Sean Chen

import { datacomp_redis } from "../../../interface/data/datacomp";
import { generic_playerdata } from "./define";

export interface mine_conf {
    readonly x:number; // x pos in map
    readonly y:number; // y pos in map
    readonly type:string; // mine type
    readonly maxminner:number; // max minning players at same time
    readonly maxoutputcount:number; // max output count each recover
    readonly recovertms:number; // recover time in second
    readonly outputid:number; // output id, see {drop} config
}

export interface player_minning_data {
    uid:string;
    heronftid:string; // heronftid = "", means manul mine
    startminetms:number;
    unfetchedoutput:number;
    heroactpoint:number;
}

export interface mine_mapdata {
    readonly mineid:number;
    countleft:number;
    recovertms:number;
    lastoutputtms:number;
    curminingplys:number;
    players:minning_player_map;
}
export type minning_player_map = {
    [key:number]:player_minning_data // playerid => minning_data
};

export class map_minedatacomp extends datacomp_redis {
    
    override get name():string{
        return "map_mine";
    }

    public get minedata():mine_mapdata {
        return this._rundata;
    }

}