// natrium test
// license : MIT
// author : Sean Chen

import { start_server, server } from "./server_init";

let start = async  () => {
    await start_server("");

    server.open_httplistener("127.0.0.1", 8080);
    server.open_wslistener("127.0.0.1", 4091);
}

start();