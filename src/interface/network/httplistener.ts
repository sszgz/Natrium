// natrium
// license : MIT
// author : Sean Chen

export type http_request_like = {
    method?:string;
    url?:string;
    postdata?:any;
}

export type http_response_like = {
    writeHead(code:number, head:string | undefined):void;
    writeHeader(code:number, heads:any):void;
    write(data:any):void;
    end():void;
}

export interface httplistener_handler {
    on_request(req:http_request_like, res:http_response_like):void;
}

export interface httplistener {
    readonly host:string;
    readonly port:number;
    readonly handler:httplistener_handler;

    start(host:string, port:number):boolean;
    shutdown():void;
    

}

export type httpmsgproc_type = (req:http_request_like, res:http_response_like) => Promise<void>;
export type httpmsgproc_map_type = {
    [key:string]:httpmsgproc_type
};