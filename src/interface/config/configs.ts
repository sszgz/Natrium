// natrium
// license : MIT
// author : Sean Chen

export interface dbconf {
    readonly host:string;
    readonly user:string;
    readonly password:string;
    readonly database:string;
}

export type dbconf_map = {
    [key:string]:dbconf;
}

export interface redisconf {
    readonly url:string;
    readonly username:string;
    readonly password:string;
    readonly name:string;
    readonly database:number;
    readonly persist:boolean;
}

export type redisconf_map = {
    [key:string]:redisconf;
}

export interface listernconf {
    readonly host:string;
    readonly port:number;
}
export interface chainwatcherconf {
    readonly eventcb_listener:listernconf;
    readonly contractjson:string;
}

export interface serviceconf {
    readonly service_name:string;
    readonly service_file:string;
    readonly service_count:number;
    readonly service_msgprocs:string[];
}

export type serviceconf_map = {
    [key:string]:serviceconf;
}

export interface wslistenerconf {

}

export interface httplistenerconf {

}

export interface serverconf {
    readonly db_confs:dbconf_map;
    readonly redis_confs:redisconf_map;
    readonly service_confs:serviceconf_map;
    readonly chainwatcher_confs:chainwatcherconf;
    
    get_db_conf(dbname:string):dbconf|null;
    get_redis_conf(dbname:string):redisconf|null;
    get_services_conf():serviceconf[]|null;
    get_wslistener_conf():wslistenerconf|null;
    get_httplistener_conf():httplistenerconf|null;
}

export interface abiconf {
    readonly deployer: string;
    readonly addr: string;
    readonly abi: string[];
}

export type contractconf_map = {
    [key:string]:abiconf;
}

export interface configs {
    init(svrconfigfile:string):void;
    get_config_data(config_name:string):any;
    get_serverconf():serverconf|null;
}