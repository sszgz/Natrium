// natrium
// license : MIT
// author : Sean Chen

import https from "https";
import http from "http";
import { debug_level_enum } from "../../interface/debug/debug_logger";

import { httpconnecter } from "../../interface/network/httpconnecter";
import { natrium_nodeimpl } from "../natrium_nodeimpl";

type _http_request_type = (
    url: string | URL,
    options: http.RequestOptions,
    callback?: (res: http.IncomingMessage) => void,
) => http.ClientRequest;

export class httpconnecter_nodeimpl implements httpconnecter {

    protected _httpget:_http_request_type;
    protected _httprequest:_http_request_type;

    constructor(usehttps:boolean){
        if(usehttps){
            this._httpget = https.get;
            this._httprequest = https.request;
        }
        else{
            this._httpget = http.get;
            this._httprequest = http.request;
        }
    }
    
    public get(url:string):Promise<any> {
        return new Promise<any>((resolve, reject)=>{
            const options = {
                method: 'GET'
            };
            let request = this._httpget(url, options, (res)=>{
                if(res.statusCode != 200 && res.statusCode != 201 ){
                    reject(`http get:${url} err with [${res.statusCode}]`);
                    return;
                }

                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('close', () => {
                    resolve(data);
                });
            });

            request.on('error', (err) => {
                reject(`http get:${url} error: ${err.message}`);
            });
        });
    }
    public post(url:string, postdata:any):Promise<any> {
        return new Promise<any>((resolve, reject)=>{

            const options = {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json; charset=UTF-8'
                }
            };
    
            let request = this._httprequest(url, options, (res)=>{
                if(res.statusCode != 200 && res.statusCode != 201){
                    reject(`http post:${url} err with [${res.statusCode}]`);
                    return;
                }

                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('close', () => {
                    try{
                        resolve(JSON.parse(data));
                    }
                    catch(e){
                        let err:Error = e as Error;
                        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `http post:${url} exception:${err.message}\r\n${err.stack}`);
                        reject(`http post:${url} err with:${err.message}`);
                    }
                });
            });

            request.write(JSON.stringify(postdata));
            request.end();

            request.on('error', (err) => {
                reject(`http post:${url} error: ${err.message}`);
            });
        });
    }
}