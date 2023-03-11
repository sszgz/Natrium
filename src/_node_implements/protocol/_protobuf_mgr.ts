// natrium
// license : MIT
// author : Sean Chen

import * as protobuf from "protobufjs";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";

export class _protobuf_mgr {

    protected static _msgs:msg_map = {};
    protected static _msgid2cmd:msg_id2name = {};
    protected static _msgcmd2id:msg_name2id = {};
    protected static _root:protobuf.Root;
    
    public static get msgs() {
        return this._msgs;
    }

    public static get_msgid_bycmd(cmd:string):number {
        return this._msgcmd2id[cmd];
    }

    public static get_msgcmd_byid(msgid:number):string {
        return this._msgid2cmd[msgid];
    }

    public static loadProtobufFiles(filenames:string[]) {
        this._root = protobuf.loadSync(filenames);
    }

    // msgid not bigger than 65535, in 2byte
    public static registerMsg(msgid:number, msgcmd:string, path:string):void {
        if(msgcmd in this._msgs) {
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `registerMsg msgcmd[${msgcmd}] with msgid[${msgid}] already exist`);
            return;
        }

        if(msgid in this._msgid2cmd){
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `registerMsg msgid[${msgid}] with msgcmd[${msgcmd}] already exist`);
            return;
        }

        const msg = this._root.lookupType(path);
        this._msgs[msgcmd] = msg;
        this._msgid2cmd[msgid] = msgcmd;
        this._msgcmd2id[msgcmd] = msgid;
    }
}

type msg_map = {
    [key:string]:protobuf.Type
}
type msg_name2id = {
    [key:string]:number
}
type msg_id2name = {
    [key:number]:string
}