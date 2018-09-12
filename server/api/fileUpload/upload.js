const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const appConstants = require('./../../constants/app');
const apps = appConstants.APPS;
const app = appConstants.APPNAME;
const commonConfig = require('./../../config/commonConfig');
const path = require('path');

let bucketName = '';
let baseUrl = '';


if(app === apps[0]){ // For smartpathshala
  baseUrl=appConstants.UPLOAD.PROD.BUCKET+'/'+appConstants.UPLOAD.PROD.ROOT+'/';
} else if (app === apps[1]) { // For codestrippers
  baseUrl=appConstants.UPLOAD.PROD.BUCKET+'/'+appConstants.UPLOAD.PROD.ROOT+'/';
} else if (app === apps[2]) { // For localhost
  baseUrl=appConstants.UPLOAD.LOCAL.BUCKET+'/'+appConstants.UPLOAD.LOCAL.ROOT+'/';
}
var AWS = require('aws-sdk');
// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(appConstants.UPLOAD.END_POINT);
const s3Bucket = new AWS.S3({
  endpoint: spacesEndpoint
});

const uploadfile=(uploadDetails)=>{  
  return new Promise((resolve, reject) => {
    let data=uploadDetails.fileData;
    let mime='';
    if(upload.mime){
      mime= upload.mime;
    }else {
      mime = data.split(';')[0].split(':')[1];
    }
    let ext = mime.match(/jpeg|png|jpg|pdf/)[0].toLowerCase();
    let requestType=uploadDetails.requestType;
    let index = commonConfig.FOLDER_NAME.indexOf(requestType);

    // check file extension exist or not
    if(!ext) {
      reject({success:false,msg:loggerConstants.FILE_TYPE_ERROR});
    }

    // check file size
    let y=1;
    let last2=data.slice(-2);
    if(last2=='==') { y=2; }
    let size=(data.length*(3/4))-y;
    if(size>commonConfig.FILE_SIZE[index]) {
      reject({success:false,msg:loggerConstants.FILE_SIZE_ERROR});
    }

    // file buffer of base 64
    if(data.search('data:application') !== -1){
      buf = new Buffer(data.replace(/^data:application\/\w+;base64,/, ""),'base64');
    } else if(data.search('data:image') !== -1){
      buf = new Buffer(data.replace(/^data:image\/\w+;base64,/, ""),'base64');
    }

    // file name to be store in db
    let filename=Date.now() +'.'+ ext;

    // file details
    var uploadData = {
      Bucket:baseUrl+requestType,
      Key: filename, 
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: mime,
      ACL: 'public-read'
    };

    // file upload digital occean
    s3Bucket.putObject(uploadData, function(err, data){
      if (err) { 
        reject({success:false,msg:'File not uploaded'});
      } else {
        resolve({success: true, filename:filename,extension:ext});
      }
    });
  });
}

  // Set S3 endpoint to DigitalOcean Spaces
  const s3 = new aws.S3({
    endpoint: spacesEndpoint
  });
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: function (request, file, cb) {
       cb(null,baseUrl+commonConfig.FOLDER_NAME[request.index]);
      },
      contentType:function (request, file, cb) {
        cb(null, file.mimetype);
      },
      acl: 'public-read',
      key: function (request, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname).toLowerCase());
      }
    })
  }).any();

  
  /*const testFile=(info)=> {
    return new Promise((resolve, reject) => {
      setTimeout(()=> {
        resolve({success: true, filename:"updated final",extension:'png'});
      }, 7000)
    })
  }*/

  module.exports ={
    uploadfile: uploadfile,
    upload : upload
  }