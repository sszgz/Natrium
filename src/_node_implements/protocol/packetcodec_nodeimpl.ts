// natrium
// license : MIT
// author : Sean Chen

import { packet } from "../../interface/protocol/packet";
import { packetcodec } from "../../interface/protocol/packetcodec";
import { packet_nodeimpl } from "./packet_nodeimpl";

export class packetcodec_nodeimpl implements packetcodec {

    encode_packet(p:packet):Uint8Array {
        return new Uint8Array();
    }
    decode_packet(buffer:Uint8Array):packet {
        return new packet_nodeimpl();
    }

}