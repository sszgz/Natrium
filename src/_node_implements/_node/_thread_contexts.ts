// natrium
// license : MIT
// author : Sean Chen

import { isMainThread, Worker, MessageChannel, MessagePort, workerData, parentPort, threadId } from "node:worker_threads";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
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

    public static postParentMessage(msg:any):void{
        parentPort?.postMessage(msg);
    }
}

export class _Node_SessionContext {
    public static sendWSMsg(sid:number, command:string, data:any):void {
        // TO DO : setup wslistener port
        parentPort?.postMessage({cmd:_Service_W2M_MSG._w2m_session_msg, sid:sid, msg:{c:command, d:data}});
    }
}
