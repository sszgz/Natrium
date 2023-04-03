// natrium
// license : MIT
// author : Cloud

import { nat } from "..";
// import axios from "axios";
import { debug_level_enum } from "../interface/debug/debug_logger";

export const get_block_number = async ():Promise<number> => {
    const blockRes = await _requestRPC("eth_blockNumber", [])
    const currBlock = parseInt(blockRes, 16);
    return currBlock;
}

export const get_block_transaction = async (block: number) => {
    const blockNumber = "0x" + block.toString(16);
    return await _requestRPC("eth_getBlockByNumber", [blockNumber, true]);
}

export const get_transaction_receipt = async (hash: string) => {
    const res = await _requestRPC("eth_getTransactionReceipt", [hash]);
    return res
}

export const get_batch_block_transaction = async (blocks: number[]) => {
    let params = []
    for (let i = 0; i < blocks.length; i++) {
        const blockNumber = "0x" + blocks[i].toString(16);
        params.push({jsonrpc: "2.0", method: "eth_getBlockByNumber", params: [blockNumber, true],id: i})
    }
    return await _batchRequestRpc(params)
}

export const get_batch_transaction_receipt = async (hashArr: string[]) => {
    let params = []
    for (let i = 0; i < hashArr.length; i++) {
        params.push({jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [hashArr[i]],id: i})
    }
    return await _batchRequestRpc(params)
}

// async function _requestRPC(method: string, params: any[]) {
//     return await axios
//         .post("https://testchain.dreamidols.app", {
//             jsonrpc: "2.0",
//             method: method,
//             params: params,
//             id: 0,
//         })
//         .then(function (response: any) {
//             nat.dbglog.log(debug_level_enum.dle_detail, `chainmonitor_server request rpc method [${method}] msg [${JSON.stringify(response.data)}]`);
//             return response.data.result;
//         })
//         .catch(function (err: any) {
//             nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server request rpc method [${method}] msg [${err}]`);
//             return null;
//         });
// }

// async function _batchRequestRpc(params:any) {
//     return await axios
//         .post("https://testchain.dreamidols.app", params)
//         .then(function (response: any) {
//             // nat.dbglog.log(debug_level_enum.dle_detail, `chainmonitor_server batch request rpc msg [${JSON.stringify(response.data)}]`);
//             const result = []
//             for (let i = 0; i < response.data.length; i++) {
//                 result.push(response.data[i].result)
//             }
//             return result;
//         })
//         .catch(function (err: any) {
//             nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server batch request rpc msg [${err}]`);
//             return null;
//         });
// }

async function _requestRPC(method: string, params: any[]) {
    var conn = nat.create_httpconnecter(false);
    var url = "https://testchain.dreamidols.app";
    try {
        const response = await conn.post(url, params)
        nat.dbglog.log(debug_level_enum.dle_detail, `chainmonitor_server request rpc method [${method}] msg [${JSON.stringify(response.data)}]`);
        return response.data.result;
    } catch (error) {
        nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server request rpc method [${method}] msg [${error}]`);
        return null;
    }
}

async function _batchRequestRpc(params:any) {
    var conn = nat.create_httpconnecter(false);
    var url = "https://testchain.dreamidols.app";
    try {
        const response = await conn.post(url, params)
        const result = []
        for (let i = 0; i < response.data.length; i++) {
            result.push(response.data[i].result)
        }
        return result;
    } catch (error) {
        nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_server batch request rpc msg [${error}]`);
        return null;
    }
}