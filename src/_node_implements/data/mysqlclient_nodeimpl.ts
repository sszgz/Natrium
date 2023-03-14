// natrium
// license : MIT
// author : Sean Chen

import { dbconf } from "../../interface/config/configs";
import { mysqlclient } from "../../interface/data/mysqlclient";

export class mysqlclient_nodeimpl implements mysqlclient{
    
    protected _conf:dbconf;

    constructor(c:dbconf){
        this._conf = c;
    }

    get dbname():string {
        return "";
    }
    get conf():dbconf {
        return this._conf;
    }
}