// natrium test
// license : MIT
// author : Sean Chen

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { nat } from "../../natrium";

var conn = nat.create_httpconnecter(false);
var url = "http://127.0.0.1:8080";

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
            case "verify":
                {
                    let obj = {
                        "wallet_addr":"0xf226BeA06598b39f1508c6702900845928122B03",
                        "signdata":"dddadfasdfasdfasdfadsfs"
                    };
                    
                    let verify_res = await conn.post(url+"/verify", obj);

                    console.log("verify res:\r\n"+JSON.stringify(verify_res));
                }
                break;
            default:
                console.log("unknown command!");

                break;
        }
    }
}

testcmd();