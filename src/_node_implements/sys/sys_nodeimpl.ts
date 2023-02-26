// natrium
// license : MIT
// author : Sean Chen

import { sys } from "../../interface/sys/sys";

export class sys_nodeimpl implements sys {

    _start_tick:number = Date.now();

    constructor(){
    }
    
    getTimeStamp() : number {
        return Date.now();
    }

    getTickFromAppStart() : number {
        return Date.now() - this._start_tick;
    }
    
}