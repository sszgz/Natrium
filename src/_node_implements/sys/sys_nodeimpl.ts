// natrium
// license : MIT
// author : Sean Chen

import { random } from "lodash";
import { sys } from "../../interface/sys/sys";

export class sys_nodeimpl implements sys {

    protected _start_tick:number = Date.now();
    protected _randomarray = new Array<number>();

    constructor(){

    }
    
    public getTimeStamp() : number {
        return Date.now();
    }

    public getTickFromAppStart() : number {
        return Date.now() - this._start_tick;
    }
    
    public random(): number {
        return random(0, Number.MAX_VALUE);
    }
}