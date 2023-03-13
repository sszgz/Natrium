// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../..";
import { dataobject } from "../../../interface/data/dataobj";
import { debug_level_enum } from "../../../interface/debug/debug_logger";
import { object_util } from "../../../util/object_util";
import { player, player_behaviour, player_behaviour_base } from "../player";

export class generic_behaviour extends player_behaviour_base {

    public static readonly beh_name = "generic";
    public static creater(p:player):player_behaviour {
        return new generic_behaviour(p);
    }
    public get name():string {
        return generic_behaviour.beh_name;
    }

    constructor(p:player){
        super(p);
    }
    
    public override async init():Promise<boolean> {

        return true;
    }
    public override async fin():Promise<void> {

    }

}