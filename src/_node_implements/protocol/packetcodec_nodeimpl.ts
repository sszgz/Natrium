// natrium
// license : MIT
// author : Sean Chen

import * as zlib from "zlib";

import { debug_level_enum } from "../../interface/debug/debug_logger";
import { bodylenbits, packet, packettype, prototype } from "../../interface/protocol/packet";
import { packetcodec } from "../../interface/protocol/packetcodec";
import { sys_packet_cmds, shakehand_mark } from "../../interface/protocol/protocolconsts";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { packet_nodeimpl } from "./packet_nodeimpl";
import { _protobuf_mgr } from "./_protobuf_mgr";

export class packetcodec_nodeimpl implements packetcodec {
    
    public load_protobufs(filenames:string[]):void {
        _protobuf_mgr.loadProtobufFiles(filenames);
    }
    public register_protobuf_msg(msgid:number, msgcmd:string, path:string):void {
        _protobuf_mgr.registerMsg(msgid, msgcmd, path);
    }
    public create_protopkt(c:string, d:any):packet {
        return this.create_packet(packettype.pkt_msg, prototype.proto_grpc, bodylenbits.bit8, false, {c:c, d:d}); // bodylenbits & compressed is set in encode_packet
    }

    public create_shakehandpkt(time:number):packet {
        let datas:Buffer = Buffer.alloc(9);
        datas.writeUint8(sys_packet_cmds.spc_shakehand);
        datas.writeUint32LE(shakehand_mark, 1);
        datas.writeUint32LE(time, 5);

        return this.create_packet(packettype.pkt_sys, prototype.proto_binary, bodylenbits.bit8, false, datas);
    }

    public create_pingpongpkt(time:number):packet {

        let datas:Buffer = Buffer.alloc(5);
        datas.writeUint8(sys_packet_cmds.spc_pingpong);
        datas.writeUint32LE(time, 1);

        return this.create_packet(packettype.pkt_sys, prototype.proto_binary, bodylenbits.bit8, false, datas); 
    }

    public create_jsonpkt(data:any):packet {
        return this.create_packet(packettype.pkt_msg, prototype.proto_json, bodylenbits.bit8, false, data);  // bodylenbits & compressed is set in encode_packet
    }

    public create_stringpkt(data:string):packet {
        return this.create_packet(packettype.pkt_msg, prototype.proto_text, bodylenbits.bit8, false, data); // bodylenbits & compressed is set in encode_packet
    }

    public create_packet(pktp:packettype, prototp:prototype, bodylenbit:bodylenbits, compressed:boolean, data:any):packet {
        let h = packet_nodeimpl.make_header(pktp, prototp, bodylenbit, compressed);
        return new packet_nodeimpl(h, data);
    }

    protected _write_protocol_tobuf(p:packet):Buffer {
        switch(p.prototp) {
            case prototype.proto_binary:
                return p.data;
            case prototype.proto_grpc:
                {
                    const msgT = _protobuf_mgr.msgs[p.data.c];
                    if(msgT == undefined){
                        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `encode_packet cmd[${p.data.c}] protobuf not define`);
                        throw new Error(`Natrium: encode_packet cmd[${p.data.c}] protobuf not define`);
                    }
                    const msg = msgT.create(p.data.d);

                    const msgbuf = msgT.encode(msg).finish();
                    const msgid = _protobuf_mgr.get_msgid_bycmd(p.data.c);
                    
                    let buf = Buffer.alloc(2);
                    buf.writeUint16LE(msgid);
                    return Buffer.concat([buf, msgbuf]);
                }
                break;
            case prototype.proto_json:
                {
                    let jsonstr = JSON.stringify(p.data);
                    return Buffer.from(jsonstr, "utf8");
                }
                break;
            case prototype.proto_text:
                return Buffer.from(p.data as string, "utf8");
            case prototype.proto_xml:
                {
                    // TO DO : xml
                }
                break;
        }

