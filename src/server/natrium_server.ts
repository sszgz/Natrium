// natrium
// license : MIT
// author : Sean Chen

import { nat } from "..";
import { serverconf } from "../interface/config/configs";
import { debug_level_enum } from "../interface/debug/debug_logger";
import { httplistener, httplistener_handler, httpmsgproc_map_type, httpmsgproc_type, http_request_like, http_response_like } from "../interface/network/httplistener";
import { network } from "../interface/network/network";
import { wslistener, wslistener_handler } from "../interface/network/wslistener";
import { packet, prototype } from "../interface/protocol/packet";
import { natrium_services } from "../interface/service/service";
import { serviceworker } from "../interface/service/serviceworker";
import { sessionmgr } from "../interface/session/sessionmgr";
import { http_interal_json, http_unknown_cmd_json, on_broadcast_msg, on_verify_sign } from "./gameframework/msgs/httpmsgs";

export class natrium_server implements wslistener_handler, httplistener_handler {

    protected _wslistener:wslistener|null = null;
    protected _httplistener:httplistener|null = null;

    protected _sessions:sessionmgr = nat.create_sessionmgr();;

    protected _outgameServices:Array<serviceworker> = new Array<serviceworker>();
    protected _worldServices:Array<serviceworker> = new Array<serviceworker>();
    protected _levelInstanceServices:Array<serviceworker> = new Array<serviceworker>();

    protected _httpmsgprocs:httpmsgproc_map_type = {};

    constructor() {
    }

    public get wslistener() {
        return this._wslistener;
    }
    public get httplistener() {
        return this._httplistener;
    }

    public async startup(svrconfigfile:string) {
        // init config
        nat.conf.init(svrconfigfile);

        // init datas
        let succ = await nat.datas.init();
        if(!succ) {
            return;
        }

        // clear all session data
        nat.datas.memcaches.session.clear_datas();

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

        let promiseAry = new Array<any>();
        for(let i=0; i<scs.length; ++i) {
            switch(scs[i].service_name){
                case "outgameservice":
                    {
                        for(let index=0;index<scs[i].service_count; ++index){
                            let service = nat.create_serviceworker();
                            service.set_service_index(index);
                            this._outgameServices.push(service);
                            promiseAry.push(service.start_service(scs[i]));
                        }
                    }
                    break;
                case "worldservice":
                    {
                        for(let index=0;index<scs[i].service_count; ++index){
                            let service = nat.create_serviceworker();
                            service.set_service_index(index);
                            this._worldServices.push(service);
                            promiseAry.push(service.start_service(scs[i]));
                        }
                    }
                    break;
                case "levelinstanceservice":
                    {
                        for(let index=0;index<scs[i].service_count; ++index){
                            let service = nat.create_serviceworker();
                            service.set_service_index(index);
                            this._levelInstanceServices.push(service);
                            promiseAry.push(service.start_service(scs[i]));
                        }
                    }
                    break;
                default :
                    {
                        nat.dbglog.log(debug_level_enum.dle_error, `natrium_server startup service name:${scs[i].service_name} wrong`);
                    }
                    break;
            }
            // await service.start_service(scs[i]);
        }

        await Promise.all(promiseAry);

        nat.dbglog.log(debug_level_enum.dle_system, `natrium_server start service [${scs.length}] outgame[${this._outgameServices.length}] world[${this._worldServices.length}] level[${this._levelInstanceServices.length}]`);

        // init session mgr

        // reg http msg
        this.reg_httpmsg_proc("/verify", on_verify_sign);
        this.reg_httpmsg_proc("/broadcast", on_broadcast_msg);

        // start up http listener
        this._httplistener = nat.create_httplistener(this);

        // start up ws listener
        var c = nat.create_packetcodec();
        this._wslistener = nat.create_wslistener(this, c);
        network.add_wslistener(this._wslistener); // register listener

        // listen on exit sig
        let thisptr = this;
        process.on('SIGINT', function() {
            console.log("Caught interrupt signal");
        
            // close all listener
            thisptr._httplistener?.shutdown();
            thisptr._wslistener?.shutdown();

            // wait all service shutdown

            // TO DO : not working?
            natrium_services.workers.forEach(async (sw)=>{
                await sw.finish_service();
            });

            // let allexit = false;
            // while(!allexit){
            //     allexit = true;
            //     natrium_services.workers.forEach( (sw)=>{
            //         if(!sw.exited){
            //             allexit = false;
            //         }
            //     });
            // }

            console.log("shut down");

            process.exit();
        });
    }

    public reg_httpmsg_proc(cmd:string, proc:httpmsgproc_type):void {
        if(cmd in this._httpmsgprocs){
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server register http msg proc [${cmd} already exist]`);
            return;
        }
        this._httpmsgprocs[cmd] = proc;
    }
    public open_httplistener(host:string, port:number) {
        if(this._httplistener == null){
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server open httplistener when _httplistener is null`);
            return;
        }
        
        // TO DO : use config
        this._httplistener.start(host, port);
    }

    public open_wslistener(uri:string|undefined, port:number) {
        if(this._wslistener == null){
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server open wslistener when _wslistener is null`);
            return;
        }

        // TO DO : use config
        this._wslistener.start(uri, port);
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

        if(p.prototp == prototype.proto_json || p.prototp == prototype.proto_grpc) {
            ses.current_service.channel.dispatch_session_msg(ses.session_id, p.data.c, p.data.d);
        }
    }

    async on_request(req:http_request_like, res:http_response_like):Promise<void> {
        if(req.url == undefined) {
            res.write(http_unknown_cmd_json);
            res.end();
            return;
        }
        if(!(req.url in this._httpmsgprocs)){
            res.write(http_unknown_cmd_json);
            res.end();
            return;
        }
        try{
            await this._httpmsgprocs[req.url](req, res);
        }
        catch(e){
            let err:Error = e as Error;
            nat.dbglog.log(debug_level_enum.dle_error, `natrium_server on http request ${req.url} exception:${err.message}\r\n ${err.stack}`);
            res.write(http_interal_json);
            res.end();
        }
    }
}