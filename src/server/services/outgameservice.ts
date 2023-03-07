// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../..";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { serviceconf, natrium_services } from "../../interface/service/service";
import { servicebase } from "./servicebase";

export class outgameservice extends servicebase {

    public static create(c:serviceconf) {
        return new outgameservice(c);
    }
    
    constructor(c:serviceconf) {
        super(c);
    }

    public override on_add_session(sid:number, skey:string):void {
        super.on_add_session(sid, skey);

        // TO DO : new session

        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on add session  ${sid}, ${skey}`);
    }
    public override on_remove_session(sid:number):void {
        super.on_remove_session(sid);
        
        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on remove session  ${sid}`);
    }
    public override on_session_close(sid:number):void {
        this.on_remove_session(sid); // remove sessoin first

        // TO DO : write back

        nat.dbglog.log(debug_level_enum.dle_debug, `outgameservice on session close ${sid}`);
    }

    public override on_service_task(command:string, data:object):void {

    }

    public override on_broadcast_session_msg(command:string, data:object):void {

    }
    public override on_session_message(sid:number, command:string, data:object):void {

        nat.dbglog.log(debug_level_enum.dle_debug, `on_session_message on session close ${sid} c:${command} d:${data}`);
    }

    //on_session_rpc_sync(sid:number, cmd:string, data:any):any;

    public override on_service_update():void {

    }
}

natrium_services.register("outgameservice", outgameservice.create);