// // natrium
// // license : MIT
// // author : Cloud

// import { ethers } from "ethers";
// import { nat } from "..";
// // import axios from "axios";
// import { debug_level_enum } from "../interface/debug/debug_logger";
// import { http_request_like, http_response_like } from "../interface/network/httplistener";

// export const http_unknown_cmd_json = `{"res":"Unknown command"}`;
// export const http_param_err_json = `{"res":"Parameter error"}`;
// export const http_interal_json = `{"res":"Internal error"}`;

// // init config
// nat.conf.init("")

// const rpchost = "https://testchain.dreamidols.app";
// const contractsAbi = nat.conf.get_contractconf();
// const contractNames = contractsAbi.get_contract_names()
// const provider = new ethers.JsonRpcProvider(rpchost, 1000)
// const wallet = new ethers.Wallet("0x19a44758c2b49ada55177e30df7203c0eaa0e022f6b5135a278539500fb56cae", provider)
// const signer = wallet.connect(provider)

// // create map
// const contractMap = new Map<string, ethers.BaseContract>()
// for (const key in contractNames) {
//     if (Object.prototype.hasOwnProperty.call(contractNames, key)) {
//         const contractAddr = contractsAbi.get_contract_name(key)
//         const contractconf = contractsAbi.get_contract_conf(contractAddr)
//         const contract = new ethers.Contract(contractAddr, contractconf, provider).connect(signer)
//         contractMap.set(key, contract)
//     }
// }

// export const on_signature = async (req:http_request_like, res:http_response_like):Promise<void> => {
//     if(req.postdata == undefined){
//         res.write(http_param_err_json);
//         res.end();
//         return;
//     }
//     let postdata = JSON.parse(req.postdata);
//     if(!("action" in postdata)){
//         res.write(http_param_err_json);
//         res.end();
//         return;
//     }

//     let contract: ethers.BaseContract
//     let funcabi
//     let func
//     let args_data
//     switch(postdata.action){
//         case "openMysteryBox":
//             contract = contractMap.get("Random")
//             funcabi = contract.interface.getFunction("fulfillOracleRand");
//             func = "fulfillOracleRand";
//             args_data = [postdata.req_id, nat.sys.random()]
//             break;

//         case "mintMysteryBox":
//             contract = contractMap.get("MysteryBox1155")
//             funcabi = contract.interface.getFunction("balanceOf");
//             func = "balanceOf";
//             args_data = ["0x297952A563d8E68fB676A9202ecD00d6f9c67FFD", "4294967297"]
//             break;
//     }
//     if (contract == null) {
//         nat.dbglog.log(debug_level_enum.dle_error, `chainmonitor_signserver on openMysteryBox exception: contract not exist`);
//     }

//     console.log(`func `, func)
//     let tran
//     try {
//         if (funcabi.stateMutability.includes("view") == true) {
//             tran = await contract[func].send(...args_data);
//         } else {
//             tran = await contract[func].send(...args_data);
//             tran.wait();
//         }
//         console.log(`unsignedTx: `, tran);
//         nat.dbglog.log(debug_level_enum.dle_detail, `chainmonitor_signserver on openMysteryBox success: receipt ${tran}`);
//     } catch (error) {
//         console.log(`send transaction error : ${error}`);
//     }
// }