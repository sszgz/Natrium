// natrium test
// license : MIT
// author : Sean Chen

import * as path from "node:path";
import { natrium_server } from "../../server/natrium_server";
import { protobuf_c2s, protobuf_s2c } from "../../share/msgs/protobufmsgs";

export const server:natrium_server = new natrium_server();

export let start_server = async (svrconffile:string) =>{

    await server.startup(svrconffile);

    server.wslistener?.pcodec.load_protobufs([
        path.resolve(__dirname, "../../../protobuf/share_structure.proto"),
        path.resolve(__dirname, "../../../protobuf/s2c_user.proto"),
        path.resolve(__dirname, "../../../protobuf/c2s_user.proto"),
    ]);
    
    let pcodec = server.wslistener?.pcodec;
    if(pcodec == undefined){
        console.log("server init failed");
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
    pcodec.register_protobuf_msg(protobuf_s2c.manul_mine_res, "manul_mine_res", "s2c_user.manul_mine_res");
    
    // register client msg
    pcodec.register_protobuf_msg(protobuf_c2s.login, "login", "c2s_user.login");
    pcodec.register_protobuf_msg(protobuf_c2s.create_player, "create_player", "c2s_user.create_player");
    pcodec.register_protobuf_msg(protobuf_c2s.enter_game, "enter_game", "c2s_user.enter_game");
    pcodec.register_protobuf_msg(protobuf_c2s.goto, "goto", "c2s_user.goto");
    pcodec.register_protobuf_msg(protobuf_c2s.stop, "stop", "c2s_user.stop");
    pcodec.register_protobuf_msg(protobuf_c2s.get_player_sinfo, "get_player_sinfo", "c2s_user.get_player_sinfo");
    pcodec.register_protobuf_msg(protobuf_c2s.get_player_info, "get_player_info", "c2s_user.get_player_info");
    pcodec.register_protobuf_msg(protobuf_c2s.changemap_begin, "changemap_begin", "c2s_user.changemap_begin");
    pcodec.register_protobuf_msg(protobuf_c2s.changemap_end, "changemap_end", "c2s_user.changemap_end");
    pcodec.register_protobuf_msg(protobuf_c2s.manul_mine, "manul_mine", "c2s_user.manul_mine");
}
