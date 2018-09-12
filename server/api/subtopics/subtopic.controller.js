var Category = require('../categories/category.entity');
var Video = require('../contents/videos/video.entity');
var notes = require('../contents/notes/note.entity');
var Url = require('../contents/references/reference.entity');
var Course = require('../courses/course.entity');
var CourseHelper = require('../courses/course.helper');
var subTopics = require('./subtopic.entity');
var topics = require('../topics/topic.entity');
const logger = require('./../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants= require('./../../constants/logger');
const mongoose = require('mongoose');
const constants = require('./../../constants/app');

// Create subtopic
const createSubTopic = function(subTopicData,userInfo) {
    // insert the data into db using promise
    return new Promise((resolve, reject) => {
    	let topicId=subTopicData.topicId;
    	let actionDetails= actionData(userInfo,'subtopics',constants.METHODS[0]);
    	if(!actionDetails) {
    		reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
    	}
    	var subTopicDetails = {
    		title: subTopicData.subTopicTitle,
    		description: subTopicData.subTopicDescription,
    		status: subTopicData.statusCheck,
    		topicId: topicId,
    		createdBy:actionDetails
    	};
    	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : subTopicDetails');
    	let subTopicModel = new subTopics(subTopicDetails);
    	let error= subTopicModel.validateSync();
    	if(error){
    		let msg= validation.formValidation(error);
    		reject(msg)
    	} else {
    		topics.findOne({ "_id": topicId}, function(err, data) {
    			if (data.length > 0) {
    				reject({ success: false, msg: loggerConstants.TOPIC_NOT_FOUND_FOR_THIS_SUBTOPIC });
    			} else {
    				subTopicDetails['courseId']= data['courseId'] || '';
    				let subTopicModel = new subTopics(subTopicDetails);
    				subTopicModel.save(function(err, data) {
    					if (err) {
    						logger.error(loggerConstants.SUBTOPIC_NOT_SAVED + ':' + err);
    						reject({ success: false, msg: loggerConstants.SUBTOPIC_NOT_SAVED });
    					} else {
    						actionDetails.contentId=data._id;
    						topics.updateOne({ "_id": topicId }, {
    							$push: { 
    								subtopics: data._id,
    								action:actionDetails
    							}
    						}, function(err, data) {
    							if (err) {
    								logger.debug({ success: false, msg: loggerConstants.SUBTOPIC_ID_NOT_SAVED_IN_TOPIC })
    								resolve({ success: false, msg: loggerConstants.SUBTOPIC_NOT_SAVED });
    							} else {
    								logger.debug({ success: true, msg: loggerConstants.SUBTOPIC_SUCCESSFULLY_SAVED + ' : ' + data })
    								resolve({ success: true, msg: loggerConstants.SUBTOPIC_SUCCESSFULLY_SAVED });
    							}
    						});
    					}
    				});
    			}
    		});
    	}
    });
};

// update subtopic by id
const updateSubTopic = function(subTopicObj, subTopicId,userInfo) {
    //update data of category
    return new Promise((resolve, reject) => {
    	let actionDetails= actionData(userInfo,'subtopics',constants.METHODS[1]);
    	if(!actionDetails) {
    		reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
    	}
    	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' :  subTopicObj');
    	let	subtopicUpdate={
    		title: subTopicObj.subTopicTitle,
    		description: subTopicObj.subTopicDescription,
    		status: subTopicObj.statusCheck,
    		updatedBy: actionDetails
    	}
    	let subTopicModel = new subTopics(subtopicUpdate);
    	let error= subTopicModel.validateSync();
    	if(error){
    		let msg= validation.formValidation(error);
    		reject(msg);
    	} else {
    		subTopics.updateOne({ _id: subTopicId }, {
    			$set:subtopicUpdate,
    			$push:{
    				action:actionDetails
    			}
    		},{new: true}, function(err, data) {
    			if (err) {
    				logger.error(loggerConstants.SUBTOPIC_NOT_UPDATED + ':' + err);
    				reject({success : false, msg :loggerConstants.SUBTOPIC_NOT_UPDATED});
    			} else {
    				logger.debug({success: true, msg: loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED})
    				resolve({ success: true, msg: loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED});
    			}
    		});
    	}
    });
};

  // rearrange learning path by subtopic Id
  const rearrangeLPBySubtopicId = function(learningPathObj, subTopicId, userInfo) {
  	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' :  learningPathObj');
    //update data of category
    return new Promise((resolve, reject) => {
    	let actionDetails= actionData(userInfo,'learningPaths',constants.METHODS[1]);
    	if(!actionDetails) {
    		reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
    	}
    	var ifError = validation.validationForm(learningPathObj);
    	if (ifError) {
    		logger.error(loggerConstants.FIll_ALL_BLANK_FIELD + ':' + ifError);
    		reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    	} else {
    		actionDetails.contentId=learningPathObj._id;
    		subTopics.updateOne({ _id: subTopicId }, {
    			$set: {
    				learningPaths:learningPathObj,
    				updatedBy:actionDetails
    			}
    		},{
    			$push : {
    				action: actionDetails
    			}
    		}, function(err, data) {
    			if (err) {
    				logger.error(loggerConstants.SUBTOPIC_NOT_UPDATED + ':' + err);
    				reject({success : false, msg :loggerConstants.SUBTOPIC_NOT_UPDATED});
    			} else {
    				logger.debug({success: true, msg: loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED})
    				resolve({ success: true, msg: loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED});

    			}
    		});
    	}
    });
};



