// natrium
// license : MIT
// author : Sean Chen

import { datacomp_redis } from "../../../interface/data/datacomp";
import { generic_playerdata, user_basedata } from "./define";

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
