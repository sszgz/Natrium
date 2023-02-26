// natrium test
// license : MIT
// author : Sean Chen

import { debug_level_enum } from "../../src/interface/debug/debug_logger";
import { wsconnecter_handler } from "../../src/interface/network/wsconnecter";
import { packet } from "../../src/interface/protocol/packet";
import { nat } from "../../src/natrium";


class handler implements wsconnecter_handler {
    on_connected():void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on connected`);

        connecter.shakehand();
    }
    on_shakehand(): void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on shakehand`);

        var myInt = setInterval(function () {
            connecter.ping();
        }, 2000);
    }
    on_disconnected(reason:string):void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on disconnected reason:${reason}`);

    }
    on_packet(p:packet):void {
        nat.dbglog.log(debug_level_enum.dle_debug, `connecter handler on packet packet:${p}`);

    }
}

var h = new handler();
var c = nat.create_packetcodec();

var connecter = nat.create_wsconnecter(h, c);

connecter.connect("ws://127.0.0.1:4090");