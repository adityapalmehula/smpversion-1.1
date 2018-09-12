const notesModel = require('./note.entity');
const logger = require('../../../services/app.logger');
const validation = require('./../../../common/validation');
const loggerConstants = require('./../../../constants/logger');
const SubTopics = require('../../subtopics/subtopic.entity');
const SubTopicsCtrl = require('../../subtopics/subtopic.controller');
const appConstants = require('./../../../constants/app');
const constants = require('./../../../constants/app');

// Save SUBTOPICS notes
const saveNotes = function(notes, subTopicId, userInfo) {
    // insert the data into db using promise
    return new Promise((resolve, reject) => {
      let notesData = new notesModel(notes);
      let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[1],constants.METHODS[0]);
      if(!actionData) {
       reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
     }
     notesData.type= appConstants.CONTENTS[1];
     notesData.createdBy=actionData;
     logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : ' + notesData);
     let error= notesData.validateSync();
     if(error){
      let msg= validation.formValidation(error);
      reject(msg)
    } else {
      notesData.save(function(err, data) {
        if (err) {
          logger.error(loggerConstants.SUBTOPICS_NOTES_NOT_SAVED + ':' + err);
          reject({ success: false, msg: loggerConstants.SUBTOPICS_NOTES_NOT_SAVED });
        } else {
          actionData.contentId=data._id;
          SubTopics.findOneAndUpdate({ '_id': subTopicId }, {
            $push: {
              notes: data._id,
              action: actionData
            }
          }, (err, data) => {
            if (err) {
              logger.error({ success: false, msg: loggerConstants.NOTES_ID_NOT_SAVED_IN_SUBTOPICS })
              reject({ success: false, msg: loggerConstants.NOTES_ID_NOT_SAVED_IN_SUBTOPICS });

            } else {
              logger.debug({ success: true, msg: loggerConstants.SUBTOPICS_NOTES_SUCCESSFULLY_SAVED })
              resolve({ success: true, msg: loggerConstants.SUBTOPICS_NOTES_SUCCESSFULLY_SAVED });

            }
          })
        }
      });
    }

  });
  }

// update notes data
const updateNotes = function(notesObj, userInfo) {
  return new Promise((resolve, reject) => {
    logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : ' + notesObj);
    let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[1],constants.METHODS[1]);
    if(!actionData) {
     reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
   }
    //update data of notes
    let updatedObj = {
      title: notesObj.title,
      description: notesObj.description,
      status: notesObj.statusCheck,
      updatedBy:actionData
    }
    let noteObj = new notesModel(updatedObj)
    var ifError = validation.validationForm(noteObj);
    if (ifError) {
      reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    }  else {
      notesModel.updateOne({ _id: notesObj.notesId }, {
        $set: updatedObj
      }, function(err, data) {
        if (err) {
          logger.error(loggerConstants.NOTES_NOT_UPDATED + ':' + err);
          reject({ success: false, msg: loggerConstants.NOTES_NOT_UPDATED });
        } else {
          logger.debug({ success: true, msg: loggerConstants.NOTES_SUCCESSFULLY_UPDATED + ' : ' + data })
          resolve({ success: true, msg: loggerConstants.NOTES_SUCCESSFULLY_UPDATED });

        }
      });
    }
  });
};

// Delete Notes from SUBTOPICS
const deleteNotes = function(notesId, subTopicId, userInfo) {
  return new Promise((resolve, reject) => {
   let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[1],constants.METHODS[2]);
   if(!actionData) {
     reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
   }
   notesModel.updateOne({ '_id': notesId },{
    $set : {
      status: constants.CONTENT_STATUS[5] ,
      deletedBy:actionData
    } 
  },function(err, data) {
    if (err) {
      logger.error(loggerConstants.NOTES_DATA_NOT_FOUND + ' : ' + err);
      reject(err);
    } else {
      actionData.contentId=notesId;
      SubTopics.findOneAndUpdate({ '_id': subTopicId }, {
        $pull: {
          notes: notesId
        },
        $push :{
          action:actionData
        }
      }, (err, data) => {
        if (err) {
          logger.error({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_NOTES_FROM_SUBTOPICS + ' : ' + err })
          reject({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_NOTES_FROM_SUBTOPICS });
        } else {
          logger.debug({ success: true, msg: loggerConstants.NOTES_SUCCESSFULLY_DELETED });
          resolve({ success: true, msg: loggerConstants.NOTES_SUCCESSFULLY_DELETED });

        }
      })
    }
  });
 });
}




module.exports = {
  saveNotes: saveNotes,
  deleteNotes: deleteNotes,
  updateNotes: updateNotes
}