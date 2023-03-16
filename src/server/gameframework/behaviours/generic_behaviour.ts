// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../..";
import { debug_level_enum } from "../../../interface/debug/debug_logger";
import { object_util } from "../../../util/object_util";
import { _Node_SessionContext, _Node_ThreadContext } from "../../../_node_implements/_node/_thread_contexts";
import { generic_playerdata } from "../datacomponent/define";
import { player, player_behaviour, player_behaviour_base } from "../player";

export class generic_behaviour extends player_behaviour_base {

    public static readonly beh_name = "generic";
    public static creater(p:player):player_behaviour {
        return new generic_behaviour(p);
    }
    public get name():string {
        return generic_behaviour.beh_name;
    }

    protected _gridsize:number = 32;
    protected _gridtime:number = 0;

    constructor(p:player){
        super(p);
    }
    
    public override async init():Promise<boolean> {

        this._gridsize = nat.conf.get_config_data("game").base.gridsize;

        return true;
    }
    public override async fin():Promise<void> {

    }

    protected _update_mov(gendata:generic_playerdata):void {
        if(this._player.runtimedata.moving == null) {
            return;
        }
        let nextpos = this._player.runtimedata.moving.path.shift();
        if(nextpos == undefined) {
            this._player.runtimedata.moving = null;
            
            // // notify other player this player stop
            // _Node_SessionContext.broadCastMsgWith(this._player.session.session_id, this._player.runtimedata.map.player_sessionids, "player_stop", {
            //     instid:this._player.runtimedata.instid, 
            //     pos:gendata.pos
            // });
            return;
        }
        
        let moving = this._player.runtimedata.moving;
        let gridtime = this._gridsize * 1000 / gendata.speed;

        let currtick = nat.sys.getTickFromAppStart();

        while(moving.lasttm < currtick) {
            let timecost = gridtime * nextpos.cost;
            if(moving.lasttm + timecost <= currtick) {
                
                moving.lasttm += timecost;
                gendata.pos = nextpos;

                console.log(`mov reached [${nextpos.x},${nextpos.y}]`);

                nextpos = this._player.runtimedata.moving.path.shift();
                if(nextpos == undefined) {
                    this._player.runtimedata.moving = null;
                    return;
                }
            }
            else {
                break;
            }
        }
    }

    public override on_update():void {
        let gendata = this._player.pdatas.player_gen.rundata;
        this._update_mov(gendata);
    }
}