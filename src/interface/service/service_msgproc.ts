// natrium
// license : MIT
// author : Sean Chen

import { service } from "./service"
import { servicesession } from "./servicesession"

export type msg_proc_func_type = (s:service, ses:servicesession, pl:any, data:any) => Promise<void>;
export type msg_proc_func_map_type = {
    [key:string] : msg_proc_func_type;
}