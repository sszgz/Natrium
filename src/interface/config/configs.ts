// natrium
// license : MIT
// author : Sean Chen

export interface dbconf {
    readonly host:string;
    readonly user:string;
    readonly password:string;
    readonly database:string;
}

export interface redisconf {
    readonly url:string;
    readonly username:string;
    readonly password:string;
    readonly name:string;
    readonly database:number;
}

export interface serviceconf {
    readonly service_name:string;
    readonly service_file:string;
}

export interface wslistenerconf {

}

export interface httplistenerconf {

}

export interface serverconf {
    get_db_conf(dbname:string):dbconf|null;
    get_redis_conf(dbname:string):redisconf|null;
    get_services_conf():serviceconf[]|null;
    get_wslistener_conf():wslistenerconf|null;
    get_httplistener_conf():httplistenerconf|null;
}

export interface configs {
    init():void;
    get_config_data(config_name:string):any;
    get_serverconf():serverconf|null;
}