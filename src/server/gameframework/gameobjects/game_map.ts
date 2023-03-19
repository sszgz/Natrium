// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../natrium";
import { _Node_SessionContext } from "../../../_node_implements/_node/_thread_contexts";
import { pos2d } from "../datacomponent/define";
import { pathnode, player } from "../player";
import { gamemap_object } from "./gamemap_object";

export class game_map {

    protected _instid_seed = 1;
    protected _free_instid_list = new Array<number>();
    protected _pid_players = new Map<number, player>();
    protected _player_sessionids = new Array<number>();
    protected _mapconf:any;

    public static random_bornpos(bornsrc:any):pos2d {
        let xadd = (nat.sys.random() % (2*bornsrc.radius)) - bornsrc.radius;
        let yadd = (nat.sys.random() % (2*bornsrc.radius)) - bornsrc.radius;
        return {x:bornsrc.x+xadd, y:bornsrc.y+yadd};
    }

    public get pid_players(){
        return this._pid_players;
    }
    public get mapconf(){
        return this._mapconf;
    }
    public get player_sessionids() {
        return this._player_sessionids;
    }

    public init_map(mapconf:any):void {
        this._mapconf = mapconf;
    }

    public get_random_bornpos():pos2d {
        if(this._mapconf.bornpos == undefined || this._mapconf.bornpos.length == 0){
            return {x:0, y:0};
        }
        let index = nat.sys.random() % this._mapconf.bornpos.length;
        return game_map.random_bornpos(this._mapconf.bornpos[index]);
    }
    public get_instid():number {
        let instid = this._free_instid_list.pop();
        if(instid == undefined){
            instid = this._instid_seed;
            ++this._instid_seed;
        }

        return instid;
    }

    public add_player(pl:player):void {
        
        pl.runtimedata.map = this;
        pl.runtimedata.instid = this.get_instid();

        // add player
        this._pid_players.set(pl.pdatas.player_gen.rundata.playerid, pl);
        this._player_sessionids.push(pl.session.session_id);

        if(!("pos" in pl.pdatas.player_gen.rundata)) {
            // new player, born
            pl.pdatas.player_gen.rundata.pos = this.get_random_bornpos();
        }

        // notify change map
        _Node_SessionContext.sendWSMsg(pl.session.session_id, "changemap_res", {
            tomapid:this._mapconf.id,
            selfInstid:pl.runtimedata.instid, 
            pos:pl.pdatas.player_gen.rundata.pos
        });

        // TO DO : cut in zone player by range and number limit

        // notify this player other player enter
        let infos = new Array<any>();
        this._pid_players.forEach((othpl)=>{
            if(othpl.runtimedata.instid == pl.runtimedata.instid){
                return;
            }
            infos.push({
                instid:othpl.runtimedata.instid, 
                playerid:othpl.pdatas.player_gen.rundata.playerid,
                ver:othpl.runtimedata.ver,
                pos:othpl.pdatas.player_gen.rundata.pos,
                goto:othpl.runtimedata.moving
            });
        })
        _Node_SessionContext.sendWSMsg(pl.session.session_id, "player_enterzone", {infos});

        // notify other player this player enter
        _Node_SessionContext.broadCastMsgWith(pl.session.session_id, this._player_sessionids, "player_enterzone", {
            infos:[
                {
                    instid:pl.runtimedata.instid, 
                    playerid:pl.pdatas.player_gen.rundata.playerid,
                    ver:pl.runtimedata.ver,
                    pos:pl.pdatas.player_gen.rundata.pos,
                    goto:pl.runtimedata.moving
                }
            ]
        });
    }
    public rmv_player(pl:player):void {
        pl.runtimedata.map = null;

        if(pl.runtimedata.instid > 0){
            // reuse instid
            this._free_instid_list.push(pl.runtimedata.instid);
        }

        // remove player
        this._pid_players.delete(pl.pdatas.player_gen.rundata.playerid);
        let idx = this._player_sessionids.indexOf(pl.session.session_id);
        if(idx >= 0){
            this._player_sessionids.splice(idx, 1);
        }
        
        // notify other player this player leave
        _Node_SessionContext.broadCastMsgWith(pl.session.session_id, this._player_sessionids, "player_leavezone", {
            instids:[pl.runtimedata.instid]
        });
        
    }

    public add_mapobject(o:gamemap_object):void {
        
    }
    public rmv_mapobject(o:gamemap_object):void {

    }

    public get_player_byinstid(instid:number):player|undefined {
        return undefined;
    }
    public get_player_bysid(sid:number):player|undefined {
        return undefined;
    }
    public get_player_bypid(playerid:number):player|undefined {
        return this._pid_players.get(playerid);
    }

    public get_mapobject_byinstid(instid:number):gamemap_object|undefined {
        return undefined;
    }

    public on_update():void {
        this._pid_players.forEach((pl)=>{
            pl.on_update();
        });
    }

    // ------------------------------------------------------------------------

    public get_player_nearby_sids(pl:player, width:number, height:number):Array<number> {
        let cid_ary = new Array<number>();
        this._pid_players.forEach((othpl)=>{
            if(othpl == pl){
                return;
            }
            if(othpl.pdatas.player_gen.rundata.pos == undefined){
                return;
            }
            if(Math.abs(othpl.pdatas.player_gen.rundata.pos.x - pl.pdatas.player_gen.rundata.pos.x) > width) {
                return;
            }
            if(Math.abs(othpl.pdatas.player_gen.rundata.pos.y - pl.pdatas.player_gen.rundata.pos.y) > height) {
                return;
            }

            cid_ary.push(othpl.session.session_id);
        });

        return cid_ary;
    }

    public is_npc_nearby(pl:player, npc_name:string):Boolean {
        // TO DO : check npc position
        return true;
    }

    public is_player_nearby(pl:player, pos:pos2d, radius:number):boolean {
        
        if(Math.abs(pos.x - pl.pdatas.player_gen.rundata.pos.x) > radius) {
            return false;
        }
        if(Math.abs(pos.y - pl.pdatas.player_gen.rundata.pos.y) > radius) {
            return false;
        }

        return true;
    }
}