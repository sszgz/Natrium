// natrium
// license : MIT
// author : Sean Chen

import http from "http";
import { debug_level_enum } from "../../interface/debug/debug_logger";

import { httplistener, httplistener_handler } from "../../interface/network/httplistener";
import { natrium_nodeimpl } from "../natrium_nodeimpl";

export class httplistener_nodeimpl implements httplistener {
    
    protected _host:string = "";
    protected _port:number = 0;
    protected _handler:httplistener_handler;
    protected _httpserver:http.Server;

    constructor(h:httplistener_handler) {
        this._handler = h;

        let thisptr = this;
        this._httpserver = http.createServer((req,res)=>{
            thisptr._on_req(req, res);
        });
    }

    public get host():string {
        return this._host;
    }
    public get port():number {
        return this._port;
    }
    public get handler():httplistener_handler {
        return this._handler;
    }

    public start(host:string, port:number):boolean {
        this._host = host;
        this._port = port;

        let thisptr = this;
        this._httpserver.on("error", (err:Error)=>{
            thisptr._on_err(err);
        });
        this._httpserver.on("listening", ()=>{
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `httplistener_nodeimpl start listen at:${host}:${port}`);
        });
        this._httpserver.on("upgrade", (req, sock, head)=>{
            // TO DO : on upgrade
        });

        this._httpserver.listen(port, host);

        return true;
    }
    public shutdown():void {
        this._httpserver.close();
    }

    protected _on_err(err:Error):void {
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `httplistener_nodeimpl ${this._host}:${this._port} on error:${err.message}\r\n${err.stack}`);
    }
    
    protected async _read_postdata(request:http.IncomingMessage):Promise<any> {
        if(request.method != 'POST'){
            return undefined;
        }

        return new Promise<any>((resolve, reject)=>{
            let postdata = ''
            request.on('data', function(data) {
                postdata += data;
            })
            request.on('end', function() {
                resolve(postdata);
            });
        });
    }
    protected async _on_req(req:http.IncomingMessage, res:http.ServerResponse):Promise<void> {
        if (req.method != undefined && req.method == "OPTIONS")
        {
            res.writeHead(200, {
                "Access-Control-Allow-Origin":req.headers.origin,
                "Access-Control-Allow-Methods":"POST",
                "Access-Control-Allow-Headers":"accept, content-type",
                "Access-Control-Max-Age":"1728000",
                
            });
            res.end();
            return;
        }

        let nreq = {
            method:req.method,
            url:req.url,
            postdata: await this._read_postdata(req)
        };
        let nres = {
            writeHead:(code:number, head:string|undefined):void => {
                res.writeHead(code, head);
            },
            writeHeader:(code:number, heads:any):void=> {
                res.writeHead(code, heads as http.OutgoingHttpHeaders);
            },
            write:(data:any):void => {
                res.write(data);
            },
            end:():void => {
                res.end();
            }
        }
        
        // for Debug ...
        res.writeHead(201, {
            "Access-Control-Allow-Origin": "*"
        });
        this._handler.on_request(nreq, nres);
    }
}