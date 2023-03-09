// natrium
// license : MIT
// author : Sean Chen

import { createConnection, Connection } from 'mysql';
import { dbconf } from "../../interface/config/configs";
import { debug_level_enum } from '../../interface/debug/debug_logger';
import { natrium_nodeimpl } from '../natrium_nodeimpl';

export class _mysql_client {
    protected _client:Connection;
    protected _conf:dbconf;

    constructor(conf:dbconf) {
        this._conf = conf;

        this._client = createConnection({
            host:this._conf.host,
            user:this._conf.user,
            password:this._conf.password,
            database:this._conf.database
        });
    }

    public async connect():Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            this._client.connect((err:Error) => {
                if(err == null) {
                    natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_mysql ${this._conf.database} connected on ${this._conf.host}`);

                    resolve();
                }
                else {
                    natrium_nodeimpl.impl.dbglog.log(debug_level_enum.dle_error, `_mysql ${this._conf.database} connect error:${err.message}\r\n${err.stack}`);

                    reject(err.message);
                }
            });
        })
    }

    
}