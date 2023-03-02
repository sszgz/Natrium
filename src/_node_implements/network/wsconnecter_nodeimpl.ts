// natrium
// license : MIT
// author : Sean Chen

import { WebSocket } from "ws";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { connection_close_code } from "../../interface/network/networkconsts";

import { wsconnecter, wsconnecter_handler } from "../../interface/network/wsconnecter";
import { packet, packettype } from "../../interface/protocol/packet";
import { packetcodec } from "../../interface/protocol/packetcodec";
import { sys_packet_cmds, shakehand_mark } from "../../interface/protocol/protocolconsts";
import { natrium_nodeimpl } from "../natrium_nodeimpl";

export class wsconnecter_nodeimpl implements wsconnecter {
    
    protected _host:string = "";
    protected _handler:wsconnecter_handler;
    protected _pcodec:packetcodec;
    protected _ws:WebSocket|null = null;

    protected _lastpingtm = 0;
    protected _lastpongtm = 0;
    protected _latency = 0;
    protected _servertickfromstart = 0;

    constructor(h:wsconnecter_handler, p:packetcodec) {
        this._handler = h;
        this._pcodec = p;
    }

    public get host() {
        return this._host;
    }
    public get handler() {
        return this._handler;
    }
    public get pcodec() {
        return this._pcodec;
    }
    public get latency(){
        return this._latency;
    }
    public get server_tick() {
        return this._servertickfromstart + (Date.now() - this._lastpongtm);
    }
    
    public connect(host:string):boolean {
        
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
            thisptr._on_socket_message(data as Buffer);
        });

        return true;
    }
    public disconnect(reason:string):void {
        if(this._ws == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl disconnect when ws not connect`);
            return;
        }

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wsconnecter_nodeimpl disconnect`);
        this._ws.close(connection_close_code.client_close, reason);
    }
    public send_packet(p:packet):void {
        if(this._ws == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl send when ws not connect`);
            return;
        }
        
        //natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wsconnecter_nodeimpl send packet:${p}`);

        var data:Buffer = this._pcodec.encode_packet(p);
        if(data==null){
            return;
        }
        
        this._ws.send(data, err=>{

            if(err != undefined) {
                // TO DO : error
                natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl send error:${err?.name}\r\n${err?.message}`);
            }
        });
    }
    public shakehand():void{
        let p = this._pcodec.create_shakehandpkt(0); // fisrt msg, no servertime saved

        this._lastpingtm = Date.now();
        this.send_packet(p);
    }
    public ping():void{

        let p = this._pcodec.create_pingpongpkt(this.server_tick);

        this._lastpingtm = Date.now();
        this.send_packet(p);
    }
    
    protected _on_socket_connected():void {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wsconnecter_nodeimpl [${this._host}] connected`);

        this._handler.on_connected();
    }

    protected _handle_sys_cmd(p:packet):void {
        switch(p.data.cmdid) {
            case sys_packet_cmds.spc_shakehand:
                {
                    // TO DO : check shakehand msg
                    if(p.data.mark == shakehand_mark) {
                        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wsconnecter_nodeimpl shakehand over`);

                        this._lastpongtm = Date.now();
                        this._latency = this._lastpongtm - this._lastpingtm;
                        this._servertickfromstart = p.data.time;

                        this._handler.on_shakehand();
                    }
                    else {
                        // Endian not same
                        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, `wsconnecter_nodeimpl shakehand edian wrong`);
                    }
                }
                break;
            case sys_packet_cmds.spc_pingpong:
                {
                    this._lastpongtm = Date.now();
                    this._latency = this._lastpongtm - this._lastpingtm;
                    this._servertickfromstart = p.data.time;

                    // natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_debug, 
                    //     `wsconnecter_nodeimpl pingpong server time[${p.data.time}] latency[${this._latency}]`);

                }
                break;
        }
    }

    protected _on_socket_message(data:Buffer):void {
        var p:packet = this._pcodec.decode_packet(data);
        if(p.pktp == packettype.pkt_sys){
            this._handle_sys_cmd(p);
        }
        else {
            this._handler.on_packet(p);
        }
    }

    protected _on_socket_error(err:Error):void {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `wsconnecter_nodeimpl err:[${err.name}\r\n${err.message}]`);

        // TO DO : check error
    }
}