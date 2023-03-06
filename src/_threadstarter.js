
const path = require('path');
const { workerData } = require('worker_threads');

let initthread = async ()=>{
    require('ts-node').register();
    //await require(path.resolve(__dirname, workerData.filename));
    await require(path.resolve(__dirname, "./_node_implements/_node/_threads.ts"));
}

initthread();