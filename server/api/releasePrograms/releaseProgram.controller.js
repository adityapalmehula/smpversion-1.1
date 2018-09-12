const ReleaseProgram = require('./releaseProgram.entity');
const logger = require('../../services/app.logger');
const CustomError = require('./../../services/custom-error');
const CommonConfig= require('./../../config/commonConfig');
const CONFIG = require('./releaseProgram.config.js');
const _ = require('lodash');


/*
* release Program with a specific  version
*/
const persistReleaseProgram = (programId,releaseProgramDetails,userInfo) => {
  return new Promise((resolve,reject) => {

    let releaseversion = 1;
      releaseProgramDetails= releaseProgramDetails.toObject();
      delete releaseProgramDetails._id;
     
      releaseProgramDetails['programId'] = programId;
      releaseProgramDetails['releasedBy'] = { id: userInfo.userId, role: userInfo.role,name: userInfo.name };
      releaseProgramDetails['releaseversion'] = releaseversion;
        let releaseProgram= new ReleaseProgram(releaseProgramDetails);
      releaseProgram.save((err, data) => {
        if(err) return reject(err);
        logger.info(CONFIG.LOGGER_CONFIG.PROJECT_RELEASE_SUCCESSFULLY);
        resolve({success: true, msg: CONFIG.LOGGER_CONFIG.PROJECT_RELEASE_SUCCESSFULLY});
      });
    },error => {
      reject(error);
    });
}



module.exports = {
  persistReleaseProgram: persistReleaseProgram,

}