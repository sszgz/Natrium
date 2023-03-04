// natrium
// license : MIT
// author : Sean Chen

import { wslistener } from "./wslistener";

export class network {

    protected static _wslistener:Array<wslistener> = new Array<wslistener>();

    public static get wslistener_count() {
        return this._wslistener.length;
    }

    public static get_wslistener(index:number) {
        return this._wslistener[index];
    }

    public static add_wslistener(l:wslistener):void{
        this._wslistener.push(l);
    }

}