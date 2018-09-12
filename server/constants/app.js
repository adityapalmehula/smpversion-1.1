 var base64 = require('base-64');

 const APPS = ['smartpathshala', 'codestrippers','localhost'];
 const APPNAME = APPS[0];
 // const APIHOST = 'http://192.168.1.128:8080';
 const APIHOST = 'http://localhost:8080';
 //const APIHOST = 'http://amoeba.smartpathshala.com';
 //const APIHOST = 'demo.smartpathshala.com';
 // const CLIENT_APIHOST = 'http://localhost:4200';
 const CLIENT_APIHOST = '';

 const VIMEO_CLIENT_ID = '3eb9d8aebc1f89c29b4f62244e541915b108ac42';
 const VIMEO_CLIENT_SECRET = 'i6n4tCC65u9oZzh7zYkLeDGCo+X31Py1SOHmwQTTVJLMwjhEHp/9I5f2MVOnaehRwO2WgNFHGk+k0UeBLicLKWeAPA+j5n7i1Db5+2g/ReoUtgLF3vOxoRwMec7ttjKI';
 let btoaData = base64.encode(VIMEO_CLIENT_ID + ":" + VIMEO_CLIENT_SECRET);

 module.exports = {
   APPS : APPS,
   APPNAME : APPNAME,
   APIHOST : APIHOST,
   CLIENT_APIHOST : CLIENT_APIHOST ,
   BLOG_STATUS : ['New', 'Active', 'Inactive'],
   USER_DETAILS : {
    USER_STATUS: ['Active', 'InActive', 'Suspended'],
    USER_ROLES: ['Admin', 'Instructor', 'School', 'Teacher', 'Student' ],
    DEFAULT_PASSWORD: 'password@123',
    DEFAULT_PASSWORD_LENGTH: 8,
  },
  BLOG_COMMENT : {
    STATUS : ['New','Enabled','Disabled']
  },
  QUESTION_VISIBILITY: ['Public','Private'],
  SECRET : 'secretkey',
  EXPIRETIME : 259200,//72 hours//86400=>24 hours,
  APP_EXPIRETIME : 2628000, // 1 month
  SALT_WORK_FACTOR : 10,

  /* mail authentication config block start here */
  MAIL_AUTH : {
    MAIL_USER: 'sumitkumar93693@gmail.com',
    MAIL_PASSWORD: 'sumit93693',
    // MAIL_USER: 'contact@codestrippers.com',
    // MAIL_PASSWORD: 'Vivek@2016',
  },
  APP: {
    SMARTPATHSHALA: APPS[0],
    CODESTRIPPERS: APPS[1]
  },
  PLATFORMS: {
    MOB: "Mobile",
    WEB: "Web"
  },
  SMARTPATHSHALA_MAIL_CONFIG: {
    HOST:'s210.tmd.cloud',
    PORT: 465,
    AUTH: {
      USER: 'noreply@smartpathshala.com',
      PASSWORD: 'Code@2018'
    }
  },

  CODESTRIPPERS_MAIL_CONFIG: {
    HOST:'s920.tmd.cloud',
    PORT: 465,
    AUTH: {
      USER: 'noreply@codestrippers.com',
      PASSWORD: 'Code@2018'
    }
  },

  MAIL_NOTIFICATION : {
    TO: 'yogendra8819@gmail.com',
    NAME: 'Yogendra'
  },

  MAIL_CONFIG : {
    SUBJECT: 'Email verification',
    TEXT: `<div> </div>`,
  },
  /* mail authentication config block end here */

  /* facebook authentication credentials config block start here  */
  FACEBOOK_AUTH :{
    CLIENT_ID: '734916346713919',
    CLIENT_SECRET: '11763cae3027e89a72f55221127e0b6d',
    // CLIENT_ID: '734916346713919',
    // CLIENT_SECRET: '11763cae3027e89a72f55221127e0b6d',
    CALLBACK_URL: APIHOST+'/api/auth/facebook/callback',
  },
  
  FB_SUCCESS_REDIRECT_URL: APIHOST+'/#student/courses',

  /* facebook authentication credentials config block end here  */

    // Student type
    STUDENT : {
      TYPE :['B2C','B2B']
    },

  // Record Status
  STATUS : {
    DELETED : 'Deleted',  //Soft Deleted Syntax
    ACTIVE : 'Active',  //Active
    INACTIVE: 'Inactive'  // Inactive
  },
  
  /* Vimeo authentication credentials config block start here  */

  VIMEO : {
    UNAUTHTOKEN_AUTHORIZATION_HEADER: btoaData,
    CLIENT_ID:VIMEO_CLIENT_ID,
    CLIENT_SECRET : VIMEO_CLIENT_SECRET,
    /* We were using from backend. Now this is enabled in frontend. 
    this is access token from vimeo oauth and will expire after some time. */
    PRIVATE_TOKEN : '4e96e42b916e45e82bc823a9d056952d', 
    UNAUTHTOKEN_API_URL : 'https://api.vimeo.com/oauth/authorize/client',
    AUTHTOKEN_API_URL : 'https://api.vimeo.com/oauth/authorize?client_id=',
    PUBLIC_VIDEO_API : 'https://api.vimeo.com/videos?query=',
    PRIVATE_VIDEO_API : 'https://api.vimeo.com/me/videos?weak_search=true&query=',
    CALLBACK_URL : APIHOST+'/api/auth/vimeo/callback',
    REDIRECT_URL : APIHOST,
  },

  /* Vimeo authentication credentials config block end here  */

  LEARNING_PROGRESS_STATUS: ['Pending','In Progress','Completed'],
  DEFAULT_NAME_FOR_BACKEND_USER: 'SmartPathshala',
  DEFAULT_HOST_NAME_FOR_BACKEND_USER: 'smartpathshala.com',

  // SET CONTENTS NAMES
  CONTENTS : ['videos','notes','keypoints', 'references', 'media','assessments','questions'],
  ASSESSMENT_TYPE : ['Practice','Test','Self Evaluation'],
  //COURSE_STATUS: ['Drafted','Submitted','Active','Inactive','Rejected','Deleted'],
  CONTENT_STATUS: ['Drafted','Submitted','Active','Inactive','Rejected','Deleted'],
  COURSE_ACTIVATION_TYPE: ['Promotion','Paid'],
  METHODS : ['Save','Update','Delete'],
  HELPS_STATUS:['New', 'Replied'],
  CART_STATUS: ['Empty','Active','Expired'],
  ORDER_STATUS: ['Success','Failed','Pending', 'Disputed', 'Not Verified'],
  PAYTM_ORDER_STATUS: ['TXN_SUCCESS','TXN_FAILURE','PENDING'],
  TXNAMOUNT_NOT_MATCHED: 'Tracsaction request amount did not match with transaction status verification amount',
  TXNAMOUNT_NOT_VERIFIED: 'Problem occurred in transaction status verification',

  // Digital Ocean upload details
  UPLOAD : {
    END_POINT:'sgp1.digitaloceanspaces.com',

    'PROD' :
      {
      'BUCKET':'klsuploads',
      'ROOT': APPNAME
      },
    'LOCAL' :
      {
        'BUCKET':'smartpathshala',
        'ROOT': APPNAME
      }
  },
  YOUTUBE : {
    SMARTPATHSHALA : {
      CHANNEL_ID : 'UCm8Iqvm-n0A4xPfUsB4CCqQ',
      REDIRECT_URIS:[APIHOST+'/api/auth/youtube/callback']
    },
    CODESTRIPPERS : {
      CHANNEL_ID : 'UCxXse3UTjYpCTcXrymMHDfA',
      REDIRECT_URIS:[APIHOST+'/api/auth/youtube/callback']
    },
    LOCALHOST : {
      CHANNEL_ID : 'UCxXse3UTjYpCTcXrymMHDfA',
      REDIRECT_URIS:[APIHOST+'/api/auth/youtube/callback']
    }
  },
// 'status' to update status only and 'data' to modify any field data.
reqTypes:['status', 'data'],
}
