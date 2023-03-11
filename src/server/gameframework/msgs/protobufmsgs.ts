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

    manul_mine = 201,
}

export enum protobuf_s2c {
    login_res = 10001,
    create_player_res = 10002,
    enter_game_res = 10003,

    player_goto = 10101,
    changemap_res = 10103,

    manul_mine_res = 10201,
}