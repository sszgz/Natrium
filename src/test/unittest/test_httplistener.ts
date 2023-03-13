// natrium test
// license : MIT
// author : Sean Chen

import { httplistener_handler, http_request_like, http_response_like } from "../../interface/network/httplistener";
import { nat } from "../../natrium";

class http_handler implements httplistener_handler {
    
    on_request(req:http_request_like, res:http_response_like):void {
        switch(req.url){
            case "/verify":
                {
                    res.write(JSON.stringify({
                        res:"OK",
                        data:{
                            "name":"BIG",
                            "uid":"1111",
                            "token":"132-12-BIG"
                        }
                    }));
                    res.end();
                }
                break;
            default:
                {
                    res.write(JSON.stringify({
                        res:"Unknown command"
                    }));
                    res.end();
                }
                break;
        }
    }
}

var h = new http_handler();
var listener = nat.create_httplistener(h);

listener.start("127.0.0.1", 8080);