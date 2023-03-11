// natrium
// license : MIT
// author : Sean Chen

import { EventEmitter } from "ws";
import { nat } from "..";
import { debug_level_enum } from "../interface/debug/debug_logger";
import { wsconnecter, wsconnecter_handler } from "../interface/network/wsconnecter";
import { packet, prototype } from "../interface/protocol/packet";

export class natrium_client extends EventEmitter implements wsconnecter_handler {

    protected _connecter:wsconnecter|null = null;

    protected _connect_resolve:any = null;
    protected _connect_reject:any = null;

    protected _ping_tm:number = 10000; // 10 sec

    constructor() {
        super();
    }

    public get connecter() {
        return this._connecter;
    }

    public init():void {
        var c = nat.create_packetcodec();
        this._connecter = nat.create_wsconnecter(this, c);
    }

    public async connect(uri:string):Promise<void> {
        if(this._connecter == null) {
            return;
        }
        
        this._connecter.connect(uri);

        let thisptr = this;
        return new Promise<void>((resolve, reject)=>{
            thisptr._connect_resolve = resolve;
            thisptr._connect_reject = reject;
        });
    }

    on_connected():void {
        nat.dbglog.log(debug_level_enum.dle_system, `connecter handler on connected`);

        this._connecter?.shakehand();

        this.emit("connected");
    }
    on_shakehand(): void {
        nat.dbglog.log(debug_level_enum.dle_system, `connecter handler on shakehand`);

        let thisptr = this;
        var myInt = setInterval(function () {
            thisptr._connecter?.ping();
        }, thisptr._ping_tm);

        this.emit("shakehand");

        if(this._connect_resolve != null){
            this._connect_resolve();

            this._connect_resolve = null;
            this._connect_reject = null;
        }
    }
    on_disconnected(reason:string):void {
        nat.dbglog.log(debug_level_enum.dle_system, `connecter handler on disconnected reason:${reason}`);

        if(this._connect_reject != null){
            this._connect_reject();

            this._connect_resolve = null;
            this._connect_reject = null;
        }
        
        this.emit("disconnected", reason);
    }
    on_packet(p:packet):void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on packet packet:${p.data}`);

        this.emit("onmsg", p);
    }

}