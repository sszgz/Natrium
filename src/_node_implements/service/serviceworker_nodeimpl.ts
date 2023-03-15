// natrium
// license : MIT
// author : Sean Chen

import { isMainThread, Worker, MessageChannel, workerData, parentPort } from "node:worker_threads";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { network } from "../../interface/network/network";

import { natrium_services } from "../../interface/service/service";
import { servicechannel, serviceworker } from "../../interface/service/serviceworker";
import { session } from "../../interface/session/session";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { session_nodeimpl } from "../session/session_nodeimpl";
import { _Service_M2W_MSG, _Service_W2M_MSG } from "../_node/_threads_msgs";
import { _Node_MainTrhead, _Node_WorkerThread } from "../_node/_threads";
import { _service_workers } from "./_service_workers";
import { serviceconf } from "../../interface/config/configs";
import { packet } from "../../interface/protocol/packet";

export class servicechannel_nodeimpl implements servicechannel {
    
    protected _worker_port:null|Worker|MessagePort = null;

    public set_worker_thread(t:Worker|MessagePort):void {
        this._worker_port = t;
    }

    public dispatch_service_task(command:string, data:any):void {
        this._worker_port?.postMessage({cmd:_Service_M2W_MSG._m2w_service_task, command:command, data:data});
    }

    public dispatch_session_msg(sid:number, command:string, data:any):void {
        this._worker_port?.postMessage({cmd:_Service_M2W_MSG._m2w_session_msg, sid:sid, command:command, data:data});
    }
    public brodcast_session_msg(command:string, data:any):void {
        this._worker_port?.postMessage({cmd:_Service_M2W_MSG._m2w_bcast_msg, command:command, data:data});
    }
    
    // public session_rpc_sync(sid:number, command:string, data:any):any {
    //     // this._worker_port?.postMessage({cmd:_woker_cmds.wc_rpc_sync, sid:sid, command:command, data:data});
    //     return null;
    // }
}

export class serviceworker_nodeimpl implements serviceworker {

    protected _thread_id:number = 0;
    protected _service_name:string = "";
    protected _service_index:number = 0;
    protected _channel:servicechannel_nodeimpl = new servicechannel_nodeimpl();

    protected _worker_thread:null|_Node_WorkerThread = null;
    protected _sessions:Map<number, session> = new Map<number, session>();

    protected _changing_svr_sessoins = new Map<number, session>();

    public get thread_id() {
        return this._thread_id;
    }
    public get service_name() {
        return this._service_name;
    }
    public get service_index() {
        return this._service_index;
    }
    public get channel() {
        return this._channel;
    }
    public get exited() {
        if(this._worker_thread == null){
            return false;
        }
        return this._worker_thread.exited;
    }

    public set_service_index(i:number):void {
        this._service_index = i;
    }

