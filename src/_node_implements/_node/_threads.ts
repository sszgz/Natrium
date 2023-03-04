// natrium
// license : MIT
// author : Sean Chen

import { isMainThread, Worker, MessageChannel, MessagePort, workerData, parentPort } from "node:worker_threads";
import { EventEmitter } from "ws";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { _Main2Worker_MSG, _Service_W2M_MSG, _Worker2Main_MSG } from "./_therads_msgs";

export interface _Node_Worker {

    uname:string;

    startup(uname:string, workerData:any):void;
    shutdown():void;
    startshutingdown():void;
    
    onsetupchannel(fromworker:string, port:MessagePort, udata:any):void;
    onmsg(fromworker:string, msg:any):void;
    onupdate():void;
}

export class _Node_MainTrhead {

    protected static _workermap:Map<string, _Node_WorkerThread> = new Map<string, _Node_WorkerThread>();

    public static createWorker(uname:string, filename:string, workerData:any, resLimit:any=null):_Node_WorkerThread {
        let worker = new Worker(__filename, {
            workerData:{
                filename:filename,
                uname:uname,
                workerData:workerData
            },
            resourceLimits:resLimit
        });

        let wt = new _Node_WorkerThread(uname, worker);

        wt.init();

        this._workermap.set(uname, wt);

        return wt;
    }

    public static getWorker(uname:string):_Node_WorkerThread|undefined {
        return this._workermap.get(uname);
    }
}

export class _Node_WorkerThread extends EventEmitter {

    protected _uname:string;
    protected _worker:Worker;

    protected _on_msg_fn:any = null;
    protected _on_err_fn:any = null;
    protected _on_exit_fn:any = null;

    constructor(uname:string, w:Worker){
        super();
        
        this._uname = uname;
        this._worker = w;
    }

    public get threadId() {
        return this._worker.threadId;
    }
    public get worker():Worker {
        return this._worker;
    }

    public init():void{
        
        let thisptr = this;
        this._on_msg_fn = (msg:any)=>{
            thisptr._on_worker_msg(msg);
        };
        this._on_err_fn = (err:Error)=>{
            thisptr._on_worker_error(err);
        };
        this._on_exit_fn = (code:number) => {
            if (code !== 0){
                thisptr._on_worker_error(new Error(`Worker stopped with exit code ${code}`));
            }
            else {
                thisptr._on_worker_exit(code);
            }
        }
        
        this._worker.on('message', this._on_msg_fn);
        this._worker.on('messageerror', this._on_err_fn);
        this._worker.on('error', this._on_err_fn);
        this._worker.on('exit', this._on_exit_fn);
    }

    public finish():void{
        // TO DO : finish
        this._worker.postMessage({cmd:_Main2Worker_MSG._m2w_exit});
    }
    