// insert learning data 
const insertLearningData = function(subTopicId, learningData,userInfo) {
	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' :  learningData');
    //update learnin data 
    return new Promise((resolve, reject) => {
    	learningData.status= constants.CONTENT_STATUS[2];
    	let actionDetails= actionData(userInfo,'learningPaths',constants.METHODS[0]);
    	if(!actionDetails) {
    		reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
    	}
    	var ifError = validation.validationForm(learningData);
    	if (ifError) {
    		logger.error(loggerConstants.FIll_ALL_BLANK_FIELD + ':' + ifError);
    		reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    	} else {
    		subTopics.findOneAndUpdate({ '_id': subTopicId }, {
    			$push:{
    				learningPaths:learningData,
    				action: actionDetails
    			}, $set : {
    				updatedBy:actionDetails
    			}
    		} , { new: true }, function(err, data) {
    			if (err) {
    				logger.error(loggerConstants.LEARNING_DATA_NOT_UPDATED + ':' + err);
    				reject({success : false, msg :loggerConstants.LEARNING_DATA_NOT_UPDATED});
    			} else {
    				logger.debug({success: true, msg: loggerConstants.LEARNING_DATA_SUCCESSFULLY_UPDATED})
    				resolve({ success: true, msg: loggerConstants.LEARNING_DATA_SUCCESSFULLY_UPDATED, data:data});
    			}
    		});
    	}
    });
};

  // update learning data 
  const updateLearningData = function(subTopicId, learningDataId, learningData,userInfo) {
  	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' :  learningData');
    //update learning data 
    return new Promise((resolve, reject) => {
    	let actionDetails= actionData(userInfo,'learningPaths',constants.METHODS[1]);
    	if(!actionDetails) {
    		reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
    	}
    	actionDetails.contentId=learningDataId;
    	var ifError = validation.validationForm(learningData.mainContent);
    	if (ifError) {
    		logger.error(loggerConstants.FIll_ALL_BLANK_FIELD + ':' + ifError);
    		reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    	} else {
    		// let learningPathObj= {
    		// 	  "_id" : new mongoose.mongo.ObjectId(learningData._id),
      //       "otherContents" : [ ],
      //       "mainContent" : {
      //           "type" : "",
      //           "title" : "",
      //           "contentId" : "",
      //           "date" : ""
      //       }
      //     };
        // learningPathObj.mainContent = {
        //   "type" : learningData.mainContent.type,
        //   "title" : learningData.mainContent.title,
        //   "contentId" : new mongoose.mongo.ObjectId(learningData.mainContent.contentId),
        //   "date" : learningData.mainContent.date
        // }
        
        // learningData.otherContents.map((content)=>{
        // 	let contentObj = {
        // 		"type" : content.type,
	       //    "title" : content.title,
	       //    "contentId" : new mongoose.mongo.ObjectId(content.contentId),
	       //    "date" : content.date
        // 	}
        // 	learningPathObj.otherContents.push(contentObj);
        // })

        
        learningData.mainContent.contentId = new mongoose.mongo.ObjectId(learningData.mainContent.contentId)

        learningData.otherContents.map((content, index)=> {
        	learningData.otherContents[index].contentId = new mongoose.mongo.ObjectId(content.contentId);
        	learningData.otherContents[index]._id = new mongoose.mongo.ObjectId(content._id);
        })

        mongoose.connection.db.collection("subtopics")
        .update({"_id" : new mongoose.mongo.ObjectId(subTopicId),
        	"learningPaths._id": new mongoose.mongo.ObjectId(learningDataId) }, 
        	{ $set: {
        		"learningPaths.$.title" : learningData.title,
        		"learningPaths.$.mainContent" : learningData.mainContent,
        		"learningPaths.$.otherContents" : learningData.otherContents,
        	} 
        },
        { arrayFilters: [ { "learningPaths._id": new mongoose.mongo.ObjectId(learningDataId) } ] },
        function(err,data) {
        	if (err) {
        		logger.error(loggerConstants.LEARNING_DATA_NOT_UPDATED + ':' + err);
        		reject({success : false, msg :loggerConstants.LEARNING_DATA_NOT_UPDATED});
        	} else {
        		subTopics.findOneAndUpdate({ '_id': subTopicId }, {
        			$push:{
        				action: actionDetails
        			}, $set : {
        				updatedBy:actionDetails
        			}
        		},function(err, data) {
        			if (err) {
        				logger.error(loggerConstants.Action_DATA_NOT_UPDATED + ':' + err);
        				reject({success : false, msg :loggerConstants.Action_DATA_NOT_UPDATED});
        			} else {
        				logger.debug({success: true, msg: loggerConstants.LEARNING_DATA_SUCCESSFULLY_UPDATED})
        				resolve({ success: true, msg: loggerConstants.LEARNING_DATA_SUCCESSFULLY_UPDATED});
        			}
        		})
        	}
        });
    };
});
}

