// natrium
// license : MIT
// author : Sean Chen

import { nat } from "../../../natrium";
import { _Node_SessionContext } from "../../../_node_implements/_node/_thread_contexts";
import { pos2d } from "../datacomponent/define";
import { player } from "../player";
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
                pos:othpl.pdatas.player_gen.rundata.pos
            });
        })
        _Node_SessionContext.sendWSMsg(pl.session.session_id, "player_enterzone", {infos});

        // notify other player this player enter
        _Node_SessionContext.broadCastMsg(pl.session.session_id, this._player_sessionids, "player_enterzone", {
            infos:[
                {
                    instid:pl.runtimedata.instid, 
                    playerid:pl.pdatas.player_gen.rundata.playerid,
                    pos:pl.pdatas.player_gen.rundata.pos
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
        _Node_SessionContext.broadCastMsg(pl.session.session_id, this._player_sessionids, "player_leavezone", {
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

    public on_player_move():void {

    }

    public on_update():void {
        
    }

    // ------------------------------------------------------------------------

    public player_goto(pl:player, from:pos2d, to:pos2d):void {

        // TO DO : test 3000 player mov at same time
        // TO DO : check position
        pl.pdatas.player_gen.rundata.pos = from;
        pl.runtimedata.moving = {
            from,
            to
        };

        // notify other player this player move
        _Node_SessionContext.broadCastMsg(pl.session.session_id, this._player_sessionids, "player_goto", {
            instid:pl.runtimedata.instid, 
            goto:{
                from,
                to
            }
        });
    }
    public player_stop(pl:player, pos:pos2d):void {
        pl.runtimedata.moving = null;
        pl.pdatas.player_gen.rundata.pos = pos;

        // notify other player this player stop
        _Node_SessionContext.broadCastMsg(pl.session.session_id, this._player_sessionids, "player_stop", {
            instid:pl.runtimedata.instid, 
            pos
        });
    }
}