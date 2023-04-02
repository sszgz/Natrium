// natrium
// license : MIT
// author : Sean Chen

import * as path from 'path';
import { isMainThread, Worker, MessageChannel, MessagePort, workerData, parentPort, threadId } from "node:worker_threads";
import { EventEmitter } from "ws";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { _Main2Worker_MSG, _Service_W2M_MSG, _Worker2Main_MSG } from "./_threads_msgs";
import { _Node_ThreadContext } from "./_thread_contexts";
import { _Node_Worker } from "./_worker";

export class _Node_MainTrhead {

    protected static _workermap:Map<string, _Node_WorkerThread> = new Map<string, _Node_WorkerThread>();

    public static async createWorker(uname:string, filename:string, workerData:any, resLimit:any=null):Promise<_Node_WorkerThread> {
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_MainTrhead createWorker dir:${__dirname} worker:${uname} filename:${filename}`);

        let worker = new Worker("./src/_threadstarter", {
            workerData:{
                filename:filename,
                uname:uname,
                workerData:workerData
            },
            resourceLimits:resLimit
        });

        let wt = new _Node_WorkerThread(uname, worker);

        await wt.init();

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

    protected _init_resolve:any = null;
    protected _init_reject:any = null;
    protected _fin_resolve:any = null;
    protected _fin_reject:any = null;

    protected _exited:boolean = false;
    
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
    public get exited():boolean {
        return this._exited;
    }

    public async init():Promise<void>{
        
        let thisptr = this;
        this._on_msg_fn = (msg:any)=>{
            try{
                thisptr._on_worker_msg(msg);
            }
            catch(e){
                let err:Error = e as Error;
                natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerThread tid${this._worker.threadId} uname:${this._uname} _on_worker_msg error:${err.message}\r\n${err.stack}`);
            }
        };
        this._on_err_fn = (err:Error)=>{
            thisptr._on_worker_error(err);
        };
        this._on_exit_fn = (code:number) => {
            thisptr._exited = true;
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

        return new Promise<void>((resolve, reject)=>{
            thisptr._init_resolve= resolve;
            thisptr._init_reject = reject;
        });
    }

    public async finish():Promise<void>{
        // TO DO : finish
        this._worker.postMessage({cmd:_Main2Worker_MSG._m2w_exit});
        
        let thisptr = this;
        return new Promise<void>((resolve, reject)=>{
            thisptr._fin_resolve= resolve;
            thisptr._fin_reject = reject;
        });
    }
    
    protected _on_worker_msg(msg:any){
        switch(msg.cmd){
            case _Worker2Main_MSG._w2m_create_channel:
                {
                    let other_worker = _Node_MainTrhead.getWorker(msg.workeruname);
                    if(other_worker == undefined){
                        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerThread tid${this._worker.threadId} uname:${this._uname} create channel to uname${msg.workeruname} woker thread not found`);

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
            case _Worker2Main_MSG._w2m_started:
                {
                    // worker started
                    this._init_resolve();
                    this._init_resolve = null;
                    this._init_reject = null;
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
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerThread tid:${this._worker.threadId} on error ${err.message}\r\n ${err.stack}`);
        
        if(this._init_reject){
            this._init_reject(err.message);
            
            this._init_resolve = null;
            this._init_reject = null;
        }
    }
    protected _on_worker_exit(exitCode: number){
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_WorkerThread tid:${this._worker.threadId} exit with code ${exitCode}`);
        // TO DO : on exit

        if(this._fin_resolve){
            this._fin_resolve();
            
            this._fin_resolve = null;
            this._fin_reject = null;
        }
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

        let thisptr = this;
        this._timer = setInterval(
            ()=>{
                thisptr._on_update();
            }, 
            updateTickMS);

        _Node_Thread._lastUpdateTime = natrium_nodeimpl.impl.sys.getTimeStamp();
    }

    public static get deltaTimeMS():number {
        return this._deltaTimeMS;
    }

    public async start_up(uname:string, workerData:any):Promise<void>{
        if(this._started){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_Thread start_up worker:${uname} already started`);
            return;
        }

        await this._worker.startup(uname, workerData);
        this._started = true;
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_Thread start_up tid:${threadId} worker:${this._worker.uname}`);
    }
    public async shut_down():Promise<void>{
        if(!this._started){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_Thread shut_down worker:${this._worker.uname} not started`);
            return;
        }

        clearInterval(this._timer);
        await this._worker.shutdown();
        this._started = false;
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_Thread shutdown tid:${threadId} worker:${this._worker.uname}`);
    }
    public async start_shutdown():Promise<void> {
        this._isshutingdown = true;
        await this._worker.startshutingdown();

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

    public async on_msg(fromport:string, data:any):Promise<void> {
        // TO DO : queue msgs?
        await this._worker.onmsg(fromport, data);
    }

    protected _on_update():void{
        let now = natrium_nodeimpl.impl.sys.getTimeStamp();
        _Node_Thread._deltaTimeMS = now - _Node_Thread._lastUpdateTime;
        _Node_Thread._lastUpdateTime = now;
        if(_Node_Thread._deltaTimeMS < 0) {
            _Node_Thread._deltaTimeMS = 0;
        }

        _Node_ThreadContext.setDeltaTimeMS(_Node_Thread._deltaTimeMS);

        this._worker.onupdate();
    }
}

async function _Node_WorkerRoutine() {

    let wd:any = workerData.workerData;

    if(parentPort == null) {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerRoutine tid:${threadId} filename:${workerData.filename} parent port null`);
        return;
    }

    let {w} = await import(path.resolve(__dirname, workerData.filename));
    let wk = w as _Node_Worker;
    //let wk = _Node_ThreadContext.currentWorker;
    if(wk == undefined){
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerRoutine tid:${threadId} filename:${workerData.filename} import error`);
        return;
    }
    
    natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `_Node_WorkerRoutine tid:${threadId} filename:${workerData.filename} start`);

    let worker_thread = new _Node_Thread(wk, workerData.workerData.updateTickMS?workerData.workerData.updateTickMS:500);

    await worker_thread.start_up(workerData.uname, wd);
    
    let on_msg = async (data:any)=>{
        try{
            if(data.cmd == _Main2Worker_MSG._m2w_setup_channel){
                // setup channel
                worker_thread.setup_channel(data.from, data.port, data.udata);
            }
            if(data.cmd == _Main2Worker_MSG._m2w_exit){
    
                // start shut down
                await worker_thread.start_shutdown();
    
                // finish all task, notify main thread worker exit
                parentPort?.postMessage({cmd:_Worker2Main_MSG._w2m_exit});
            }
            else {
                await worker_thread.on_msg("__parent", data);
            }
        }
        catch(_e){
            let err:Error= _e as Error;
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerRoutine tid:${threadId} filename:${workerData.filename} on_msg exception ${err.message}\r\n ${err.stack}`);
        }
    }

    parentPort.on("close", async ()=>{
        await worker_thread.shut_down();
        
        // exit;
        process.exit(0);
    });
    parentPort.on("messageerror", (err)=>{
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_Node_WorkerRoutine tid:${threadId} filename:${workerData.filename} on error ${err.message}\r\n ${err.stack}`);
    });
    parentPort.on("message", on_msg);
    
    // notify main thread woker is started
    parentPort.postMessage({cmd:_Worker2Main_MSG._w2m_started});
}

if(!isMainThread) {
    _Node_WorkerRoutine();
}