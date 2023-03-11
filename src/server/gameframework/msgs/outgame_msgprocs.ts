// natrium
// license : MIT
// author : Sean Chen

import { user_createplayer, user_login, user_entergame } from "./procs/user_msgs";

export const procs = {
    "login":user_login,
    "create_player":user_createplayer,
    "enter_game":user_entergame,
}