const keyPointsModel= require('./keypoint.entity');
const logger = require('../../../services/app.logger');
const validation = require('./../../../common/validation');
const loggerConstants = require('./../../../constants/logger');
const SubTopics = require('../../subtopics/subtopic.entity');
const SubTopicsCtrl = require('../../subtopics/subtopic.controller');
const appConstants = require('./../../../constants/app');
const constants = require('./../../../constants/app');

// Save SUBTOPICS notes
const saveKeyPoints = function(keyPoints, subTopicId, userInfo) {
  return new Promise((resolve, reject) => {
    let keyPointsData = new keyPointsModel(keyPoints);
    keyPointsData.type = appConstants.CONTENTS[2].toLowerCase();
    let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[2],constants.METHODS[0]);
    if(!actionData) {
     reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
   }
   keyPointsData.createdBy=actionData;
   logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : ' + keyPointsData);
    // insert the data into db using promise
    let error= keyPointsData.validateSync();
    if(error){
      let msg= validation.formValidation(error);
      reject(msg)
    } else {
      keyPointsData.save(function(err, data) {
        if (err) {
          logger.error(loggerConstants.SUBTOPICS_KEYPOINTS_NOT_SAVED + ':' + err);
          reject({ success: false, msg: loggerConstants.SUBTOPICS_KEYPOINTS_NOT_SAVED });
        } else {
         actionData.contentId=data._id;
         SubTopics.findOneAndUpdate({ '_id': subTopicId }, {
          $push: {
            keypoints: data._id,
            action: actionData

          }
        }, (err, data) => {
          if (err) {
            logger.error({ success: false, msg: loggerConstants.KEYPOINTS_ID_NOT_SAVED_IN_SUBTOPICS })
            reject({ success: false, msg: loggerConstants.KEYPOINTS_ID_NOT_SAVED_IN_SUBTOPICS });

          } else {
            logger.debug({ success: true, msg: loggerConstants.SUBTOPICS_KEYPOINTS_SUCCESSFULLY_SAVED })
            resolve({ success: true, msg: loggerConstants.SUBTOPICS_KEYPOINTS_SUCCESSFULLY_SAVED });

          }
        })
       }
     });
    }

  });
}


// update KeyPoints data
const updatekeyPoints = function(keyPoints,userInfo) {
    //update data of keyPoints
    return new Promise((resolve, reject) => {
      let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[2],constants.METHODS[1]);
      if(!actionData) {
       reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
     }
     logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : '+ keyPoints);
     let updatedObj = {
      title: keyPoints.title,
      description: keyPoints.description,
      status:keyPoints.statusCheck,
      updatedBy:actionData
    }
    let keyObj = new keyPointsModel(updatedObj)
    var ifError = validation.validationForm(keyObj);
    if (ifError) {
      reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    }  else {
     keyPointsModel.updateOne({ _id: keyPoints.keyPointsId }, {
      $set: updatedObj
    }, function(err, data) {
      if (err) {
        logger.error(loggerConstants.KEYPOINTS_NOT_UPDATED + ':' + err);
        reject({success : false, msg :loggerConstants.KEYPOINTS_NOT_UPDATED});
      } else {
        logger.debug({success: true, msg: loggerConstants.KEYPOINTS_SUCCESSFULLY_UPDATED + ' : ' + data })
        resolve({ success: true, msg: loggerConstants.KEYPOINTS_SUCCESSFULLY_UPDATED});

      }
    });
   }
 });
  };


// Delete Notes from SUBTOPICS
const deleteKeyPoints = function(keyPointsId, subTopicId,userInfo) {
  return new Promise((resolve, reject) => {
   let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[2],constants.METHODS[2]);
   if(!actionData) {
     reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
   }
   keyPointsModel.updateOne({ '_id': keyPointsId },{
    $set : {
      status: constants.CONTENT_STATUS[5] ,
      deletedBy:actionData
    } 
  }, function(err, data) {
    if (err) {
      logger.error(loggerConstants.KEYPOINTS_DATA_NOT_FOUND + ' : ' + err);
      reject(err);
    } else {
     actionData.contentId=keyPointsId;
     SubTopics.findOneAndUpdate({ '_id': subTopicId }, {
      $pull: {
        keypoints: keyPointsId
      },
      $push :{
        action:actionData
      }
    }, (err, data) => {
      if (err) {
        logger.error({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_KEYPOINTS_FROM_SUBTOPICS + ' : ' + err })
        reject({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_KEYPOINTS_FROM_SUBTOPICS });
      } else {
        logger.debug({ success: true, msg: loggerConstants.KEYPOINTS_SUCCESSFULLY_DELETED });
        resolve({ success: true, msg: loggerConstants.KEYPOINTS_SUCCESSFULLY_DELETED });

      }
    })
   }
 });
 });
}

module.exports={
	saveKeyPoints : saveKeyPoints,
	updatekeyPoints : updatekeyPoints,
	deleteKeyPoints : deleteKeyPoints
}