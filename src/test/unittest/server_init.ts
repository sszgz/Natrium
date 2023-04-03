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
    pcodec.register_protobuf_msg(protobuf_s2c.get_hero_info_res, "get_hero_info_res", "s2c_user.get_hero_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_pet_info_res, "get_pet_info_res", "s2c_user.get_pet_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_ship_info_res, "get_ship_info_res", "s2c_user.get_ship_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_change_ava_res, "player_change_ava_res", "s2c_user.player_change_ava_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_change_pet_res, "player_change_pet_res", "s2c_user.player_change_pet_res");
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
    pcodec.register_protobuf_msg(protobuf_s2c.make_factory_product_res, "make_factory_product_res", "s2c_user.make_factory_product_res");
    pcodec.register_protobuf_msg(protobuf_s2c.set_factory_hero_res, "set_factory_hero_res", "s2c_user.set_factory_hero_res");
    pcodec.register_protobuf_msg(protobuf_s2c.unset_factory_hero_res, "unset_factory_hero_res", "s2c_user.unset_factory_hero_res");
    pcodec.register_protobuf_msg(protobuf_s2c.fetch_factory_product_res, "fetch_factory_product_res", "s2c_user.fetch_factory_product_res");
    pcodec.register_protobuf_msg(protobuf_s2c.factory_line_change, "factory_line_change", "s2c_user.factory_line_change");
    pcodec.register_protobuf_msg(protobuf_s2c.shop_put_onsale_res, "shop_put_onsale_res", "s2c_user.shop_put_onsale_res");
    pcodec.register_protobuf_msg(protobuf_s2c.shop_fetch_gold_res, "shop_fetch_gold_res", "s2c_user.shop_fetch_gold_res");
    
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
    pcodec.register_protobuf_msg(protobuf_c2s.change_pet, "change_pet", "c2s_user.change_pet");
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
    pcodec.register_protobuf_msg(protobuf_c2s.make_factory_product, "make_factory_product", "c2s_user.make_factory_product");
    pcodec.register_protobuf_msg(protobuf_c2s.set_factory_hero, "set_factory_hero", "c2s_user.set_factory_hero");
    pcodec.register_protobuf_msg(protobuf_c2s.unset_factory_hero, "unset_factory_hero", "c2s_user.unset_factory_hero");
    pcodec.register_protobuf_msg(protobuf_c2s.fetch_factory_product, "fetch_factory_product", "c2s_user.fetch_factory_product");
    pcodec.register_protobuf_msg(protobuf_c2s.shop_put_onsale, "shop_put_onsale", "c2s_user.shop_put_onsale");
    pcodec.register_protobuf_msg(protobuf_c2s.shop_fetch_gold, "shop_fetch_gold", "c2s_user.shop_fetch_gold");
    pcodec.register_protobuf_msg(protobuf_c2s.gm_get_storehouse_item, "gm_get_storehouse_item", "c2s_user.gm_get_storehouse_item");
}
