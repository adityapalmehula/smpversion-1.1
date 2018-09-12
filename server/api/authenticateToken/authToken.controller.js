const jwt = require('jsonwebtoken-refresh');
const appConstant = require('../../constants/').app;
const logger = require('../../services/app.logger');
const loggerConstants= require('./../../constants/logger');


// verify the user token for every request
let verifyToken = function (usertoken) {
  return new Promise((resolve, reject) => {
    jwt.verify(usertoken, appConstant.SECRET, function (err, decoded) {
      if (err) {
        logger.error(loggerConstants.INVALID_TOKEN);
        reject(err);
      } else {
        resolve({ decoded: decoded });
      }
    });
  });
};

// Verify and refresh the valid token
let verifyAndRefreshToken = (token,req) => {
  return new Promise((resolve, reject) => {
    verifyToken(token).then((res) => {
      let decoded = res.decoded;
      let currentTime = new Date().getTime() / 1000;
      if(decoded.exp >= currentTime) {
        let refreshToken;
        if(req.headers && req.headers.platform && req.headers.platform.toLowerCase() === appConstant.PLATFORMS.MOB.toLowerCase()) {
          refreshToken = jwt.refresh(decoded,appConstant.APP_EXPIRETIME, appConstant.SECRET);
        }else if(req.headers && req.headers.platform && req.headers.platform.toLowerCase() === appConstant.PLATFORMS.WEB.toLowerCase()) {
          refreshToken = jwt.refresh(decoded,appConstant.EXPIRETIME, appConstant.SECRET);
        }else {
          logger.debug(loggerConstants.TOKEN_NOT_REFRESHED);
        }
        if(refreshToken) {
          logger.debug(loggerConstants.REFRESH_TOKEN);
          resolve({ success: true, data: { token:refreshToken } });
        }else {
         resolve({ success: false, msg: loggerConstants.BAD_REQUEST, data: { token: null } });
       }
     } 
   },(err) =>{
    reject({success: false, msg:loggerConstants.INVALID_TOKEN});
  })
  })
}

module.exports = {
  verifyToken: verifyToken,
  verifyAndRefreshToken : verifyAndRefreshToken,
};