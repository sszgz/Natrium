// natrium
// license : MIT
// author : Sean Chen

interface session {

    session_id:number;
    session_key:string;

    service:null|service;

    session_data:[string:dataobj];
}