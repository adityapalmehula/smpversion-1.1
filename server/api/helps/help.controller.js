const helpModel = require('./help.entity');
const logger = require('../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger');
const helpsConstants = loggerConstants.HELPS;
const appConstants = require('./../../constants/app');
const constants = require('./../../constants/app');


// Save help data
const saveHelp = function(helpData, currentUser) {
	helpData['createdBy']= {
		id: currentUser['userId'],
		role: currentUser['role'],
		name: currentUser['name']
	}
	
	helpData['status']=appConstants.HELPS_STATUS[0];
	let newHelp = new helpModel(helpData);
	logger.debug(helpsConstants.GET_OBJECT_AND_STORE_HELP + ' : help');

  // insert the data into db using promise
  return new Promise((resolve, reject) => {
  	var ifError = validation.validationForm(newHelp);
  	if (ifError) {
  		reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
  	} else {
  		newHelp.save(function(err, data) {
  			if (err) {
  				logger.error(helpsConstants.HELP_NOT_SAVED + ':' + err);
  				reject({ success: false, msg: helpsConstants.HELP_NOT_SAVED });
  			} else {
  				logger.debug({ success: true, msg: helpsConstants.HELP_SUCCESSFULLY_SAVED })
  				resolve({ success: true, msg: helpsConstants.HELP_SUCCESSFULLY_SAVED });
  			} 
  		});
  	}
  });
}

// Get all helps
const getHelps = function() {
  return new Promise((resolve, reject)=> {
    helpModel.find((err, helps) => {
      if (err) {
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
        reject({ success: false, msg: err });
      } else if (!helps) {
        logger.error(helpsConstants.HELP_DATA_NOT_FOUND);
        reject({ success: false, msg: helpsConstants.HELP_DATA_NOT_FOUND });
      } else {
        resolve({ success: true, data: helps });
      }
    });
  });
};

// Get all  helps of a student
const getMyHelps = function(userId) {
  return new Promise((resolve, reject)=> {
    helpModel.find({'createdBy.id':userId},(err, helps) => {
      if (err) {
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
        reject({ success: false, msg: err });
      } else if (!helps) {
        logger.error(helpsConstants.HELP_DATA_NOT_FOUND);
        reject({ success: false, msg: helpsConstants.HELP_DATA_NOT_FOUND });
      } else {
        resolve({ success: true, data: helps });
      }
    });
  });
};

// Get help by id
const getHelpById = function(helpId) {
  return new Promise((resolve, reject)=> {
    helpModel.findById({_id: helpId},(err, help) => {
      if (err) {
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
        reject({ success: false, msg: err });
      } else if (!help) {
        logger.error(helpsConstants.HELP_DATA_NOT_FOUND);
        reject({ success: false, msg: helpsConstants.HELP_DATA_NOT_FOUND });
      } else {
        resolve({ success: true, data: help });
      }
    });
  });
};

//Update replies for help by id
const saveReplyByHelpId =(helpId, currentUser, replyData)=> {
  replyData['repliedBy']= {
    id: currentUser['userId'],
    role: currentUser['role'],
    name: currentUser['name']
  }
  return new Promise((resolve,reject)=> {
    helpModel.findOneAndUpdate({ '_id': helpId }, {
      $push: {
        replies: replyData
      }
    },{new: true},(err,data)=> {
      if (err) {
        return reject(err);
      } else if(data && data.createdBy.id.toString() !== currentUser.userId.toString()) {
        helpModel.updateOne({'_id':helpId}, {
          $set:{
            status: appConstants.HELPS_STATUS[1]
          }
        }, (err, data)=>{
          if (err) {
            return reject(err);
          } else {
            resolve({ success: true, msg: helpsConstants.HELP_SUCCESSFULLY_UPDATED });
          }
        })
      } else {
        resolve({ success: true, msg: helpsConstants.HELP_SUCCESSFULLY_UPDATED });
      }
    });
  });
}

module.exports = {
	saveHelp: saveHelp,
  getHelps: getHelps,
  getHelpById: getHelpById,
  saveReplyByHelpId: saveReplyByHelpId,
  getMyHelps: getMyHelps
}