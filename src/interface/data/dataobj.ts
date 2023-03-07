// natrium
// license : MIT
// author : Sean Chen

export interface dataobj {
    readonly table_name:string;
    readonly key:string;
    
    readonly data:any;
    readonly last_write_data:any;

    mod_data(new_data:any):void;

    write_back(do_persist:boolean):Promise<boolean>;
}