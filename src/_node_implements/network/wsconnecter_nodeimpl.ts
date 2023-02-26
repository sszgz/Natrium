// natrium
// license : MIT
// author : Sean Chen

import { WebSocket } from "ws";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { connection_close_code } from "../../interface/network/networkconsts";

import { wsconnecter, wsconnecter_handler } from "../../interface/network/wsconnecter";
import { packet } from "../../interface/protocol/packet";
import { packetcodec } from "../../interface/protocol/packetcodec";
import { natrium_nodeimpl } from "../natrium_nodeimpl";

export class wsconnecter_nodeimpl implements wsconnecter {
    
    _host:string = "";
    _handler:wsconnecter_handler;
    _pcodec:packetcodec;
    _ws:WebSocket|null = null;

    constructor(h:wsconnecter_handler, p:packetcodec) {
        this._handler = h;
        this._pcodec = p;
    }

    get host() {
        return this._host;
    }
    get handler() {
        return this._handler;
    }
    get pcodec() {
        return this._pcodec;
    }
    
    connect(host:string):boolean {
        
        if(this._pcodec == null)
        {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl _pcodec is null`);
            return false;
        }
        if(this._handler == null)
        {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl _handler is null`);
            return false;
        }

        this._host = host;

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `wsconnecter_nodeimpl try connect to [${host}]`);

        this._ws = new WebSocket(host);

        let thisptr = this;

        this._ws.on('error', err=>{
            thisptr._on_socket_error(err);
        });
        this._ws.on('open', ()=>{
            thisptr._on_socket_connected();
        });
        this._ws.on('message', data=>{
            thisptr._on_socket_message(data as Uint8Array);
        });

        return true;
    }
    disconnect(reason:string):void {
        if(this._ws == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl disconnect when ws not connect`);
            return;
        }

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wsconnecter_nodeimpl disconnect`);
        this._ws.close(connection_close_code.client_close, reason);
    }
    send_packet(p:packet):void {
        if(this._ws == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl send when ws not connect`);
            return;
        }
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wsconnecter_nodeimpl send packet:${p}`);

        var data:Uint8Array = this._pcodec.encode_packet(p);
        if(data==null){
            return;
        }
        
        this._ws.send(data, err=>{
            // TO DO : send error
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl send error:${err?.name}\r\n${err?.message}`);
        });
    }
    
    _on_socket_connected():void {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wsconnecter_nodeimpl [${this._host}] connected`);

        this._handler.on_connected();
    }

    _on_socket_message(data:Uint8Array):void {
        var p:packet = this._pcodec.decode_packet(data);
        this._handler.on_packet(p);
    }

    _on_socket_error(err:Error):void {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl err:[${err.name}\r\n${err.message}]`);

        // TO DO : check error
    }
}