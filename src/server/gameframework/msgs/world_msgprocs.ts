// natrium
// license : MIT
// author : Sean Chen

import { player_changemapbegin, player_changemapend, player_chat, player_get_player_info, player_get_player_sinfo, player_goto, player_manulmine, player_stop } from "./procs/player_msgs";

export const procs = {
    "goto":player_goto,
    "stop":player_stop,
    "get_player_sinfo":player_get_player_sinfo,
    "get_player_info":player_get_player_info,
    "changemap_begin":player_changemapbegin,
    "changemap_end":player_changemapend,
    "chat":player_chat,
    "manul_mine":player_manulmine,
}