        return p.data;
    }
    
    protected _decode_sys_cmd(buffer:Buffer, offset:number):Object {
        let data:any = {};

        data.cmdid = buffer.readUint8(offset);
        offset+=1;
        switch(data.cmdid){
            case sys_packet_cmds.spc_shakehand:
                data.mark = buffer.readUint32LE(offset);
                offset+=4
                data.time = buffer.readUint32LE(offset);
                break;
            case sys_packet_cmds.spc_pingpong:
                data.time = buffer.readUint32LE(offset);
                break;
        }
        
        return data;
    }

    protected _read_protocol_frombuf(p:packet_nodeimpl, buffer:Buffer, offset:number):packet {
        switch(p.prototp) {
            case prototype.proto_binary:
                {
                    if(p.pktp == packettype.pkt_sys){
                        p.data = this._decode_sys_cmd(buffer, offset);
                    }
                    else {
                        p.data = buffer.subarray(offset);
                    }
                }
                break;
            case prototype.proto_grpc:
                {
                    // read command id
                    const msgid = buffer.readUint16LE(offset);
                    offset+=2;

                    const msgcmd = _protobuf_mgr.get_msgcmd_byid(msgid);
                    const data = _protobuf_mgr.msgs[msgcmd].decode(buffer.subarray(offset));
                    p.data = {
                        c:msgcmd,
                        d:data
                    };
                }
                break;
            case prototype.proto_json:
                {
                    let jsonstr = buffer.toString("utf8", offset);
                    p.data = JSON.parse(jsonstr);
                }
                break;
            case prototype.proto_text:
                {
                    p.data = buffer.toString("utf8", offset);
                }
                break;
            case prototype.proto_xml:
                {
                    // TO DO : xml
                }
                break;
        }

        return p;
    }

    public encode_packet(p:packet):Buffer {
        let protodata:Buffer = this._write_protocol_tobuf(p);
        
        // TO DO : do zip in thread
        let isZiped = false;

        // TO DO : wait client fix zlib bug
        if(protodata.length > 1024){
            //let zipedbuf = zlib.brotliCompressSync(protodata);
            let zipedbuf = zlib.deflateRawSync(protodata);
            if(zipedbuf.length < protodata.length){
                protodata = zipedbuf;
                isZiped = true;
            }
        }
        
        let bodylenbit:bodylenbits = bodylenbits.bit8;
        let lensize = 1;
        if(protodata.length <= 0xff)
        {

        }
        else if(protodata.length > 0xff && protodata.length <= 0xffff) {
            bodylenbit = bodylenbits.bit16;
            lensize = 2;
        }
        else if(protodata.length > 0xffff && protodata.length <= 0xffffffff){
            bodylenbit = bodylenbits.bit32;
            lensize = 4;
        }
        else {
            // TO DO : too big
            // err
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `encode_packet protodata.length[${protodata.length}] too big`);
            throw new Error(`Natrium: encode_packet length[${protodata.length}] too big`);
        }

        (p as packet_nodeimpl).set_bitszipped(bodylenbit, isZiped);

        let header:Buffer = Buffer.alloc(1+lensize);
        header.writeUint8(p.header);
        switch(lensize)
        {
            case 1:
                header.writeUint8(protodata.length, 1);
                break;
            case 2:
                header.writeUint16LE(protodata.length, 1);
                break;
            case 4:
                header.writeUint32LE(protodata.length, 1);
                break;
        }
        return Buffer.concat([header, protodata]);
    }
    public decode_packet(buffer:Buffer):packet {
        let header = buffer.readUint8();
        let pkt = new packet_nodeimpl(header, null);

        let len = 0;
        let offset = 1;
        switch(pkt.bodylenbit)
        {
            case bodylenbits.bit8:
                len = buffer.readUint8(1);
                offset = 2;
                break;
            case bodylenbits.bit16:
                len = buffer.readUInt16LE(1);
                offset = 3;
                break;
            case bodylenbits.bit32:
                len = buffer.readUint32LE(1);
                offset = 5;
                break;
        }

        let bufferLenLeft = buffer.length - offset;
        if(len != bufferLenLeft) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `decode_packet len[${len}] != buffer len[${bufferLenLeft}]`);
            throw new Error(`Natrium: decode_packet len[${len}] != buffer len[${bufferLenLeft}]`);
        }

        // TO DO : do unzip in thread
        
        // TO DO : wait client fix zlib bug
        if(pkt.compressed){
            buffer = buffer.subarray(offset);
            //buffer = zlib.brotliDecompressSync(buffer);
            buffer = zlib.inflateRawSync(buffer);
            offset = 0;
        }

        this._read_protocol_frombuf(pkt, buffer, offset);

        return pkt;
    }

}