// natrium
// license : MIT
// author : Sean Chen

import { wslistener } from "./wslistener";

export class network {

    protected static _wslistener:Array<wslistener> = new Array<wslistener>();

    public static get wslistener_count() {
        return this._wslistener.length;
    }

    public static get def_wslistener():wslistener {
        // for debug
        return this._wslistener[0];
    }
    public static get_wslistener_bycid(cid:number):wslistener {
        // for deubg
        return this._wslistener[0];
    }

    public static get_wslistener(index:number) {
        return this._wslistener[index];
    }

    public static add_wslistener(l:wslistener):void{
        this._wslistener.push(l);
    }

}