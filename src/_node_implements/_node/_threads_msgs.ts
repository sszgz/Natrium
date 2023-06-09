
// natrium
// license : MIT
// author : Sean Chen

export enum _Main2Worker_MSG {
    _m2w_setup_channel = 1,
    _m2w_exit = 2,
}

export enum _Worker2Main_MSG {
    _w2m_create_channel = 1,
    _w2m_exit = 2,
    _w2m_started = 3,
    _w2m_user_data_change = 4,
}


export enum _Service_W2M_MSG {
    // ...
    _w2m_session_msg = 104,
    // ...

    _w2m_changeservice = 108,
    _w2m_changeservice_sesrmved = 109,
    _w2m_kickplayer = 110,
    _w2m_boradcast_session_msg = 111,
}

export enum _Service_M2W_MSG {
    _m2w_add_session = 101,
    _m2w_rmv_session = 102,
    _m2w_close_session = 103,
    _m2w_session_msg = 104,
    //_m2w_rpc_sync = 105,
    _m2w_service_task = 106,
    _m2w_bcast_msg = 107,
    _m2w_session_mod_data = 108,
}