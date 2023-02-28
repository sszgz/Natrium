// natrium
// license : MIT
// author : Sean Chen

import { bodylenbits, packet, packettype, prototype } from "../../interface/protocol/packet";

export class packet_nodeimpl implements packet {
    
    _header:number = 0;
    _data:any = null;

    static make_header(pktp:packettype, prototp:prototype, bodylenbit:bodylenbits, compressed:boolean):number {
        return (pktp << 6) | (prototp << 3) | (bodylenbit << 1) | (compressed?1:0);
    }

    constructor(h:number,d:any){
        this._header = h;
        this._data = d;
    }

    // packettype, 2bit
    get pktp():packettype{
        return this._header >> 6;
    } 
    // prototype, 3bit
    get prototp():prototype{
        return (this._header >> 3) & 0x7;
    }; 
    // bodylenbits, 2bit
    get bodylenbit():bodylenbits{
        return (this._header >> 1) & 0x3;
    } 
    // 1bit
    get compressed():boolean{
        return (this._header & 0x1) == 1;
    } 

    get header():number{
        return this._header;
    }

    get data():any {
        return this._data;
    }

    set data(v:any) {
        this._data = v;
    }

    set_bitszipped(bodylenbit:bodylenbits, compressed:boolean) {
        this._header = (this._header & 0xf8) | (bodylenbit << 1) | (compressed?1:0);
    }
}