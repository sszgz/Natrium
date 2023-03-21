
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

export interface hero_data {
    readonly mintType:number;
    readonly job:number;
    readonly grade:number;
    readonly mineAttr:number;
    readonly battleAttr:number;
    readonly bindFinTms:number;
    readonly bindType:string;
    readonly heronftid:string;
}
export interface hero_playerdata {
    readonly heros:Array<hero_data>
}

export interface pet_data {
    readonly mintType:number;
    readonly petId:number;
    readonly avatarSlots:Array<number>;
    readonly mineAttr:number;
    readonly battleAttr:number;
    readonly bindFinTms:number;
    readonly bindType:string;
    readonly heronftid:string;
}
export interface pet_playerdata {
    readonly pets:Array<pet_data>
}

export interface ship_data {
}
export interface ship_playerdata {
    readonly ships:Array<ship_data>
}

export interface item_data {
    readonly itemid:number;
    count:number;
}

export interface minning_data {
    readonly mineid:number;
    readonly startminetms:number;
    readonly unfetchedoutput:number;
}
export interface storehouse_data {
    readonly level:number;
    readonly maxrepoload:number;
    readonly curload:number;
    readonly items:{[key:number]:number}; // itemid=>count
}
export interface port_data {
    readonly portid:number;
    readonly storehouse:storehouse_data;
}
export interface port_playerdata {
    readonly ports:Array<port_data>
}