// natrium
// license : MIT
// author : Sean Chen

import { nat } from "..";
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

    public async startup() {
        // start up service
        let outservice1 = nat.create_serviceworker();
        outservice1.set_service_index(0);
        this._outgameServices.push(outservice1);
        
        let worldservice1 = nat.create_serviceworker();
        worldservice1.set_service_index(0);
        this._worldServices.push(worldservice1);
        let worldservice2 = nat.create_serviceworker();
        worldservice2.set_service_index(1);
        this._worldServices.push(worldservice2);
        let worldservice3 = nat.create_serviceworker();
        worldservice3.set_service_index(2);
        this._worldServices.push(worldservice3);
        let worldservice4 = nat.create_serviceworker();
        worldservice4.set_service_index(3);
        this._worldServices.push(worldservice4);
        
        let levelservice1 = nat.create_serviceworker();
        levelservice1.set_service_index(0);
        this._levelInstanceServices.push(levelservice1);
        let levelservice2 = nat.create_serviceworker();
        levelservice2.set_service_index(1);
        this._levelInstanceServices.push(levelservice2);

        await outservice1.start_service({
            service_name:"outgameservice",
            service_file:"../../server/services/outgameservice.ts"
        });
        
        await worldservice1.start_service({
            service_name:"worldservice",
            service_file:"../../server/services/worldservice.ts"
        });
        await worldservice2.start_service({
            service_name:"worldservice",
            service_file:"../../server/services/worldservice.ts"
        });
        await worldservice3.start_service({
            service_name:"worldservice",
            service_file:"../../server/services/worldservice.ts"
        });
        await worldservice4.start_service({
            service_name:"worldservice",
            service_file:"../../server/services/worldservice.ts"
        });
        
        await levelservice1.start_service({
            service_name:"levelinstanceservice",
            service_file:"../../server/services/levelinstanceservice.ts"
        });
        await levelservice2.start_service({
            service_name:"levelinstanceservice",
            service_file:"../../server/services/levelinstanceservice.ts"
        });

        // init session mgr

        // start up listener
        var c = nat.create_packetcodec();
        this._wslistener = nat.create_wslistener(this, c);

        network.add_wslistener(this._wslistener); // register listener

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
        
        // send back
        this._wslistener?.send_packet(cid, p);
        
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