    protected _on_worker_msg(msg:any){
        switch(msg.cmd){
            case _Worker2Main_MSG._w2m_create_channel:
                {
                    let other_worker = _Node_MainTrhead.getWorker(msg.workeruname);
                    if(other_worker == undefined){
                        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerThread tid${process.pid} uname:${this._uname} create channel to uname${msg.workeruname} woker thread not found`);

                        break;
                    }
                    
                    const { port1, port2 } = new MessageChannel();

                    this._worker.postMessage({cmd:_Main2Worker_MSG._m2w_setup_channel, from:other_worker._uname, port:port1, udata:msg.udata}, [port1]);
                    other_worker._worker.postMessage({cmd:_Main2Worker_MSG._m2w_setup_channel, from:this._uname, port:port2, udata:msg.udata}, [port2]);
                }
                break;
            case _Worker2Main_MSG._w2m_exit:
                {
                    this._worker.terminate();
                }
                break;
            default:
                {
                    this.emit('message', msg);
                }
                break;
        }
    }
    protected _on_worker_error(err:Error){
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerThread tid${process.pid} on error ${err.message}\r\n ${err.stack}`);
    }
    protected _on_worker_exit(exitCode: number){
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_WorkerThread tid${process.pid} exit with code ${exitCode}`);
        // TO DO : on exit
    }

}

export class _Node_ThreadContext {

    public static get deltaTimeMS():number {
        return _Node_Thread.deltaTimeMS;
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
        parentPort?.postMessage({cmd:_Service_W2M_MSG._w2m_session_msg, sid:sid, msg:{c:command, d:data}});
    }
}

class _Node_Thread {

    protected _started:boolean = false;
    protected _isshutingdown:boolean = false;

    protected _worker:_Node_Worker;
    protected _timer:NodeJS.Timer;

    protected static _lastUpdateTime:number = 0;
    protected static _deltaTimeMS:number = 0;
    
    constructor(w:_Node_Worker, updateTickMS:number = 500){
        this._worker = w;
        this._timer = setInterval(this._on_update, updateTickMS);

        _Node_Thread._lastUpdateTime = natrium_nodeimpl.impl.sys.getTimeStamp();
    }

    public static get deltaTimeMS():number {
        return this._deltaTimeMS;
    }

    public start_up(uname:string, workerData:any):void{
        if(this._started){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_Thread start_up worker:${uname} already started`);
            return;
        }

        this._worker.startup(uname, workerData);
        this._started = true;
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_Thread start_up tid${process.pid} worker:${this._worker.uname}`);
    }
    public shut_down():void{
        if(!this._started){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_Thread shut_down worker:${this._worker.uname} not started`);
            return;
        }

        clearInterval(this._timer);
        this._worker.shutdown();
        this._started = false;
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_Thread shutdown tid${process.pid} worker:${this._worker.uname}`);
    }
    public start_shutdown():void {
        this._isshutingdown = true;
        this._worker.startshutingdown();

        // TO DO : finish all tasks
        // TO DO : close all messge channel
    }

    public setup_channel(fromworker:string, port:MessagePort, udata:any):void {
        
        let thisptr = this;
        port.on("message", (pdata:any)=>{
            thisptr.on_msg(fromworker, pdata);
        });
        port.on("messageerror", (err:Error)=>{
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_Thread worker:${this._worker.uname} on error ${err.message}\r\n ${err.stack}`);
        });
        
        this._worker.onsetupchannel(fromworker, port, udata);
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_Thread setup_channel worker:${this._worker.uname} with fromworker:${fromworker}`);
    }

    public on_msg(fromport:string, data:any):void {
        // TO DO : queue msgs?
        this._worker.onmsg(fromport, data);
    }

    protected _on_update():void{
        let now = natrium_nodeimpl.impl.sys.getTimeStamp();
        _Node_Thread._deltaTimeMS = now - _Node_Thread._lastUpdateTime;
        if(_Node_Thread._deltaTimeMS < 0) {
            _Node_Thread._deltaTimeMS = 0;
        }

        this._worker.onupdate();
    }
}

async function _Node_WorkerRoutine() {

    let wd:any = workerData.workerData;

    if(parentPort == null) {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerRoutine tid${process.pid} filename:${workerData.filename} parent port null`);
        return;
    }

    let {w} = await import(workerData.filename);
    let wk = w as _Node_Worker;
    if(wk == undefined){
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerRoutine tid${process.pid} filename:${workerData.filename} import error`);
        return;
    }

    let worker_thread = new _Node_Thread(wk, workerData.workerData.updateTickMS?workerData.workerData.updateTickMS:500);

    worker_thread.start_up(workerData.uname, wd);
    
    let on_msg = (data:any)=>{
        if(data.cmd == _Main2Worker_MSG._m2w_setup_channel){
            // setup channel
            worker_thread.setup_channel(data.from, data.port, data.udata);
        }
        if(data.cmd == _Main2Worker_MSG._m2w_exit){

            // start shut down
            worker_thread.start_shutdown();

            // finish all task, notify main thread worker exit
            parentPort?.postMessage({cmd:_Worker2Main_MSG._w2m_exit});
        }
        else {
            worker_thread.on_msg("__parent", data);
        }
    }

    parentPort.on("close", ()=>{
        worker_thread.shut_down();
        
        // exit;
        process.exit(0);
    });
    parentPort.on("messageerror", (err)=>{
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerRoutine tid${process.pid} filename:${workerData.filename} on error ${err.message}\r\n ${err.stack}`);
    });
    parentPort.on("message", on_msg);
}

if(!isMainThread) {
    _Node_WorkerRoutine();
}