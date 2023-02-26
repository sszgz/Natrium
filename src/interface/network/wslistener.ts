// natrium
// license : MIT
// author : Sean Chen

import { packet } from "../protocol/packet";
import { packetcodec } from "../protocol/packetcodec";

export interface wslistener_handler{
    on_connected(cid:number):void;
    on_disconnected(cid:number, reason:string):void;
    on_packet(cid:number, p:packet):void;
}

export interface wslistener {
    readonly host:string;
    readonly port:number;
    readonly handler:wslistener_handler;
    readonly pcodec:packetcodec;

    start(host:string, port:number):boolean;
    shutdown():void;
    
    disconnect(cid:number, reason:string):void;
    send_packet(cid:number, p:packet):void;
    broadcast_packet(cid:number[], p:packet):void;
}