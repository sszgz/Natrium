// natrium
// license : MIT
// author : Sean Chen

import * as path from 'path';
import { MessagePort } from "node:worker_threads";
import { debug_level_enum } from "../interface/debug/debug_logger";
import { service, natrium_services } from "../interface/service/service";
import { natrium_nodeimpl } from "../_node_implements/natrium_nodeimpl";
import { _Service_M2W_MSG } from "../_node_implements/_node/_threads_msgs";
import { _Node_SessionContext, _Node_ThreadContext } from "../_node_implements/_node/_thread_contexts";
import { _Node_Worker } from "../_node_implements/_node/_worker";
import { serviceconf } from '../interface/config/configs';
import { _chainwatcher_impl } from './_chainwatcher_impl';

export class _chainwatcher_worker_impl implements _Node_Worker {

    protected _uname:string = "";
    protected _chainwatcher:_chainwatcher_impl;

    public get uname() {
        return this._uname;
    }

    async startup(uname:string, workerData:any):Promise<void> {
        
        let conf:serviceconf = workerData.conf;
        let service_index:number = workerData.si;

        this._uname = uname;
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_chainwatcher_worker_impl init conf`);
        natrium_nodeimpl.impl.conf.init(workerData.svrconfigfile);

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_chainwatcher_worker_impl init db`);
        await natrium_nodeimpl.impl.datas.init();

        this._chainwatcher = new _chainwatcher_impl();
        let succ = await this._chainwatcher.startup();
        if(!succ){
            return;
        }
    }
    async shutdown():Promise<void> {
        if(this._chainwatcher == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_chainwatcher_worker_impl shutdown _uname:${this._uname} chainwatcher is null`);
            return;
        }

        await this._chainwatcher.shutdown();
    }
    async startshutingdown():Promise<void> {
        // TO DO : finish all tasks
    }
    
    onsetupchannel(fromworker:string, port:MessagePort, udata:any):void {
        // TO DO : setup channel
    }

    async onmsg(fromworker:string, data:any):Promise<void> {
        // if(this._service == null){
        //     natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Service_Node_Worker_Impl onmsg _uname:${this._uname} service is null`);
        //     return;
        // }
        
        // // TO DO : queue msgs?
        // switch(data.cmd){
        //     case _Service_M2W_MSG._m2w_session_msg:
        //         await this._service.on_session_message(data.sid, data.command, data.data);
        //         break;
        //     case _Service_M2W_MSG._m2w_add_session:
        //         await this._service.on_add_session(data.sid, data.skey);
        //         break;
        //     case _Service_M2W_MSG._m2w_rmv_session:
        //         {
        //             await this._service.on_remove_session(data.sid);
        //             const d = this._changingservice_sids.get(data.sid);
        //             if(d != undefined){
        //                 this._changingservice_sids.delete(data.sid);
        //                 _Node_SessionContext.changeServiceSesRmved(data.sid, d.tosn, d.tosi);
        //             }
        //         }
        //         break;
        //     case _Service_M2W_MSG._m2w_service_task:
        //         await this._service.on_service_task(data.command, data.data);
        //         break;
        //     case _Service_M2W_MSG._m2w_bcast_msg:
        //         await this._service.on_broadcast_session_msg(data.command, data.data);
        //         break;
        //     // case _Service_M2W_MSG._m2w_rpc_sync:
        //     //     this._service.on_session_rpc_sync(data.sid, data.command, data.data);
        //     //     break;
        //     case _Service_M2W_MSG._m2w_close_session:
        //         await this._service.on_session_close(data.sid);
        //         break;
        // }
    }

    async onupdate():Promise<void> {
    }
}

export const w = new _chainwatcher_worker_impl();
_Node_ThreadContext.initCurrentWorker(w);
//console.log(`_Node_ThreadContext.currentWorker:${_Node_ThreadContext.currentWorker}`);