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

    manul_mine = 201,
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
    player_enter_zone = 10106,
    player_leave_zone = 10107,
    player_stop = 10108,
    player_enterzone = 10109,
    player_leavezone = 10110,

    manul_mine_res = 10201,
}