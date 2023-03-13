// natrium
// license : MIT
// author : Sean Chen

export interface httpconnecter {
    
    get(url:string):Promise<any>;
    post(url:string, data:any):Promise<any>;
}