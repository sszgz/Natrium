
// natrium
// license : MIT
// author : Sean Chen

export interface pos2d {
    x:number;
    y:number;
}

export interface user_basedata {
    wallet:string;
    name:string;
    uid:string;
    token:string;
    lastlogintm:number;
}

export interface session_basedata {
    readonly name:string; 
    readonly uid:string;
    readonly token:string;
    readonly firstin:boolean;
}

export interface generic_playerdata {
    readonly playerid:number;
    readonly mapid:number;
    readonly heroava:number;
    readonly gender:number;
    readonly pname:number;
    readonly speed?:number;
    pos?:pos2d;
}