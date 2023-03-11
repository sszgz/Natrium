// natrium test
// license : MIT
// author : Sean Chen

import * as path from "node:path";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { protobuf_c2s, protobuf_s2c } from "../../src/server/msgs/protobufmsgs";
import { natrium_client } from "../../src/client/natrium_client";
import { packet, prototype } from "../../src/interface/protocol/packet";

const client:natrium_client = new natrium_client();

let start_client = async () =>{

    await client.init();

    client.connecter?.pcodec.load_protobufs([
        path.resolve(__dirname, "../../protobuf/s2c_user.proto"),
        path.resolve(__dirname, "../../protobuf/c2s_user.proto"),
    ]);

    // register server msg
    client.connecter?.pcodec.register_protobuf_msg(protobuf_c2s.login_res, "login_res", "s2c_user.login_res");
    
    // register client msg
    client.connecter?.pcodec.register_protobuf_msg(protobuf_s2c.login, "login", "c2s_user.login");
    
    client.on("connected", ()=>{
        // on connect, wait shakehand
    });
    client.on("shakehand", ()=>{
        // on shakehand, connection established
        
        testcmd();
    });
    client.on("disconnected", (reason:string)=>{

    });
    client.on("onmsg", (p:packet)=>{
        // on msg
        if(p.prototp == prototype.proto_json || p.prototp == prototype.proto_grpc){
            console.log(JSON.stringify(p.data));
        }

    });

    client.connect("ws://127.0.0.1:4091");
}

start_client();

var testcmd = async ()=>{
    if(client.connecter == null) {
        console.log("Client not initialized");
        return;
    }
    const rl = readline.createInterface({ input, output });
    console.log("Enter test cmd:");
    while(true){
        let cmd = await rl.question("");
        let cmds = cmd?.split(" ");
        
        if(cmds == undefined){
            continue;
        }
    
        switch(cmds[0]){
            case "exit":
                    process.exit(1);
                break;
            case "login":
                {
                    let obj = {
                        c:"login",
                        d:{
                            "name":"BIG",
                            "uid":"1111",
                            "token":"132-12-BIG"
                        }
                    };
    
                    let pkt = client.connecter.pcodec.create_jsonpkt(obj);
                    client.connecter.send_packet(pkt);
                }
                break;
            default:
                console.log("unknown command!");

                break;
        }
    }
}

