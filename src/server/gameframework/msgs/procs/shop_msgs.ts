// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../..";
import { service } from "../../../../interface/service/service";
import { servicesession } from "../../../../interface/service/servicesession";
import { _Node_SessionContext } from "../../../../_node_implements/_node/_thread_contexts";
import { ServerErrorCode } from "../../../../share/msgs/msgcode";
import { hero_bind_type, player } from "../../player";
import { worldservice } from "../../../services/worldservice";
import { game_map } from "../../gameobjects/game_map";
import { generic_behaviour } from "../../behaviours/generic_behaviour";
import { factory_line_data, item_data } from "../../datacomponent/define";


export async function shop_put_onsale(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
}
export async function shop_fetch_gold(s:service, ses:servicesession, pl:any, data:any):Promise<void> {
}