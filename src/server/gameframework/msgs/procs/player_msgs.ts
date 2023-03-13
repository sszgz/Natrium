// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../..";
import { service } from "../../../../interface/service/service";
import { servicesession } from "../../../../interface/service/servicesession";
import { _Node_SessionContext } from "../../../../_node_implements/_node/_thread_contexts";
import { outgameservice } from "../../../services/outgameservice";
import { ServerErrorCode } from "../../../../share/msgs/msgcode";
import { player } from "../../player";


export async function player_goto(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        return;
    }

    if((pl as player).runtimedata.map == null){
        return;
    }

    (pl as player).runtimedata.map?.player_goto(pl, data.from, data.to);
}
export async function player_stop(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
    if(pl == null){
        return;
    }

    if((pl as player).runtimedata.map == null){
        return;
    }

    (pl as player).runtimedata.map?.player_stop(pl, data.pos);
}
export async function player_changemapbegin(s:service, ses:servicesession, pl:any, data:any):Promise<void> {

}
export async function player_changemapend(s:service, ses:servicesession, pl:any, data:any):Promise<void> {

}
export async function player_manulmine(s:service, ses:servicesession, pl:any, data:any):Promise<void> {

}