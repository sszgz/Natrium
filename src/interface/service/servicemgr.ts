// natrium
// license : MIT
// author : Sean Chen

import { serviceworker } from "./serviceworker";

export interface servicemgr {

    create_worker():serviceworker;

    get_worker_bythread(tid:number):serviceworker;
    get_workers_byname(service_name:string):serviceworker[];
}