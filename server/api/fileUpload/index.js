const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete credentials.json.
const SCOPES = [ 'https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = './credentials.json';

const client_secret =require('./client_secret.json');

const commonConfig = require('./../../config/commonConfig');
const folderPath = 'server/uploads/';

const appConstants = require('./../../constants/app');
const apps = appConstants.APPS;
const app = appConstants.APPNAME;
// For smartpathshala
var FOLDER_ID;
if(app === apps[0]){
  FOLDER_ID =  commonConfig.FOLDER_ID[apps[0]];
  const client_secret =require('./client_secret.json');

} else if (app === apps[1]) { // For codestrippers
  FOLDER_ID = commonConfig.FOLDER_ID[apps[1]];
  const client_secret =require('./sm_client_secret.json');

} else if (app === apps[2]) { // For local
  FOLDER_ID = commonConfig.FOLDER_ID[apps[2]];
  const client_secret =require('./local_client_secret.json');

}

uploadfile=(uploadDetails)=>{
 return new Promise((resolve, reject) => {
  let data=uploadDetails.fileData;
  let mime = data.split(';')[0].split(':')[1];
  let ext = mime.match(/jpeg|png|jpg/)[0].toLowerCase();
  let requestType=uploadDetails.requestType;
  let index = commonConfig.FOLDER_NAME.indexOf(requestType);
  if(!ext) {
    reject({success:false,msg:loggerConstants.FILE_TYPE_ERROR});
  }
  let y=1;
  let last2=data.slice(-2);
  if(last2=='==') {
    y=2;
  }
  let size=(data.length*(3/4))-y;
  if(size>commonConfig.FILE_SIZE[index]) {
    reject({success:false,msg:loggerConstants.FILE_SIZE_ERROR});
  }
  let base64Data = data.replace(/^data:image\/png;base64,/, "");
  let buf = new Buffer(base64Data, 'base64');
  let filename=uploadDetails.userId+'-'+Date.now() +'.'+ ext;
  fs.writeFile(folderPath+commonConfig.FOLDER_NAME[index]+'/'+filename, buf,function(err){
    if(err) {
      reject(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
    } else {
      let dataDetails = {
        filename:filename,
        extension:ext,
        mime:mime,
        name:uploadDetails.title,
        index:index
      }
      upload(dataDetails).then((successfull)=>{
        resolve(successfull);
      },(error)=>{
        reject(error);
      })
    }
  });
});
}



/* call function for authorization*/
const upload=fileData=>{
  return new Promise((resolve,reject)=>{
  // Authorize a client with credentials, then call the Google Drive API.
  authorized(client_secret).then((successfull)=>{
    uploadFile(successfull,fileData).then((success)=>{
      resolve(success);
    }, (error)=>{
      reject(error);
    });
  },(error)=>{
    reject(error);
  });
})
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * @param {Object} credentials The authorization client credentials.
 */
 const authorized =(credentials)=>{  
  return new Promise((resolve,reject)=>{
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        getAccessToken(oAuth2Client).then((successfull)=>{
          resolve(successfull)
        },(error)=>{
          reject(error);
        })
      } else {
       oAuth2Client.setCredentials(JSON.parse(token));
       resolve(oAuth2Client)
     }
   })
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */

 const getAccessToken= oAuth2Client=>{
  return new Promise((resolve,reject)=>{
   const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
   console.log('Authorize this app by visiting this url:', authUrl);

   const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
   rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        reject({success: false, msg:'google drive access token problem'})
      } else {
        oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) reject({success: false, msg:'token write problem in file'});
        else resolve(oAuth2Client);
      });
    }
  });
  });
 })
}

/* file upload in google drive*/
const uploadFile=(auth,fileData)=>{
  return new Promise((resolve,reject)=>{
    let folder=folderPath+commonConfig.FOLDER_NAME[fileData.index]+'/';
    let folderId=FOLDER_ID[fileData.index];
    // let parentFolderID= commonConfig.PARENT_FOLDER_ID[0];
    const drive = google.drive({version: 'v3', auth});
    let fileMetadata={
      name:Date.now(),
      mimeType: fileData.mime,
      parents: [folderId]
    }
    let media ={
      body: fs.createReadStream(folder+fileData.filename)
    }; 
    drive.files.create({
      resource:fileMetadata,
      media:media
    },function(err,file){
      if(err){
        reject({success:false,msg:'File not uploaded in google drive'});
      } else {
        resolve({success:true, filename:file.data.id,extension:fileData.extension})
        deleteFile(fileData.filename,folder).then((successfull)=>{
          resolve(successfull);
        },(error)=>{
          reject(error);
        })
      }
    })
  })
}


// const fileCreation = (drive,fileData,fileMetadata,media,folder)=>{
//  return new Promise((resolve,reject)=>{

//  })
// }

/* delete file from local storage*/
const deleteFile=(filename,folder)=>{
  return new Promise((resolve,reject)=>{
    fs.unlinkSync(folder+filename, function(err,result){
      if(err) reject({success:false, msg:'File not deleted from local storage'})
       else   resolve({success:true, filename:filename})
     });
  });
}

module.exports = {
  uploadfile: uploadfile,
  upload : upload
} 
