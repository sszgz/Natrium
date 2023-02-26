// natrium
// license : MIT
// author : Sean Chen

import { WebSocket, WebSocketServer } from "ws";

import { debug_level_enum } from "../../interface/debug/debug_logger";
import { connection_close_code } from "../../interface/network/networkconsts";
import { wslistener, wslistener_handler } from "../../interface/network/wslistener";
import { packet } from "../../interface/protocol/packet";
import { packetcodec } from "../../interface/protocol/packetcodec";
import { natrium_nodeimpl } from "../natrium_nodeimpl";

interface socketCid {
    cid:number;
    socket:WebSocket;

    onmsg?:any;
    onclose?:any;
    onerror?:any;
}

export class wslistener_nodeimpl implements wslistener {

    _host:string = "";
    _port:number = 0;
    _handler:wslistener_handler;
    _pcodec:packetcodec;
    _wss:WebSocketServer|null = null;

    _cid_seed:number = 1;
    _cid_to_sock:Map<number, socketCid>;

    constructor(h:wslistener_handler, p:packetcodec){
        this._handler = h;
        this._pcodec = p;
        
        this._cid_to_sock = new Map<number, socketCid>();
    }

    get host() {
        return this._host;
    }
    get port() {
        return this._port;
    }
    get handler() {
        return this._handler;
    }
    get pcodec() {
        return this._pcodec;
    }

    start(host:string, port:number):boolean{

        if(this._pcodec == null)
        {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wslistener_nodeimpl _pcodec is null`);
            return false;
        }
        if(this._handler == null)
        {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wslistener_nodeimpl _handler is null`);
            return false;
        }

        this._wss = new WebSocketServer({
            host:host, 
            port:port,
            // perMessageDeflate: {
            //     zlibDeflateOptions: {
            //         // See zlib defaults.
            //         chunkSize: 1024,
            //         memLevel: 7,
            //         level: 3
            //     },
            //     zlibInflateOptions: {
            //         chunkSize: 10 * 1024
            //     },
            //     // Other options settable:
            //     clientNoContextTakeover: true, // Defaults to negotiated value.
            //     serverNoContextTakeover: true, // Defaults to negotiated value.
            //     serverMaxWindowBits: 10, // Defaults to negotiated value.
            //     // Below options specified as default values.
            //     concurrencyLimit: 10, // Limits zlib concurrency for perf.
            //     threshold: 1024 // Size (in bytes) below which messages
            //     // should not be compressed if context takeover is disabled.
            // }
        });

        let thisptr = this;
        this._wss.on("connection", (socket)=>{
            thisptr._on_socket_connect(socket);
        });

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `wslistener_nodeimpl start up on ${host}:${port}`);

        return true;
    }
    
    shutdown():void {
        // TO DO : disconnect all connections and shut down
    }
    
    disconnect(cid:number, reason:string):void {
        const sockcid = this._cid_to_sock.get(cid);
        if(sockcid == undefined)
        {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wslistener_nodeimpl disconnet cid:${cid} not exist`);
            return;
        }

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wslistener_nodeimpl disconnet cid:${cid} reason:${reason}`);

        sockcid.socket.close(connection_close_code.server_close, reason);
    }
    send_packet(cid:number, p:packet):void {

        const sockcid = this._cid_to_sock.get(cid);
        if(sockcid == undefined)
        {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wslistener_nodeimpl send cid:${cid} not exist`);
            return;
        }
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wslistener_nodeimpl send cid:${cid} packet:${p}`);

        var data:Uint8Array = this._pcodec.encode_packet(p);
        if(data==null){
            return;
        }
        
        this._send_data(sockcid, data);
    }
    broadcast_packet(cid:number[], p:packet):void {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wslistener_nodeimpl broadcast cids:${cid} packet:${p}`);

        var data:Uint8Array = this._pcodec.encode_packet(p);
        if(data==null){
            return;
        }

        for(var i=0; i<cid.length; ++i){
            
            const sockcid = this._cid_to_sock.get(cid[i]);
            if(sockcid == undefined)
            {
                natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wslistener_nodeimpl broadcast cid:${cid[i]} not exist`);
                continue;
            }

            this._send_data(sockcid, data);
        }
    }

    _send_data(sockcid:socketCid, data:Uint8Array) {

        sockcid.socket.send(data, err=>{
            // TO DO : send error
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wslistener_nodeimpl send packet cid:${sockcid.cid} error:${err?.name}\r\n${err?.message}`);
        });
    }

    _on_socket_connect(socket:WebSocket):void {

        let sockcid = {
            cid:this._cid_seed, 
            socket:socket,
            onmsg:(data:any)=>{},
            onclose:(code:number, reason:Buffer)=>{},
            onerror:(err:Error)=>{}
        };

        ++this._cid_seed;
        if(this._cid_seed <= 0){
            this._cid_seed = 1;
        }

        let thisptr = this;
        sockcid.onmsg = (data:any)=>{
            thisptr._on_socket_message(sockcid, data as Uint8Array);
        };
        sockcid.onclose = (code:number, reason:Buffer)=>{
            thisptr._on_socket_close(sockcid, code, reason);
        }
        sockcid.onerror = (err:Error)=>{
            thisptr._on_socket_error(sockcid, err);
        }
        
        this._cid_to_sock.set(sockcid.cid, sockcid);

        socket.on("message", sockcid.onmsg);
        socket.on("close", sockcid.onclose);
        socket.on("error", sockcid.onerror);

        // socket.onerror = (evt) =>{
        //     evt.error
        // }

        this._handler.on_connected(sockcid.cid);
    }

    _on_socket_message(sockcid:socketCid, data:Uint8Array):void {
        var p:packet = this._pcodec.decode_packet(data);
        this._handler.on_packet(sockcid.cid, p);
    }

    _on_socket_close(sockcid:socketCid, code:number, reason:Buffer):void {
        this._cid_to_sock.delete(sockcid.cid);
        sockcid.socket.off("message", sockcid.onmsg);
        sockcid.socket.off("close", sockcid.onclose);
        sockcid.socket.off("error", sockcid.onerror);

        const reasonstr:string = `code:${code}, reason:${reason.toString()}`;
        this._handler.on_disconnected(sockcid.cid,reasonstr);
    }

    _on_socket_error(sockcid:socketCid, err:Error):void {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wslistener_nodeimpl cid:${sockcid.cid} err:[${err.name}\r\n${err.message}]`);

        // TO DO : check error
    }

}