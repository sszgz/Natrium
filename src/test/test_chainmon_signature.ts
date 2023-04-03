// natrium test
// license : MIT
// author : Cloud

import * as path from "node:path";
import { chainmonitor_signserver } from "../blockchain/chainmonitor_signserver";

export const server:chainmonitor_signserver = new chainmonitor_signserver();

export let start_server = async (svrconffile:string) =>{

    await server.startup(svrconffile);

    server.open_httplistener("", 8091);
}

start_server("");