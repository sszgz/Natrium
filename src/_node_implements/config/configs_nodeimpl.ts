// natrium
// license : MIT
// author : Sean Chen

import * as fs from "node:fs";
import * as path from 'path';
import { configs, serverconf } from "../../interface/config/configs";
import { debug_level_enum } from "../../interface/debug/debug_logger";
import { natrium_nodeimpl } from "../natrium_nodeimpl";
import { serverconf_nodeimpl } from './serverconf_nodeimpl';

export class configs_nodeimpl implements configs {

    protected _conf_map:Map<string, any> = new Map<string, any>();
    protected _serverconf:serverconf_nodeimpl|null = null;
    protected _svrconfigfile:string = "";

    public get svrconfigfile() {
        return this._svrconfigfile;
    }

    public init(svrconfigfile:string):void {
        if(svrconfigfile == undefined || svrconfigfile.length == 0){
            svrconfigfile = "../../../config/serverconf.json";
        }
        let serverconf_name = path.resolve(__dirname, svrconfigfile);
        this._svrconfigfile = svrconfigfile;

        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `configs_nodeimpl init server conf from ${serverconf_name}`);

        let scf = fs.readFileSync(serverconf_name, "utf-8");
        let scd = JSON.parse(scf);
        this._serverconf = new serverconf_nodeimpl(scd);
        this._serverconf.format_server_conf();

        let mainconf_name = path.resolve(__dirname, "../../../config/main.json");
        
        natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `configs_nodeimpl init main conf from ${mainconf_name}`);
        
        let mcf = fs.readFileSync(mainconf_name, "utf-8");
        let mcd = JSON.parse(mcf);
        const keys = Object.keys(mcd);
        for(let i=0; i<keys.length; ++i) {
            
            let conf_name = path.resolve(__dirname, `../../../config/${mcd[keys[i]].file}`);
            
            natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_system, `configs_nodeimpl init conf:${keys[i]} from ${conf_name}`);
            
            let f = fs.readFileSync(conf_name, "utf-8");
            let d = JSON.parse(f);

            this._conf_map.set(keys[i], d);
        }
    }

    public get_config_data(config_name:string):any {
        return this._conf_map.get(config_name);
    }

    public get_serverconf():serverconf|null {
        return this._serverconf;
    }

}