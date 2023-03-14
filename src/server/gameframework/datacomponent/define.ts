
// natrium
// license : MIT
// author : Sean Chen

export interface pos2d {
    readonly x:number;
    readonly y:number;
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
    readonly pos?:pos2d;
    readonly speed?:number;
}