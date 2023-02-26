// natrium
// license : MIT
// author : Sean Chen

import { packet } from "../protocol/packet";
import { packetcodec } from "../protocol/packetcodec";

export interface wsconnecter_handler {
    on_connected():void;
    on_disconnected(reason:string):void;
    on_packet(p:packet):void;
}

export interface wsconnecter {
    readonly host:string;
    readonly handler:wsconnecter_handler;
    readonly pcodec:packetcodec;
    
    connect(host:string):boolean;
    disconnect(reason:string):void;
    send_packet(p:packet):void;
}