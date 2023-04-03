// natrium
// license : MIT
// author : Sean Chen

import { datacomp } from "../../../interface/data/datacomp";
import { nat } from "../../../natrium";
import { _Node_SessionContext } from "../../../_node_implements/_node/_thread_contexts";
import { pos2d } from "../datacomponent/define";
import { map_minedatacomp, mine_conf } from "../datacomponent/map_data";
import { pathnode, player } from "../player";
import { gamemap_object } from "./gamemap_object";

export interface map_mine {
    dc:map_minedatacomp;
    conf:mine_conf;
}

export class game_map {

    public static minning_cds:number = 0;

    protected _instid_seed = 1;
    protected _free_instid_list = new Array<number>();
    protected _pid_players = new Map<number, player>();
    protected _player_sessionids = new Array<number>();
    protected _mapconf:any;

    protected _map_mine_datas = new Map<number, map_mine>();

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
    public get portid():number {
        return this._mapconf.portid;
    }

    public init_map(mapconf:any):void {
        this._mapconf = mapconf;

        if(game_map.minning_cds == 0){
            // read from config
            game_map.minning_cds = nat.conf.get_config_data("game").port.minning_cds;
            if(game_map.minning_cds == undefined){
                game_map.minning_cds = 5;
            }
        }
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

        this._update_mine();

        this._pid_players.forEach((pl)=>{
            pl.on_update();
        });
    }
    
    // ------------------------------------------------------------------------
    public get_mine_conf(mineid:number):mine_conf|null {
        // get config
        let minemaps = nat.conf.get_config_data("mine").map;
        if(!(this._mapconf.id.toString() in minemaps)) {
            return null;
        }
        let minemap = minemaps[this._mapconf.id.toString()];
        if(!(mineid.toString() in minemap)){
            return null;
        }
        return minemap[mineid.toString()];
    }
    public async get_mapmine_datacomp(mineid:number, mc:mine_conf):Promise<map_minedatacomp|null> {
        let mapmine:map_mine = this._map_mine_datas.get(mineid);
        if(mapmine != undefined){
            return mapmine.dc;
        }

        let dc = nat.datas.create_redis_datacomp(map_minedatacomp, "world", "mapmine", mineid, true) as map_minedatacomp;
        if(dc == null){
            return null;
        }

        await dc.sync_from_db();
        if(dc.rundata != undefined) {
            this._map_mine_datas.set(mineid, {dc, conf:mc});
            return dc;
        }

        // new map mine data
        dc.mod_rundata({
            mineid:mineid,
            countleft:mc.maxoutputcount,
            recovertms:0,
            lastoutputtms:nat.sys.getTimeStamp()/1000,
            curminingplys:0,
            players:{}
        });
        dc.flush_to_db(true);

        this._map_mine_datas.set(mineid, {dc, conf:mc});
        return dc;
    }

    protected _update_mine():void {
        const curtm_s = nat.sys.getTimeStamp()/1000;
        this._map_mine_datas.forEach(async (mapmine)=>{

            if(mapmine.dc.minedata.curminingplys <= 0){
                // no players
                return;
            }

            // check count
            if(mapmine.dc.minedata.countleft <= 0){
                if(mapmine.dc.minedata.recovertms > curtm_s){
                    return;
                }
                // recover
                mapmine.dc.minedata.countleft = mapmine.conf.maxoutputcount;
            }

            // check update time
            const updateinterval = curtm_s - mapmine.dc.minedata.lastoutputtms;
            if(updateinterval < game_map.minning_cds){
                return;
            }
            mapmine.dc.minedata.lastoutputtms = curtm_s;
            
            // update player minning
            let tormv_ary = new Array<string>();
            for(const k in mapmine.dc.minedata.players){
                const plmine = mapmine.dc.minedata.players[k];

                if(plmine.heronftid == ""){
                    // manul mine
                    let user_sid = await nat.datas.get_user_sessionid(plmine.uid);
                    if(user_sid == undefined){
                        // not online now, kick
                        tormv_ary.push(k);
                    }
                    
                    continue;
                }

                if(plmine.heroactpoint < 1){
                    // no actpoint
                    continue;
                }

                --plmine.heroactpoint;
                ++plmine.unfetchedoutput;

                --mapmine.dc.minedata.countleft;
                if(mapmine.dc.minedata.countleft<=0){
                    mapmine.dc.minedata.countleft=0;
                    mapmine.dc.minedata.recovertms = curtm_s + mapmine.conf.recovertms;
                    break;
                }
            }
            for(let i=0; i<tormv_ary.length; ++i){
                delete mapmine.dc.minedata.players[tormv_ary[i]];
            }
            mapmine.dc.minedata.curminingplys -= tormv_ary.length;

            // write back
            mapmine.dc.flush_to_db(true);
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