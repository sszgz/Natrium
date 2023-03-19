// natrium test
// license : MIT
// author : Sean Chen

import * as path from "node:path";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { protobuf_c2s, protobuf_s2c } from "../../share/msgs/protobufmsgs";
import { natrium_client } from "../../client/natrium_client";
import { packet, prototype } from "../../interface/protocol/packet";

const client:natrium_client = new natrium_client();

let start_client = async () =>{

    await client.init();

    client.connecter?.pcodec.load_protobufs([
        path.resolve(__dirname, "../../../protobuf/share_structure.proto"),
        path.resolve(__dirname, "../../../protobuf/s2c_user.proto"),
        path.resolve(__dirname, "../../../protobuf/c2s_user.proto"),
    ]);

    let pcodec = client.connecter?.pcodec;
    if(pcodec == undefined){
        console.log("client init failed");
        return;
    }

    // register server msg
    pcodec.register_protobuf_msg(protobuf_s2c.server_error, "server_error", "s2c_user.server_error");
    pcodec.register_protobuf_msg(protobuf_s2c.login_res, "login_res", "s2c_user.login_res");
    pcodec.register_protobuf_msg(protobuf_s2c.create_player_res, "create_player_res", "s2c_user.create_player_res");
    pcodec.register_protobuf_msg(protobuf_s2c.enter_game_res, "enter_game_res", "s2c_user.enter_game_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_stop, "player_stop", "s2c_user.player_stop");
    pcodec.register_protobuf_msg(protobuf_s2c.player_enterzone, "player_enterzone", "s2c_user.player_enterzone");
    pcodec.register_protobuf_msg(protobuf_s2c.player_leavezone, "player_leavezone", "s2c_user.player_leavezone");
    pcodec.register_protobuf_msg(protobuf_s2c.changemap_res, "changemap_res", "s2c_user.changemap_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_goto, "player_goto", "s2c_user.player_goto");
    pcodec.register_protobuf_msg(protobuf_s2c.get_player_sinfo_res, "get_player_sinfo_res", "s2c_user.get_player_sinfo_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_player_info_res, "get_player_info_res", "s2c_user.get_player_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_hero_info_res, "get_hero_info_res", "s2c_user.get_hero_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_pet_info_res, "get_pet_info_res", "s2c_user.get_pet_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_ship_info_res, "get_ship_info_res", "s2c_user.get_ship_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_change_ava_res, "player_change_ava_res", "s2c_user.player_change_ava_res");
    pcodec.register_protobuf_msg(protobuf_s2c.chat_msg, "chat_msg", "s2c_user.chat_msg");
    pcodec.register_protobuf_msg(protobuf_s2c.borad_cast_msg, "borad_cast_msg", "s2c_user.borad_cast_msg");
    pcodec.register_protobuf_msg(protobuf_s2c.player_pos_correct, "player_pos_correct", "s2c_user.player_pos_correct");
    pcodec.register_protobuf_msg(protobuf_s2c.get_portdata_res, "get_portdata_res", "s2c_user.get_portdata_res");
    pcodec.register_protobuf_msg(protobuf_s2c.storhouse_change, "storhouse_change", "s2c_user.storhouse_change");
    pcodec.register_protobuf_msg(protobuf_s2c.get_mineinfo_res, "get_mineinfo_res", "s2c_user.get_mineinfo_res");
    pcodec.register_protobuf_msg(protobuf_s2c.start_manulmine_res, "start_manulmine_res", "s2c_user.start_manulmine_res");
    pcodec.register_protobuf_msg(protobuf_s2c.stop_manulmine_res, "stop_manulmine_res", "s2c_user.stop_manulmine_res");
    pcodec.register_protobuf_msg(protobuf_s2c.manulmine_res, "manulmine_res", "s2c_user.manulmine_res");
    pcodec.register_protobuf_msg(protobuf_s2c.fetch_manulmine_output_res, "fetch_manulmine_output_res", "s2c_user.fetch_manulmine_output_res");
    pcodec.register_protobuf_msg(protobuf_s2c.start_heromine_res, "start_heromine_res", "s2c_user.start_heromine_res");
    pcodec.register_protobuf_msg(protobuf_s2c.stop_heromine_res, "stop_heromine_res", "s2c_user.stop_heromine_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_heromine_infos_res, "get_heromine_infos_res", "s2c_user.get_heromine_infos_res");
    pcodec.register_protobuf_msg(protobuf_s2c.fetch_heromine_output_res, "fetch_heromine_output_res", "s2c_user.fetch_heromine_output_res");
    
    // register client msg
    pcodec.register_protobuf_msg(protobuf_c2s.login, "login", "c2s_user.login");
    pcodec.register_protobuf_msg(protobuf_c2s.create_player, "create_player", "c2s_user.create_player");
    pcodec.register_protobuf_msg(protobuf_c2s.enter_game, "enter_game", "c2s_user.enter_game");
    pcodec.register_protobuf_msg(protobuf_c2s.goto, "goto", "c2s_user.goto");
    pcodec.register_protobuf_msg(protobuf_c2s.stop, "stop", "c2s_user.stop");
    pcodec.register_protobuf_msg(protobuf_c2s.changemap_begin, "changemap_begin", "c2s_user.changemap_begin");
    pcodec.register_protobuf_msg(protobuf_c2s.changemap_end, "changemap_end", "c2s_user.changemap_end");
    pcodec.register_protobuf_msg(protobuf_c2s.get_player_sinfo, "get_player_sinfo", "c2s_user.get_player_sinfo");
    pcodec.register_protobuf_msg(protobuf_c2s.get_player_info, "get_player_info", "c2s_user.get_player_info");
    pcodec.register_protobuf_msg(protobuf_c2s.get_hero_info, "get_hero_info", "c2s_user.get_hero_info");
    pcodec.register_protobuf_msg(protobuf_c2s.get_pet_info, "get_pet_info", "c2s_user.get_pet_info");
    pcodec.register_protobuf_msg(protobuf_c2s.get_ship_info, "get_ship_info", "c2s_user.get_ship_info");
    pcodec.register_protobuf_msg(protobuf_c2s.change_avatar, "change_avatar", "c2s_user.change_avatar");
    pcodec.register_protobuf_msg(protobuf_c2s.chat, "chat", "c2s_user.chat");
    pcodec.register_protobuf_msg(protobuf_c2s.get_portdata, "get_portdata", "c2s_user.get_portdata");
    pcodec.register_protobuf_msg(protobuf_c2s.get_mineinfo, "get_mineinfo", "c2s_user.get_mineinfo");
    pcodec.register_protobuf_msg(protobuf_c2s.start_manulmine, "start_manulmine", "c2s_user.start_manulmine");
    pcodec.register_protobuf_msg(protobuf_c2s.stop_manulmine, "stop_manulmine", "c2s_user.stop_manulmine");
    pcodec.register_protobuf_msg(protobuf_c2s.manulmine, "manulmine", "c2s_user.manulmine");
    pcodec.register_protobuf_msg(protobuf_c2s.fetch_manulmine_output, "fetch_manulmine_output", "c2s_user.fetch_manulmine_output");
    pcodec.register_protobuf_msg(protobuf_c2s.start_heromine, "start_heromine", "c2s_user.start_heromine");
    pcodec.register_protobuf_msg(protobuf_c2s.stop_heromine, "stop_heromine", "c2s_user.stop_heromine");
    pcodec.register_protobuf_msg(protobuf_c2s.get_heromine_infos, "get_heromine_infos", "c2s_user.get_heromine_infos");
    pcodec.register_protobuf_msg(protobuf_c2s.fetch_heromine_output, "fetch_heromine_output", "c2s_user.fetch_heromine_output");
    
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
                            "name": "",
                            // "uid": "2",
                            // "token": "b79ba618-1678880290643-2",
                            "uid": "3",
                            "token": "267ba1a4-1678979779149-3",
                            // "uid": "4",
                            // "token": "ec3e1df1-1678966035165-4",
                        }
                    };
    
                    //let pkt = client.connecter.pcodec.create_jsonpkt(obj);
                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "create_player":
                {
                    let obj = {
                        c:"create_player",
                        d:{
                            "pname":"eedd",
                            "gender":1
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "enter_game":
                {
                    let obj = {
                        c:"enter_game",
                        d:{

                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "goto":
                {
                    let obj = {
                        c:"goto",
                        d:{
                            goto:{
                                path:[
                                    {
                                        x:11,
                                        y:11,
                                    },
                                    {
                                        x:22,
                                        y:23
                                    }
                                ]
                            }
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "stop":
                {
                    let obj = {
                        c:"stop",
                        d:{
                            pos:{
                                x:200,
                                y:200
                            }
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "get_psinfo":
                {
                    let obj = {
                        c:"get_player_sinfo",
                        d:{
                            playerids:[2,3]
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "get_pinfo":
                {
                    let obj = {
                        c:"get_player_info",
                        d:{
                            playerids:[2,3]
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;

            case "get_hinfo":
                {
                    let obj = {
                        c:"get_hero_info",
                        d:{
                            playerid:cmds[1]
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "get_peinfo":
                {
                    let obj = {
                        c:"get_pet_info",
                        d:{
                            playerid:cmds[1]
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "get_shinfo":
                {
                    let obj = {
                        c:"get_ship_info",
                        d:{
                            playerid:cmds[1]
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "change_ava":
                {
                    let obj = {
                        c:"change_avatar",
                        d:{
                            heronftid:"1111111",
                            heroava:cmds[1]
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "get_portd":
                {
                    let obj = {
                        c:"get_portdata",
                        d:{
                            portid:1
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;

            case "changemap_end":
                {
                    let obj = {
                        c:"changemap_end",
                        d:{
                            tomapid:cmds[1]
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            case "chat":
                {
                    let obj = {
                        c:"chat",
                        d:{
                            channel:cmds[1],
                            msg:cmds[2]
                        }
                    };

                    let pkt = client.connecter.pcodec.create_protopkt(obj.c, obj.d);
                    client.connecter.send_packet(pkt);
                }
                break;
            default:
                console.log("unknown command!");

                break;
        }
    }
}

