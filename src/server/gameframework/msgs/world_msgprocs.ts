// natrium
// license : MIT
// author : Sean Chen

import * as pm from "./procs/player_msgs";

export const procs = {
    "goto":pm.player_goto,
    "stop":pm.player_stop,
    "get_player_sinfo":pm.player_get_player_sinfo,
    "get_player_info":pm.player_get_player_info,
    "changemap_begin":pm.player_changemapbegin,
    "changemap_end":pm.player_changemapend,
    "chat":pm.player_chat,
    "get_hero_info":pm.player_get_hero_info,
    "get_pet_info":pm.player_get_pet_info,
    "get_ship_info":pm.player_get_ship_info,
    "change_avatar":pm.player_change_avatar,
    
    "get_portdata":pm.player_get_portdata,
    
    "get_mineinfo":pm.player_get_mineinfo,
    "start_manulmine":pm.player_start_manulmine,
    "stop_manulmine":pm.player_stop_manulmine,
    "manulmine":pm.player_manulmine,
    "fetch_manulmine_output":pm.player_fetch_manulmine_output,
    "start_heromine":pm.player_start_heromine,
    "stop_heromine":pm.player_stop_heromine,
    "get_heromine_infos":pm.player_get_heromine_infos,
    "fetch_heromine_output":pm.player_fetch_heromine_output,
}