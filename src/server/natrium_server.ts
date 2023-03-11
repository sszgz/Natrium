// natrium
// license : MIT
// author : Sean Chen

import { nat } from "..";
import { serverconf } from "../interface/config/configs";
import { debug_level_enum } from "../interface/debug/debug_logger";
import { network } from "../interface/network/network";
import { wslistener, wslistener_handler } from "../interface/network/wslistener";
import { packet, prototype } from "../interface/protocol/packet";
import { natrium_services } from "../interface/service/service";
import { serviceworker } from "../interface/service/serviceworker";
import { sessionmgr } from "../interface/session/sessionmgr";

export class natrium_server implements wslistener_handler {

    protected _wslistener:wslistener|null = null;

    protected _sessions:sessionmgr = nat.create_sessionmgr();;

    protected _outgameServices:Array<serviceworker> = new Array<serviceworker>();
    protected _worldServices:Array<serviceworker> = new Array<serviceworker>();
    protected _levelInstanceServices:Array<serviceworker> = new Array<serviceworker>();

    constructor() {
    }

    public get wslistener() {
        return this._wslistener;
    }

    public async startup() {
        // init config
        nat.conf.init();

        // start up service
        const svrconf = nat.conf.get_serverconf();
        if(svrconf == null) {
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server startup server config not exist`);
            return;
        }
        const scs = svrconf.get_services_conf();
        if(scs == null || scs.length <= 0){
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server startup service config not exist`);
            return;
        }

        let outgameindex = 0;
        let worldindex = 0;
        let levelindex = 0;
        let promiseAry = new Array<any>();
        for(let i=0; i<scs.length; ++i) {
            
            let service = nat.create_serviceworker();

            switch(scs[i].service_name){
                case "outgameservice":
                    {
                        service.set_service_index(outgameindex);
                        this._outgameServices.push(service);

                        ++outgameindex;
                    }
                    break;
                case "worldservice":
                    {
                        service.set_service_index(worldindex);
                        this._worldServices.push(service);
                        
                        ++worldindex;
                    }
                    break;
                case "levelinstanceservice":
                    {
                        service.set_service_index(levelindex);
                        this._levelInstanceServices.push(service);
                        
                        ++levelindex;
                    }
                    break;
            }
            
            promiseAry.push(service.start_service(scs[i]));
            // await service.start_service(scs[i]);
        }

        await Promise.all(promiseAry);

        nat.dbglog.log(debug_level_enum.dle_system, `natrium_server start service [${scs.length}] outgame[${outgameindex}] world[${worldindex}] level[${levelindex}]`);

        // init session mgr

        // start up listener
        var c = nat.create_packetcodec();
        this._wslistener = nat.create_wslistener(this, c);
        network.add_wslistener(this._wslistener); // register listener
    }

    public open_wslistener() {
        if(this._wslistener == null){
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server open wslistener when _wslistener is null`);
            return;
        }

        // TO DO : use config
        this._wslistener.start("127.0.0.1", 4091);
    }

    on_connected(cid:number):void {
        nat.dbglog.log(debug_level_enum.dle_debug, `handler on connected ${cid}`);

        // TO DO : calc session key
        let skey = `${Date.now()}_${cid}`;
        let new_ses = this._sessions.add_session(cid, skey); // cid == sid

        // dispatch session
        let index = cid % this._outgameServices.length;
        let outsvr = this._outgameServices[index];

        outsvr.add_session(new_ses);
    }
    on_disconnected(cid:number, reason:string):void {
        nat.dbglog.log(debug_level_enum.dle_debug, `handler on disconnected ${cid}, ${reason}`);

        let ses = this._sessions.get_session_by_sid(cid);
        if(ses == undefined){
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server on disconnected ${cid}, ${reason}, session not exist`);
            return;
        }
        
        if(ses.current_service != null){
            ses.current_service.on_session_close(ses);
        }
        else {
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server on disconnected ${cid}, ${reason}, session not in service`);
            return;
        }

        this._sessions.remove_session(cid);
    }
    on_packet(cid:number, p:packet):void {
        nat.dbglog.log(debug_level_enum.dle_debug, `handler on packet  ${cid}, packet:${p.data}`);
        
        // // send back
        // this._wslistener?.send_packet(cid, p);
        
        let ses = this._sessions.get_session_by_sid(cid);
        if(ses == undefined){
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server on packet ${cid}, session not exist`);
            return;
        }
        
        if(ses.current_service == null){
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server on packet ${cid}, session not in service`);
            return;
        }

        if(p.prototp == prototype.proto_json) {
            ses.current_service.channel.dispatch_session_msg(ses.session_id, p.data.c, p.data.d);
        }
        else if(p.prototp == prototype.proto_grpc) {
            // TO DO : rpc
        }
    }


}