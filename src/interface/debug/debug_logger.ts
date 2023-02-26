// natrium
// license : MIT
// author : Sean Chen

export enum debug_level_enum {
    dle_error = 1,
    dle_system = 2,
    dle_debug = 3,
    dle_detail = 4
};

export interface debug_logger {
    readonly debug_level:debug_level_enum;

    set_level(l:debug_level_enum):void;
    log(l:debug_level_enum, info:string):void;
    
}