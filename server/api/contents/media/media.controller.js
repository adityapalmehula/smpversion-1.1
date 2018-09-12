const mediaModel = require('./media.entity');
const logger = require('../../../services/app.logger');
const validation = require('./../../../common/validation');
const loggerConstants = require('./../../../constants/logger');
const SubTopics = require('../../subtopics/subtopic.entity');
const appConstants = require('./../../../constants/app');
const fs = require('fs');
const SubTopicsCtrl = require('../../subtopics/subtopic.controller');
const constants = require('./../../../constants/app');

// Upload file
const uploadMediaFile = function(data,subTopicId,userInfo) {
  return new Promise((resolve, reject) => {
    let uploadDetails=data;
    uploadDetails.type=appConstants.CONTENTS[4];
    let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[4],constants.METHODS[0]);
    if(!actionData) {
     reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
   }
   let uploadData = new mediaModel(data);
   uploadData.createdBy=actionData;
   if (!data.path) {
    logger.error(loggerConstants.SUBTOPICS_MEDIAFILES_NOT_SAVED + ':' + err);
    reject({ success: false, msg: loggerConstants.SUBTOPICS_MEDIAFILES_NOT_SAVED });
  } else {
    let error= uploadData.validateSync();
    if(error){
      let msg= validation.formValidation(error);
      reject(msg)
    } else  {
      uploadData.save(function(err, data) {
        if (err) {
          logger.error(loggerConstants.SUBTOPICS_MEDIAFILES_NOT_SAVED + ':' + err);
          reject({ success: false, msg: loggerConstants.SUBTOPICS_MEDIAFILES_NOT_SAVED });
        } else {
          SubTopics.findOneAndUpdate({ '_id': subTopicId }, {
            $push: {
              media: data._id,
              action: actionData
            }
          }, (err, data) => {
            if (err) {
              logger.error({ success: false, msg: loggerConstants.MEDIA_ID_NOT_SAVED_IN_SUBTOPICS })
              reject({ success: false, msg: loggerConstants.MEDIA_ID_NOT_SAVED_IN_SUBTOPICS });
            } else {
              logger.debug(loggerConstants.SUBTOPICS_MEDIAFILES_SAVED + ':' + err);
              resolve({ success: true, msg: loggerConstants.SUBTOPICS_MEDIAFILES_SAVED });
            }
          })
        }

      })
    }
  }
});
}

// Delete Media from SUBTOPICS
const deleteMedia = function(mediaId, subTopicId,userInfo) {
  return new Promise((resolve, reject) => {
   let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[4],constants.METHODS[2]);
   if(!actionData) {
     reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
   }
   mediaModel.findOneAndUpdate({ '_id': mediaId },{
    $set : {
      status: constants.CONTENT_STATUS[5] ,
      deletedBy:actionData
    } 
  },{new: true}, function(err, mediaDetails) {
    if (err) {
      logger.error(loggerConstants.MEDIA_DATA_NOT_FOUND + ' : ' + err);
      reject(err);
    } else {
      actionData.contentId=mediaId;
      SubTopics.findOneAndUpdate({ '_id': subTopicId }, {
        $pull: {
          media: mediaId
        },  $push :{
          action:actionData
        }
      }, (err, data) => {
        if (err) {
          logger.error({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_MEDIA_FROM_SUBTOPICS + ' : ' + err })
          reject({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_MEDIA_FROM_SUBTOPICS });
        }else {
          logger.debug({ success: true, msg: loggerConstants.MEDIA_SUCCESSFULLY_DELETED });
          resolve({ success: true, msg: loggerConstants.MEDIA_SUCCESSFULLY_DELETED });
        }
      })
    }
  });
 });
}

module.exports = {
  uploadMediaFile: uploadMediaFile,
  deleteMedia : deleteMedia
}