// natrium test
// license : MIT
// author : Sean Chen

import { start_server, server } from "./server_init";

let start = async  () => {
    await start_server("../../../config/clienttest_serverconf.json");
    
    server.open_httplistener("192.168.1.198", 8089);
    server.open_wslistener("192.168.1.198", 4092);
}

start();