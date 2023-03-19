// natrium
// license : MIT
// author : Sean Chen

export type numberish = string | number;

export interface calldata_like {
    readonly method:string;
    readonly params:Array<string>;
}

export interface chainlog_like {
    readonly event:string;
    readonly params:Array<string>;
}

export interface transaction_like {
    readonly hash:string;
    readonly blocknumber:number;
    readonly from:string;
    readonly to:string;
    readonly value:numberish;
    readonly calldata?:calldata_like;
    readonly logs:Array<chainlog_like>
}

export interface chainmonitor {
    readonly chainId:number;
    readonly chainType:string;
    readonly rpchost:string;

    on(event:string, cb: (this:chainmonitor, ...args) => void);
    off(event:string, cb: (this:chainmonitor, ...args) => void);

    register_event_monitor(chainId:number, contract_addr:string, event:string);

    get_transaction_byhash(hash:string):Promise<transaction_like>;
}