// change order of learning data
const changeOrderOfLearningData = function(subTopicId, learningData,userInfo) {
	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' :  learningData');
    //change order of learnin data 
    return new Promise((resolve, reject) => {
    	var ifError = validation.validationForm(learningData);
    	if (ifError) {
    		logger.error(loggerConstants.FIll_ALL_BLANK_FIELD + ':' + ifError);
    		reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    	} else {
    		subTopics.updateOne({ '_id': subTopicId }, {
    			$set:{
    				learningPaths:learningData
    			} 
    		},{
    			$set : {
    				updatedBy:{
    					id: userInfo.userId,
    					role: userInfo.role,
    					name: userInfo.name,
    					date: Date.now()
    				}
    			}
    		}, function(err, data) {
    			if (err) {
    				logger.error(loggerConstants.ORDER_NOT_CHANGE_OF_LEARNING_DATA + ':' + err);
    				reject({success : false, msg :loggerConstants.ORDER_NOT_CHANGE_OF_LEARNING_DATA});
    			} else {
    				logger.debug({success: true, msg: loggerConstants.SUCCESSFULLY_ORDER_CHANGE_OF_LEARNING_DATA})
    				resolve({ success: true, msg: loggerConstants.SUCCESSFULLY_ORDER_CHANGE_OF_LEARNING_DATA});
    			}
    		});
    	}
    });
};





