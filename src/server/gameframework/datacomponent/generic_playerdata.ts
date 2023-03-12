// natrium
// license : MIT
// author : Sean Chen

import { player } from "../player";
import { player_datacomp_base } from "../player_datas";

export interface generic_playerdata {
    readonly mapid:number
    readonly def_heroava:number;
}

export class generic_playerdata_comp extends player_datacomp_base {

    public static readonly comp_name = "generic";
    public static creater(p:player):generic_playerdata_comp {
        return new generic_playerdata_comp(p);
    }
    public get name():string {
        return generic_playerdata_comp.comp_name;
    }

    public get generic_data():generic_playerdata{
        return this._data as generic_playerdata;
    }

    constructor(p:player){
        super(p);

        // set default data value
        this._data = {
            mapid:1,
            def_heroava:1,
            heros:[]
        };
    }

    protected async _on_create_data():Promise<void> {
        // generate unique id
        //this._data["playerid"] = ;
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