// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../natrium";
import { player } from "../player";
import { player_datacomp_base } from "../player_datas";

export interface pos2d {
    readonly x:number;
    readonly y:number;
}

export interface generic_playerdata {
    readonly playerid:number;
    readonly mapid:number;
    readonly heroava:number;
    readonly gender:number;
    readonly pname:number;
    readonly pos?:pos2d;
}

export class generic_playerdata_comp extends player_datacomp_base {

    public static readonly comp_name = "generic";
    public static creater(p:player):generic_playerdata_comp {
        return new generic_playerdata_comp(p);
    }
    public get name():string {
        return generic_playerdata_comp.comp_name;
    }

    public static async generate_playerid():Promise<number> {
        return await nat.datas.generate_autoinc_id("playerid");
    }
    
    public get generic_data():generic_playerdata{
        return this._data as generic_playerdata;
    }

    constructor(p:player){
        super(p);

        // set default data value
        this._data = {
            mapid:1,
            heroava:1,
            gender:1,
            pname:"",
            heros:[]
        };
    }

    protected _format_data_fromdbdata(dbdata:any):any {
        // TO DO : format data
        return dbdata;
    }
    protected _format_data_fromruntime(runtimedata:any):any {
        // TO DO : format data
        return runtimedata;
    }
    
}