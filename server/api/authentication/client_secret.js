const appConstant= require('./../../constants/app');
const apps = appConstant.APPS;
const app = appConstant.APPNAME;

let redirect_uris;

if(app === apps[0]){ // For smartpathshala
  redirect_uris = appConstant.YOUTUBE.SMARTPATHSHALA.REDIRECT_URIS;
} else if(app === apps[1]){ // For codestrippers
  redirect_uris = appConstant.YOUTUBE.CODESTRIPPERS.REDIRECT_URIS;
} else if(app === apps[2]){ // For localhost
  redirect_uris = appConstant.YOUTUBE.LOCALHOST.REDIRECT_URIS;
}

module.exports = {  
   web : {  
      client_id:"988017849087-q79165m4s8kbsj1evf7dc8f6ei427vob.apps.googleusercontent.com",
      project_id:"channel-subs-211108",
      auth_uri:"https://accounts.google.com/o/oauth2/auth",
      token_uri:"https://accounts.google.com/o/oauth2/auth",
      auth_provider_x509_cert_url:"https://www.googleapis.com/oauth2/v1/certs",
      client_secret:"AKds0BpM9UOWofL4x_lpxBfK",
      redirect_uris: redirect_uris
   }
}
