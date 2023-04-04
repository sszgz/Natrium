// // natrium
// // license : MIT
// // author : Cloud

// import { abiconf, contractconf, contractconf_map } from "../../interface/config/configs";
// import { debug_level_enum } from "../../interface/debug/debug_logger";
// import { natrium_nodeimpl } from "../natrium_nodeimpl";

// export class contractconf_nodeimpl implements contractconf {

//     protected _data:any;

//     protected _contract_confs:any = {};
//     protected _contract_addrs:string[] = [];
//     protected _contract_names:string[] = [];

//     constructor(d:any) {
//         this._data = d;
//     }

//     public get contracts_confs(){
//         return this._data.contracts;
//     }

//     public get contract_confs(){
//         return this._contract_confs;
//     }

//     public format_contract_conf(){
//         for (const key in this._data.contracts) {
//             if (Object.prototype.hasOwnProperty.call(this._data.contracts, key)) {
//                 this._contract_confs[this._data.contracts[key].addr.toLocaleLowerCase()] = this._data.contracts[key].abi
//                 this._contract_names[key] = this._data.contracts[key].addr.toLocaleLowerCase()
//                 this._contract_addrs.push(this._data.contracts[key].addr.toLocaleLowerCase())
//             }
//         }
//     }

//     public get_contract_conf(contract_addr: string):string[]|null {
//         if(!(contract_addr in this._contract_confs)) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `contractconf_nodeimpl get_contract_conf:${contract_addr} not exist`);
//             return null;
//         }
//         return this._contract_confs[contract_addr];
//     }

//     public get_contract_name(contract_name: string):string|null {
//         if(!(contract_name in this._contract_names)) {
//             natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `contractconf_nodeimpl get_contract_name:${contract_name} not exist`);
//             return null;
//         }
//         return this._contract_names[contract_name];
//     }

//     public get_all_contract_conf():contractconf_map|null {
//         return this._contract_confs;
//     }

//     public get_contract_addrs(): string[]|null {
//         return this._contract_addrs;
//     }

//     public get_contract_names(): string[]|null {
//         return this._contract_names;
//     }
// }