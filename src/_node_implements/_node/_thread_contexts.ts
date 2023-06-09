// natrium
// license : MIT
// author : Sean Chen

import { isMainThread, Worker, MessageChannel, MessagePort, workerData, parentPort, threadId } from "node:worker_threads";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { service } from "../../interface/service/service";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { _Service_Node_Worker_Impl } from "../service/_service_nodeworker_impl";
import { _Worker2Main_MSG, _Service_W2M_MSG } from "./_threads_msgs";
import { _Node_Worker } from "./_worker";

export class _Node_ThreadContext {

    protected static _currentWorker:_Node_Worker;
    protected static _deltaTimeMS:number;

    public static get currentWorker():_Node_Worker {
        return this._currentWorker;
    }

    public static initCurrentWorker(w:_Node_Worker) {
        this._currentWorker = w;
    }

    public static get deltaTimeMS():number {
        return this._deltaTimeMS;
    }
    public static setDeltaTimeMS(t:number) {
        this._deltaTimeMS = t;
    }

    public static createChannelWith(fromworker:string, toworker:string, udata:any):void{
        parentPort?.postMessage({cmd:_Worker2Main_MSG._w2m_create_channel, workeruname:toworker, udata:udata});

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_Thread request createChannelWith fromworker:${fromworker} toworker:${toworker}`);
    }

    public static postOnUserDataChange(uid:string, datamsg:string, data:any):void {
        parentPort?.postMessage({cmd:_Worker2Main_MSG._w2m_user_data_change, uid, datamsg, data});
    }

    public static postParentMessage(msg:any):void{
        parentPort?.postMessage(msg);
    }
}

export class _Node_SessionContext {
    public static sendWSMsg(sid:number, command:string, data:any, is_rpc:boolean=true):void {
        // TO DO : setup wslistener port
        parentPort?.postMessage({cmd:_Service_W2M_MSG._w2m_session_msg, sid:sid, is_rpc:is_rpc, msg:{c:command, d:data}});
    }
    public static broadCastMsgWith(fromsid:number, tosids:Array<number>, command:string, data:any, is_rpc:boolean=true):void {
        // TO DO : setup wslistener port
        parentPort?.postMessage({cmd:_Service_W2M_MSG._w2m_boradcast_session_msg, fromsid, tosids, is_rpc, msg:{c:command, d:data}});
    }
    public static broadCastMsg(command:string, data:any, is_rpc:boolean=true):void {
        // TO DO : setup wslistener port
        parentPort?.postMessage({cmd:_Service_W2M_MSG._w2m_boradcast_session_msg, is_rpc, msg:{c:command, d:data}});
    }
    public static changeService(sid:number, toservicename:string, toserviceindex:number):void {
        const svr_worker = _Node_ThreadContext.currentWorker as _Service_Node_Worker_Impl;
        svr_worker.mark_changeservice(sid, toservicename, toserviceindex);
        // notify change service
        parentPort?.postMessage({cmd:_Service_W2M_MSG._w2m_changeservice, sid:sid, msg:{tosn:toservicename, tosi:toserviceindex}});
    }
    public static changeServiceSesRmved(sid:number, tosn:string, tosi:number):void {
        // notify change service session removed
        parentPort?.postMessage({cmd:_Service_W2M_MSG._w2m_changeservice_sesrmved, sid:sid, msg:{tosn, tosi}});
    }
    public static kickPlayer(sid:number, reason:string):void {
        parentPort?.postMessage({cmd:_Service_W2M_MSG._w2m_kickplayer, sid, reason});
    }
}
