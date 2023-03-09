// natrium
// license : MIT
// author : Sean Chen

import { _redis_client } from "../_node/_redis";
import { dataobj_nodeimpl } from "./dataobj_nodeimpl";

export class _service_data_mgr {
    protected _redis_clients:Map<string, _redis_client> = new Map<string, _redis_client>();

    public create_dataobj(tablename:string, key:string, default_data:any):dataobj_nodeimpl|null {
        let rc = this._redis_clients.get(tablename);
        if(rc == undefined) {
            return null;
        }

        return new dataobj_nodeimpl(rc, tablename, key, default_data);
    }
}