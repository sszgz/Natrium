// natrium test
// license : MIT
// author : Sean Chen

import { start_server, server } from "./server_init";

let start = async  () => {
    await start_server("");

    server.open_httplistener("", 8080);
    server.open_wslistener(undefined, 4091);
}

start();