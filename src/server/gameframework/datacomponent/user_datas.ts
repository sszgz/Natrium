// natrium
// license : MIT
// author : Sean Chen

import { datacomp_redis } from "../../../interface/data/datacomp";
import { generic_playerdata, hero_playerdata, pet_playerdata, port_playerdata, ship_playerdata, user_basedata, warrant_playerdata } from "./define";

export class user_basedatacomp extends datacomp_redis {
    
    override get name():string{
        return "user_base";
    }

    public get userdata():user_basedata {
        return this._rundata;
    }

}

export class player_genericdatacomp extends datacomp_redis {
    
    override get name():string{
        return "player_gen";
    }

    public get gendata():generic_playerdata {
        return this._rundata;
    }

}

export class player_herodatacomp extends datacomp_redis {
    
    override get name():string{
        return "player_hero";
    }

    public get herodata():hero_playerdata {
        return this._rundata;
    }

}

export class player_petdatacomp extends datacomp_redis {
    
    override get name():string{
        return "player_pet";
    }

    public get petdata():pet_playerdata {
        return this._rundata;
    }

}

export class player_shipdatacomp extends datacomp_redis {
    
    override get name():string{
        return "player_ship";
    }

    public get sihpdata():ship_playerdata {
        return this._rundata;
    }

}

export class player_warrantdatacomp extends datacomp_redis {
    
    override get name():string{
        return "player_warrant";
    }

    public get warrants():warrant_playerdata {
        return this._rundata;
    }

}

export class player_portdatacomp extends datacomp_redis {
    
    override get name():string{
        return "player_port";
    }

    public get portdata():port_playerdata {
        return this._rundata;
    }

}
