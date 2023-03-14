// natrium
// license : MIT
// author : Sean Chen

import { datacomp_redis } from "../../../interface/data/datacomp";
import { session_basedata } from "./define";

export class session_basedatacomp extends datacomp_redis {
    
    override get name():string{
        return "ses_base";
    }

    public get sesdata():session_basedata {
        return this._rundata;
    }

}