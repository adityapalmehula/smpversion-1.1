const referencesModel = require('./reference.entity');
const logger = require('../../../services/app.logger');
const validation = require('./../../../common/validation');
const loggerConstants = require('./../../../constants/logger');
const SubTopics = require('../../subtopics/subtopic.entity');
const SubTopicsCtrl = require('../../subtopics/subtopic.controller');
const constants = require('./../../../constants/app');
const appConstants = require('./../../../constants/app');


// Save SUBTOPICS References

const saveReferences = function(references, subTopicId,userInfo) {

    // insert the data into db using promise
    return new Promise((resolve, reject) => {
      let referencesData = new referencesModel(references);
      let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[3],constants.METHODS[0]);
      if(!actionData) {
       reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
     }
     referencesData.createdBy=actionData;
     logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : ' + referencesData);
     let error= referencesData.validateSync();
     if(error){
      let msg= validation.formValidation(error);
      reject(msg)
    } else {
      referencesData.save(function(err, data) {
        if (err) {
          logger.error(loggerConstants.SUBTOPICS_REFERENCES_NOT_SAVED + ':' + err);
          reject({ success: false, msg: loggerConstants.SUBTOPICS_REFERENCES_NOT_SAVED });
        } else {
         actionData.contentId=data._id;
         SubTopics.findOneAndUpdate({ '_id': subTopicId }, {
          $push: {
           references: data._id,
           action: actionData
         }
       }, (err, data) => {
        if (err) {
          logger.error({ success: false, msg: loggerConstants.REFERENCES_ID_NOT_SAVED_IN_SUBTOPICS })
          reject({ success: false, msg: loggerConstants.REFERENCES_ID_NOT_SAVED_IN_SUBTOPICS });

        } else {
          logger.debug({ success: true, msg: loggerConstants.SUBTOPICS_REFERENCES_SUCCESSFULLY_SAVED })
          resolve({ success: true, msg: loggerConstants.SUBTOPICS_REFERENCES_SUCCESSFULLY_SAVED });

        }
      })
       }
     });
    }

  });
  }


// update references data
const updateReferences = function(referencesObj,userInfo) {
    //update data of references
    return new Promise((resolve, reject) => {
     let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[3],constants.METHODS[1]);
     if(!actionData) {
       reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
     }
     logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : '+ referencesObj);
     let updatedObj= {
      title: referencesObj.title,
      url: referencesObj.url,
      status: referencesObj.statusCheck,
      updatedBy:actionData
    }
    let refObj = new referencesModel(updatedObj)
    var ifError = validation.validationForm(refObj);
    if (ifError) {
      reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    } else {
     referencesModel.updateOne({ _id:referencesObj.referencesId }, {
      $set:updatedObj
    }, function(err, data) {
      if (err) {
        logger.error(loggerConstants.REFERENCES_NOT_UPDATED + ':' + err);
        reject({success : false, msg :loggerConstants.REFERENCES_NOT_UPDATED});
      } else {
        logger.debug({success: true, msg: loggerConstants.REFERENCES_SUCCESSFULLY_UPDATED + ' : ' + data })
        resolve({ success: true, msg: loggerConstants.REFERENCES_SUCCESSFULLY_UPDATED});
      }
    });
   }
 });
  };


// Delete References from SUBTOPICS
const deleteReferences = function(referencesId, subTopicId, userInfo) {
  return new Promise((resolve, reject) => {
   let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[3],constants.METHODS[2]);
   if(!actionData) {
     reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
   }
   referencesModel.updateOne({ '_id': referencesId },{
    $set : {
      status: constants.CONTENT_STATUS[5] ,
      deletedBy:actionData
    } 
  }, function(err, data) {
    if (err) {
      logger.error(loggerConstants.NOTES_DATA_NOT_FOUND + ' : ' + err);
      reject(err);
    } else {
      actionData.contentId=referencesId;
      SubTopics.findOneAndUpdate({ '_id': subTopicId }, {
        $pull: {
          references: referencesId
        },
        $push :{
          action:actionData
        }
      }, (err, data) => {
        if (err) {
          logger.error({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_REFERENCES_FROM_SUBTOPICS + ' : ' + err })
          reject({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_REFERENCES_FROM_SUBTOPICS });
        } else {
          logger.debug({ success: true, msg: loggerConstants.REFERENCES_SUCCESSFULLY_DELETED });
          resolve({ success: true, msg: loggerConstants.REFERENCES_SUCCESSFULLY_DELETED });

        }
      })
    }
  });
 });
}




module.exports={
  saveReferences: saveReferences,
  deleteReferences : deleteReferences,
  updateReferences : updateReferences
}