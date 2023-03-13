// natrium
// license : MIT
// author : Sean Chen

import * as path from 'path';
import { MessagePort } from "node:worker_threads";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { service, natrium_services } from "../../interface/service/service";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { _Service_M2W_MSG } from "../_node/_threads_msgs";
import { _Node_SessionContext, _Node_ThreadContext } from "../_node/_thread_contexts";
import { _Node_Worker } from "../_node/_worker";
import { serviceconf } from '../../interface/config/configs';

export class _Service_Node_Worker_Impl implements _Node_Worker {

    protected _uname:string = "";
    protected _service:service|null = null;

    protected _changingservice_sids = new Map<number, any>();

    public get uname() {
        return this._uname;
    }

    mark_changeservice(sid:number, tosn:string, tosi:number):void {
        this._changingservice_sids.set(sid, {tosn, tosi});
    }

    async startup(uname:string, workerData:any):Promise<void> {
        
        let conf:serviceconf = workerData.conf;
        let service_index:number = workerData.si;

        this._uname = uname;
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Service_Node_Worker_Impl service:${conf.service_name} index:${service_index} init conf`);
        natrium_nodeimpl.impl.conf.init();

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Service_Node_Worker_Impl service:${conf.service_name} index:${service_index} init db`);
        await natrium_nodeimpl.impl.datas.init();

        // require service file
        await import(path.resolve(__dirname, `../../../${conf.service_file}`));
        //require(conf.service_file);

        this._service = natrium_services.create_service(conf.service_name, conf);
        if(this._service == null) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Service_Node_Worker_Impl service:${conf.service_name} class not exist`);
            return;
        }
        this._service.set_service_index(service_index);

        await this._service.startup();
    }
    async shutdown():Promise<void> {
        if(this._service == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Service_Node_Worker_Impl shutdown _uname:${this._uname} service is null`);
            return;
        }

        await this._service.shutdown();
    }
    startshutingdown():void {
        // TO DO : finish all tasks
    }
    
    onsetupchannel(fromworker:string, port:MessagePort, udata:any):void {
        // TO DO : setup channel
    }

    async onmsg(fromworker:string, data:any):Promise<void> {
        if(this._service == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Service_Node_Worker_Impl onmsg _uname:${this._uname} service is null`);
            return;
        }
        
        // TO DO : queue msgs?
        switch(data.cmd){
            case _Service_M2W_MSG._m2w_session_msg:
                await this._service.on_session_message(data.sid, data.command, data.data);
                break;
            case _Service_M2W_MSG._m2w_add_session:
                await this._service.on_add_session(data.sid, data.skey);
                break;
            case _Service_M2W_MSG._m2w_rmv_session:
                {
                    await this._service.on_remove_session(data.sid);
                    const d = this._changingservice_sids.get(data.sid);
                    if(d != undefined){
                        this._changingservice_sids.delete(data.sid);
                        _Node_SessionContext.changeServiceSesRmved(data.sid, d.tosn, d.tosi);
                    }
                }
                break;
            case _Service_M2W_MSG._m2w_service_task:
                await this._service.on_service_task(data.command, data.data);
                break;
            case _Service_M2W_MSG._m2w_bcast_msg:
                await this._service.on_broadcast_session_msg(data.command, data.data);
                break;
            // case _Service_M2W_MSG._m2w_rpc_sync:
            //     this._service.on_session_rpc_sync(data.sid, data.command, data.data);
            //     break;
            case _Service_M2W_MSG._m2w_close_session:
                await this._service.on_session_close(data.sid);
                break;
        }
    }
    async onupdate():Promise<void> {
        if(this._service == null){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Service_Node_Worker_Impl onupdate _uname:${this._uname} service is null`);
            return;
        }

        await this._service.on_service_update();
    }
}

export const w = new _Service_Node_Worker_Impl();
_Node_ThreadContext.initCurrentWorker(w);
//console.log(`_Node_ThreadContext.currentWorker:${_Node_ThreadContext.currentWorker}`);