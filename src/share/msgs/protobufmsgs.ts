// natrium
// license : MIT
// author : Sean Chen

export enum protobuf_c2s {
    login = 1,
    create_player = 2,
    enter_game = 3,

    goto = 101,
    changemap_begin = 102,
    changemap_end = 103,
    get_player_sinfo = 104,
    get_player_info = 105,
    stop = 106,
    chat = 107,
    get_hero_info = 108,
    get_pet_info = 109,
    get_ship_info = 110,
    change_avatar = 111,
    change_pet = 112,
    get_warrant_info = 113,

    get_portdata = 201,

    get_mineinfo = 301,
    start_manulmine = 302,
    stop_manulmine = 303,
    manulmine = 304,
    fetch_manulmine_output = 305,
    start_heromine = 306,
    stop_heromine = 307,
    get_heromine_infos = 308,
    fetch_heromine_output = 309,

    make_factory_product = 401,
    set_factory_hero = 402,
    unset_factory_hero = 403,
    fetch_factory_product = 404,
    
    shop_put_onsale = 501,
    shop_fetch_gold = 502,

    gm_get_storehouse_item = 9001,
}

export enum protobuf_s2c {
    server_error = 10000,
    login_res = 10001,
    create_player_res = 10002,
    enter_game_res = 10003,

    player_goto = 10101,
    changemap_res = 10103,
    get_player_sinfo_res = 10104,
    get_player_info_res = 10105,
    player_enterzone = 10106,
    player_leavezone = 10107,
    player_stop = 10108,
    chat_msg = 10109,
    borad_cast_msg = 10110,
    player_pos_correct = 10111,
    get_hero_info_res = 10112,
    get_pet_info_res = 10113,
    get_ship_info_res = 10114,
    player_change_ava_res = 10115,
    player_change_pet_res = 10116,
    get_warrant_info_res = 10117,

    get_portdata_res = 10201,
    storhouse_change = 10202,
    
    get_mineinfo_res = 10301,
    start_manulmine_res = 10302,
    stop_manulmine_res = 10303,
    manulmine_res = 10304,
    fetch_manulmine_output_res = 10305,
    start_heromine_res = 10306,
    stop_heromine_res = 10307,
    get_heromine_infos_res = 10308,
    fetch_heromine_output_res = 10309,

    make_factory_product_res = 10401,
    set_factory_hero_res = 10402,
    unset_factory_hero_res = 10403,
    fetch_factory_product_res = 10404,
    factory_line_change = 10405,
    
    shop_put_onsale_res = 10501,
    shop_fetch_gold_res = 10502,
}