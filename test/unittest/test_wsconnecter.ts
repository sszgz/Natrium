// natrium test
// license : MIT
// author : Sean Chen
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { debug_level_enum } from "../../src/interface/debug/debug_logger";
import { wsconnecter_handler } from "../../src/interface/network/wsconnecter";
import { packet, prototype } from "../../src/interface/protocol/packet";
import { nat } from "../../src/natrium";


class handler implements wsconnecter_handler {
    on_connected():void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on connected`);

        connecter.shakehand();
    }
    on_shakehand(): void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on shakehand`);

        var myInt = setInterval(function () {
            connecter.ping();
        }, 2000);

        testcmd();
    }
    on_disconnected(reason:string):void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on disconnected reason:${reason}`);

    }
    on_packet(p:packet):void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on packet packet:${p.data}`);

        if(p.prototp == prototype.proto_json){
            console.log(JSON.stringify(p.data));
        }
    }
}

var h = new handler();
var c = nat.create_packetcodec();

var connecter = nat.create_wsconnecter(h, c);

connecter.connect("ws://127.0.0.1:4091");

var testcmd = async ()=>{
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
            case "sendt":
                {
                    let pkt = connecter.pcodec.create_stringpkt(cmds[1]);
                    connecter.send_packet(pkt);
                }
                break;
            case "sendj1":
                {
                    let obj = {
                        testobj:{
                            testobj1:{
                                testa:"a",
                                testc:"阿萨德法师法",
                                testary:[10,10.011,0xff,433,"fdf",{
                                    ccc:"dddfs",
                                    bbb:"0123456789012345678901234567890123456789",
                                }]
                            },
                            fff:{
                                eedd:true,
                                xx:0.000000001,
                                ff:0xffffffffffffffff
                            }
                        },
                        "ddf":{ddd:1},
                        "大师":[1,2,3,4,5,6,7,8,9]
                    };
    
                    let pkt = connecter.pcodec.create_jsonpkt(obj);
                    connecter.send_packet(pkt);
                }
                break;
            case "sendj2":
                {
                    let obj = {
                        testobj:{
                            testobj1:{
                                testa:"a",
                                testc:"阿萨德法师法",
                                testary:[10,10.011,0xff,433,"fdf",{
                                    ccc:"dddfs",
                                    bbb:"0123456789012345678901234567890123456789",
                                }]
                            },
                            fff:{
                                eedd:true,
                                xx:0.000000001,
                                ff:0xffffffffffffffff
                            }
                        },
                        "ddf":{ddd:1},
                        "大师":[1,2,3,4,5,6,7,8,9],
                        "hugetext":"要说童瑶最出名的事情，那一定是大学时期被张默一事。要说童瑶有什么优秀的作品，似乎一时之间也说不出来。"+
                        "最近两年，童瑶频频出现在影视作品中，似乎有一种要崛起的架势。"+
                        "而且童瑶也因为出演《三十而已》中的顾佳一角获得了多个最佳女主角，童瑶出道这么多年终于也成为了影后。"+
                        "但是从《三十而已》开始，童瑶出演的角色开始固化，她自己的演技也开始出现模板化，最直观的表现就是她饰演的所有角色都有顾佳的影子。"+
                        `{"testobj":{"testobj1":{"testa":"a","testc":"阿萨德法师法","testary":[10,10.011,255,433,"fdf",{"ccc":"dddfs","bbb":"0123456789012345678901234567890123456789"}]},"fff":{"eedd":true,"xx":1e-9,"ff":18446744073709552000}},"ddf":{"ddd":1},"大师":[1,2,3,4,5,6,7,8,9],"hugetext":"要说童瑶最出名的事情，那一定是大学时期被张默一事。要说童瑶有什么优秀的作品 
                        ，似乎一时之间也说不出来。最近两年，童瑶频频出现在影视作品中，似乎有一种要崛起的架势。而且童瑶也因为出演《三十而已》中的顾佳一角获得了多个最佳女主角，童瑶出道这么多年终于也成
                        为了影后。但是从《三十而已》开始，童瑶出演的角色开始固化，她自己的演技也开始出现模板化，最直观的表现就是她饰演的所有角色都有顾佳的影子。"}`
                    };
    
                    let pkt = connecter.pcodec.create_jsonpkt(obj);
                    connecter.send_packet(pkt);
                }
                break;
            default:
                console.log("unknown command!");

                break;
        }
    }
}