    public async start_service(c:serviceconf):Promise<boolean> {
        this._worker_thread = await _Node_MainTrhead.createWorker(
            _service_workers.make_service_thread_uname(c.service_name, this._service_index),  
            "../service/_service_nodeworker_impl",
            {
                conf:c,
                si:this._service_index,
                svrconfigfile:natrium_nodeimpl.impl.conf.svrconfigfile
            }
            // ,
            // // resource limits
            // {
            //     maxYoungGenerationSizeMb:,
            //     maxOldGenerationSizeMb:,
            //     codeRangeSizeMb:,
            //     stackSizeMb:
            // }
        );

        this._service_name = c.service_name;
        this._thread_id = this._worker_thread.threadId;

        this._channel.set_worker_thread(this._worker_thread.worker);

        let thisptr = this;

        this._worker_thread.on('message', (msg)=>{
            thisptr._on_worker_msg(msg);
        });

        natrium_services.add_worker(this);

        return true;
    }
    public async finish_service():Promise<boolean> {
        if(this._worker_thread == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} finish_service thread not start`);
            return true;
        }

        await this._worker_thread.finish();

        return true;
    }

    public add_session(s:session):void {
        if(this._worker_thread == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} add session:${s.session_id} thread not start`);
            return;
        }

        if(this._sessions.has(s.session_id)){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} add session:${s.session_id} already added`);
            return;
        }
        this._sessions.set(s.session_id, s);

        this._worker_thread.worker.postMessage({cmd:_Service_M2W_MSG._m2w_add_session, sid:s.session_id, skey:s.session_key});
        s.set_service(this);
    }

    public remove_session(s:session):void {
        if(this._worker_thread == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} rmv session:${s.session_id} thread not start`);
            return;
        }

        if(!this._sessions.has(s.session_id)){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} rmv session:${s.session_id} not exist`);
            return;
        }
        this._sessions.delete(s.session_id);

        this._worker_thread.worker.postMessage({cmd:_Service_M2W_MSG._m2w_rmv_session, sid:s.session_id});
        s.set_service(null);
    }

    public on_session_close(s:session):void {
        if(this._worker_thread == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} close session:${s.session_id} thread not start`);
            return;
        }

        if(!this._sessions.has(s.session_id)){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} close session:${s.session_id} not exist`);
            return;
        }
        this._sessions.delete(s.session_id);

        this._worker_thread.worker.postMessage({cmd:_Service_M2W_MSG._m2w_close_session, sid:s.session_id});
    }

    protected _on_worker_msg(msg:any){
        switch(msg.cmd)
        {
        case _Service_W2M_MSG._w2m_session_msg:
            {
                // TO DO : send session message
                if(msg.is_rpc){
                    // send rpc
                    network.def_wslistener.send_packet(msg.sid, network.def_wslistener.pcodec.create_protopkt(msg.msg.c, msg.msg.d)); // sid = cid
                }
                else {
                    // send json
                    network.def_wslistener.send_packet(msg.sid, network.def_wslistener.pcodec.create_jsonpkt(msg.msg)); // sid = cid
                }
            }
            break;
        case _Service_W2M_MSG._w2m_boradcast_session_msg:
            {
                let pkt:packet;
                if(msg.is_rpc){
                    // make rpc
                    pkt = network.def_wslistener.pcodec.create_protopkt(msg.msg.c, msg.msg.d);
                }
                else {
                    // make json
                    pkt = network.def_wslistener.pcodec.create_jsonpkt(msg.msg);
                }
                
                if("tosids" in msg){
                    // broad cast with session id array
                    network.def_wslistener.broadcast_packet_with(msg.tosids, pkt, msg.fromsid); // sid = cid
                }
                else {
                    // borad cast to whole server
                    network.def_wslistener.broadcast_packet(pkt);
                }
            }
            break;
        case _Service_W2M_MSG._w2m_changeservice:
            {
                let ses = this._sessions.get(msg.sid);
                if(ses == undefined) {
                    natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} change service to service:${msg.msg.tosn} index:${msg.msg.tosi} session:${msg.sid} not exist`);
                    // TO DO : kick
                    network.def_wslistener.disconnect(msg.sid,"service bind error");
                    return;
                }
                this.remove_session(ses);
                
                this._changing_svr_sessoins.set(ses.session_id, ses);
                // wait remove finish
            }
            break;
        case _Service_W2M_MSG._w2m_changeservice_sesrmved:
            {
                let ses = this._changing_svr_sessoins.get(msg.sid);
                if(ses == undefined) {
                    natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} change service to service:${msg.msg.tosn} index:${msg.msg.tosi} changing session:${msg.sid} not exist`);
                    // TO DO : kick
                    network.def_wslistener.disconnect(msg.sid,"service bind error");
                    return;
                }

                this._changing_svr_sessoins.delete(msg.sid);

                let uname = natrium_services.make_service_uname(msg.msg.tosn, msg.msg.tosi);
                let serviceworker = natrium_services.get_worker(uname);
                if(serviceworker == undefined){
                    natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `serviceworker_nodeimpl service:${this._service_name} index:${this._service_index} change service to service:${msg.msg.tosn} index:${msg.msg.tosi} not exist`);
                    // TO DO : kick
                    network.def_wslistener.disconnect(msg.sid,"service bind error");
                    return;
                }
                serviceworker.add_session(ses);
            }
            break;
        case _Service_W2M_MSG._w2m_kickplayer:
            {
                network.def_wslistener.disconnect(msg.sid, msg.reason);
            }
            break;
        }
    }
}