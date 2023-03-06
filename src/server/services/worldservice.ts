// natrium
// license : MIT
// author : Sean Chen


import { serviceconf, natrium_services } from "../../interface/service/service";
import { levelinstanceservice } from "./levelinstanceservice";
import { servicebase } from "./servicebase";

export class worldservice extends servicebase {

    public static create(c:serviceconf) {
        return new levelinstanceservice(c);
    }
    
    constructor(c:serviceconf) {
        super(c);
    }

}

natrium_services.register("worldservice", worldservice.create);
