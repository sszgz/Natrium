// natrium
// license : MIT
// author : Sean Chen

import { serviceconf } from "../../interface/config/configs";
import { natrium_services } from "../../interface/service/service";
import { servicebase } from "./servicebase";

export class levelinstanceservice extends servicebase {

    public static create(c:serviceconf) {
        return new levelinstanceservice(c);
    }
    
    constructor(c:serviceconf) {
        super(c);
    }

}

natrium_services.register("levelinstanceservice", levelinstanceservice.create);