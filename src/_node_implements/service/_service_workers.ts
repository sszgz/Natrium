// natrium
// license : MIT
// author : Sean Chen

export class _service_workers {

    public static make_service_thread_uname(service_name:string, service_index:number):string {
        return `service_${service_name}_${service_index}`;
    }

}