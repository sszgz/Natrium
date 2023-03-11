// natrium
// license : MIT
// author : Sean Chen

export interface dataobject {
    readonly db_name:string;
    readonly key:string;
    
    readonly data:any;
    readonly last_write_data:any;

    get_data_initdef():Promise<any>;
    read_data():Promise<any>;

    mod_data(new_data:any):void;

    write_back(do_persist:boolean):Promise<boolean>;
}