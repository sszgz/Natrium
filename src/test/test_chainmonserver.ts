// natrium test
// license : MIT
// author : Sean Chen

import * as path from "node:path";
import { chainmonitor_server } from "../blockchain/chainmonitor_server";

export const server:chainmonitor_server = new chainmonitor_server();

export let start_server = async (svrconffile:string) =>{

    await server.startup(svrconffile);

    server.open_httplistener("", 8091);

    server.start_sync_block();
}

start_server("config/blockchain/chainmonitor_server.json");