// natrium
// license : MIT
// author : Sean Chen

import { player_changemapbegin, player_changemapend, player_goto, player_manulmine } from "./procs/player_msgs";

export const procs = {
    "goto":player_goto,
    "changemap_begin":player_changemapbegin,
    "changemap_end":player_changemapend,
    "manul_mine":player_manulmine,
}