// natrium
// license : MIT
// author : Sean Chen

import { servicemgr } from "../../interface/service/servicemgr";
import { serviceworker } from "../../interface/service/serviceworker";
import { serviceworker_nodeimpl } from "./serviceworker_nodeimpl";

export class servicemgr_nodeimpl implements servicemgr {
    
    create_worker():serviceworker {
        return new serviceworker_nodeimpl();
    }

    get_worker_bythread(tid:number):serviceworker {
        return new serviceworker_nodeimpl();

    }
    get_workers_byname(service_name:string):serviceworker[] {
        return new Array();
    }
}