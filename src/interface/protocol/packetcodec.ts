// natrium
// license : MIT
// author : Sean Chen

import { packet } from "./packet";

export interface packetcodec{
    encode_packet(p:packet):Uint8Array;
    decode_packet(buffer:Uint8Array):packet;
}