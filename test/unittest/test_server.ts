// natrium test
// license : MIT
// author : Sean Chen

import * as path from "node:path";
import { natrium_server } from "../../src/server/natrium_server";
import { protobuf_c2s, protobuf_s2c } from "../../src/server/msgs/protobufmsgs";

const server:natrium_server = new natrium_server();

let start_server = async () =>{

    await server.startup();

    server.wslistener?.pcodec.load_protobufs([
        path.resolve(__dirname, "../../protobuf/s2c_user.proto"),
        path.resolve(__dirname, "../../protobuf/c2s_user.proto"),
    ]);

    // register server msg
    server.wslistener?.pcodec.register_protobuf_msg(protobuf_c2s.login_res, "login_res", "s2c_user.login_res");
    
    // register client msg
    server.wslistener?.pcodec.register_protobuf_msg(protobuf_s2c.login, "login", "c2s_user.login");
    
    server.open_wslistener();
}

start_server();