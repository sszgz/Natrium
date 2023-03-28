// natrium test
// license : MIT
// author : Sean Chen

import { start_server, server } from "./unittest/server_init";

let start = async  () => {
    await start_server("../../../config/clienttest_serverconf.json");
    
    server.open_httplistener("", 8089);
    server.open_wslistener(undefined, 4092);
}

start();