// Delete learning data
const deleteLearningData = function(subTopicId, learningDataId, userInfo) {
	return new Promise((resolve, reject) => {
		let actionDetails= actionData(userInfo,'Learning Path',constants.METHODS[2]);
		if(!actionDetails) {
			reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
		}
		subTopics.findOne({ '_id': subTopicId }, function(err, data) {
			if (err) {
				logger.error(loggerConstants.SUBTOPIC_DATA_NOT_FOUND + ' : ' + err);
				reject(err);
			} else {
				actionDetails.contentId=learningDataId;
				if(data){
					subTopics.updateOne({ '_id': subTopicId },{
						$pull : {
							learningPaths:{
								_id: learningDataId
							}
						}, $set : {
							updatedBy:actionDetails
						}, $push : {
							action : actionDetails
						}
					},function(err,data){
						if(err){
							logger.debug({ success: false, msg: loggerConstants.LEARNING_DATA_NOT_DELETED + ':' + err});
							reject({ success: false, msg: loggerConstants.LEARNING_DATA_NOT_DELETED + ':' + err});

						} else {
							logger.debug({ success: true, msg: loggerConstants.LEARNING_DATA_SUCCESSFULLY_DELETED });
							resolve({ success: true, msg: loggerConstants.LEARNING_DATA_SUCCESSFULLY_DELETED });
						}
					})
				}
				else {
					logger.error(loggerConstants.SUBTOPIC_DATA_NOT_FOUND + ' : ' + err);
					reject(err);
				}
			}
		});
	});
}

// Delete Subtopic
const deleteSubTopic = function(subTopicId, userInfo) {
	return new Promise((resolve, reject) => {
		let actionDetails= actionData(userInfo,'subtopics',constants.METHODS[2]);
		if(!actionDetails) {
			reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
		}
		actionDetails.contentId=subTopicId;
		subTopics.findOneAndUpdate({ '_id': subTopicId },{
			$set : {
				status: constants.CONTENT_STATUS[5],
				deletedBy:actionDetails
			},$push : {
				action: actionDetails
			}
		},function(err, data) {
			if (err) {
				logger.error(loggerConstants.SUBTOPIC_DATA_NOT_FOUND + ' : ' + err);
				reject(err);
			} else {
				logger.debug({ success: true, msg: loggerConstants.SUBTOPIC_SUCCESSFULLY_DELETED });
				resolve({ success: true, msg: loggerConstants.SUBTOPIC_SUCCESSFULLY_DELETED });
			}
		});
	});
}

const getSubTopicData=function(subTopicId){
	return new Promise((resolve,reject)=>{
		subTopics.findOne({'_id': subTopicId, 'status':constants.CONTENT_STATUS[2]})
		.populate({ path: 'notes' })
		.populate({ path: 'videos' })
		.populate({ path: 'media' })
		.populate({ path: 'keypoints' })
		.populate({ path: 'references' })
		.exec(function(err,subTopicData){
			if (err) {
				logger.error(loggerConstants.SUBTOPIC_DATA_NOT_FOUND + ' : ' + err);
				reject(err);
			} else {
				CourseHelper.getCourseStatus(subTopicData.courseId).then((success)=>{
					let data=subTopicData.toObject();
					data.courseStatus=success.msg.status;
					logger.debug({ success: true, msg: loggerConstants.GET_SUBTOPIC_DATA_SUCCESSFULLY });
					resolve({ success: true, msg: loggerConstants.GET_SUBTOPIC_DATA_SUCCESSFULLY, data:data });
				},(error)=>{
					logger.error(error.msg);
					reject(error);
				})
			}
		});
	});
}

//get subtopic by id
const getSubtopicById= (subtopicId)=> {
	return new Promise((resolve,reject)=> {
		subTopics.findOne({'_id': subtopicId },(err,subtopic)=> {
			if(err) {
				return reject(err);
			}
			resolve({ success: true, msg: loggerConstants.GET_SUBTOPIC_DATA_SUCCESSFULLY, data: subtopic });
		})
	})
}

const actionData = (userInfo,content,method)=>{
	return {
		id: userInfo.userId,
		role: userInfo.role,
		name: userInfo.name,
		date: Date.now(),
		dataType:content,
		method: method
	}
}

module.exports = {
	createSubTopic: createSubTopic,
	deleteSubTopic:deleteSubTopic,
	updateSubTopic : updateSubTopic,
	getSubTopicData: getSubTopicData,
	insertLearningData : insertLearningData,
	updateLearningData : updateLearningData,
	deleteLearningData: deleteLearningData,
	changeOrderOfLearningData : changeOrderOfLearningData,
	getSubtopicById: getSubtopicById,
	rearrangeLPBySubtopicId: rearrangeLPBySubtopicId,
	actionData: actionData
}
