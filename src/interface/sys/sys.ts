// natrium
// license : MIT
// author : Sean Chen

export interface sys {

    getTimeStamp() : number;

    getTickFromAppStart() : number;

    random(): number;

    random_between(s:number, e:number, floating:boolean): number;
}