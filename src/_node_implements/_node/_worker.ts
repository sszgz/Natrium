
// natrium
// license : MIT
// author : Sean Chen

import { MessagePort } from "node:worker_threads";

export interface _Node_Worker {

    uname:string;

    startup(uname:string, workerData:any):Promise<void>;
    shutdown():Promise<void>;
    startshutingdown():Promise<void>;
    
    onsetupchannel(fromworker:string, port:MessagePort, udata:any):void;
    onmsg(fromworker:string, msg:any):Promise<void>;
    onupdate():Promise<void>;
}