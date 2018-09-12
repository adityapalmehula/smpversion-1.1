var Category = require('../categories/category.entity');
var Content = require('../contents/content.entity');
var Course = require('../courses/course.entity');
var CourseHelper = require('../courses/course.helper');
// var SubCategory = require('../subcategories/subcategory.entity');
var SubTopics = require('../subtopics/subtopic.entity');
const SubTopicsCtrl = require('../subtopics/subtopic.controller');
var Topics = require('./topic.entity');

const logger = require('./../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger');
const constants = require('./../../constants/app');


// Create topic
const createTopic = function(topicData,userInfo) {
    // insert the data into db using promise
    return new Promise((resolve, reject) => {
    	let actionData= SubTopicsCtrl.actionData(userInfo,'topics',constants.METHODS[0]);
    	if(!actionData) {
    		reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
    	}
    	let courseId=topicData.courseId;
    	var topicDetails = {
    		title: topicData.topicTitle,
    		description: topicData.topicDescription,
    		status: topicData.statusCheck,
    		courseId: courseId,
    		createdBy:actionData
    	};
    	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : topicDetails');
    	let topicModel = new Topics(topicDetails);
    	let error= topicModel.validateSync();
    	if(error){
    		let msg= validation.formValidation(error);
    		reject(msg)
    	} else {
    		Course.findOne({ "_id": courseId}, function(err, data) {
    			if (data.length > 0) {
    				reject({ success: false, msg: loggerConstants.COURSE_NOT_FOUND_FOR_THIS_TOPIC });
    			} else {
    				topicModel.save(function(err, data) {
    					if (err) {
    						logger.error(loggerConstants.TOPIC_NOT_SAVED + ':' + err);
    						reject({ success: false, msg: loggerConstants.TOPIC_NOT_SAVED });
    					} else {
    						actionData.contentId=data._id
    						Course.updateOne({ "_id": courseId }, {
    							$push: { 
    								topics: data._id,
    								action:actionData
    							}
    						}, function(err, data) {
    							if (err) {
    								logger.debug({ success: false, msg: loggerConstants.TOPIC_ID_NOT_SAVED_IN_COURSE })
    								reject({ success: false, msg: loggerConstants.TOPIC_NOT_SAVED });
    							} else {
    								logger.debug({ success: true, msg: loggerConstants.TOPIC_SUCCESSFULLY_SAVED + ' : ' + data })
    								resolve({ success: true, msg: loggerConstants.TOPIC_SUCCESSFULLY_SAVED });

    							}
    						});
    					}
    				});
    			}
    		});
    	}
    });
  };

// update topic by id
const updateTopic = function(topicObj, topicId,userInfo) {
	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' :  topicObj');
    //update data of category
    return new Promise((resolve, reject) => {
    	let actionData= SubTopicsCtrl.actionData(userInfo,'topics',constants.METHODS[1]);
    	if(!actionData) {
    		reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
    	}
    	actionData.contentId=topicId;
    	let updateTopic =  {
    		title: topicObj.topicTitle,
    		description: topicObj.topicDescription,
    		status: topicObj.statusCheck,
    		updatedBy:actionData
    	};
    	let topicModel = new Topics(updateTopic);
    	let error= topicModel.validateSync();
    	if(error){
    		let msg= validation.formValidation(error);
    		reject(msg)
    	} else {
    		Topics.updateOne({ _id: topicId }, {
    			$set:updateTopic,
    			$push: {
    				action : actionData
    			}
    		}, function(err, data) {
    			if (err) {
    				logger.error(loggerConstants.TOPIC_NOT_UPDATED + ':' + err);
    				reject({success : false, msg :loggerConstants.TOPIC_NOT_UPDATED});
    			} else {
    				logger.debug({success: true, msg: loggerConstants.TOPIC_SUCCESSFULLY_UPDATED})
    				resolve({ success: true, msg: loggerConstants.TOPIC_SUCCESSFULLY_UPDATED});

    			}
    		});
    	}
    });
  };


  // rearrange subtopic by topicId
  const rearrangeSubtopicByTopicId = function(topicObj, topicId,userInfo) {
  	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' :  topicObj');
  	return new Promise((resolve, reject) => {
  		let actionData= SubTopicsCtrl.actionData(userInfo,'topics',constants.METHODS[1]);
  		if(!actionData) {
  			reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
  		}
  		actionData.contentId=topicId;
  		var ifError = validation.validationForm(topicObj);
  		if (ifError) {
  			logger.error(loggerConstants.FIll_ALL_BLANK_FIELD + ':' + ifError);
  			reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
  		} else {
  			Topics.updateOne({ _id: topicId }, {
  				$set: {
  					subtopics: topicObj.subtopics,
  					updatedBy:actionData
  				},
  				$push: {
  					action:actionData
  				}
  			}, function(err, data) {
  				if (err) {
  					logger.error(loggerConstants.TOPIC_NOT_UPDATED + ':' + err);
  					reject({success : false, msg :loggerConstants.TOPIC_NOT_UPDATED});
  				} else {
  					logger.debug({success: true, msg: loggerConstants.TOPIC_SUCCESSFULLY_UPDATED})
  					resolve({ success: true, msg: loggerConstants.TOPIC_SUCCESSFULLY_UPDATED});

  				}
  			});
  		}
  	});
  };

// Delete Topic Data
const deleteTopic = function(topicId,userInfo) {
	return new Promise((resolve, reject) => {
		let actionData= SubTopicsCtrl.actionData(userInfo,'topics',constants.METHODS[2]);
		if(!actionData) {
			reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
		}
		actionData.contentId = topicId;
		Topics.updateOne({ '_id': topicId },{
			$set : {
				status: constants.CONTENT_STATUS[5],
				deletedBy:actionData
			}, $push : {
				action : actionData
			}
		}, function(err, data) {
			if (err) {
				logger.error(loggerConstants.TOPIC_DATA_NOT_FOUND + ' : ' + err);
				reject(err);
			} else {
				logger.debug({ success: true, msg: loggerConstants.TOPIC_DATA_FOUND });
				resolve({ success: true, msg: loggerConstants.TOPIC_SUCCESSFULLY_DELETED });
			}
		});
	});
}

// Get topic details 
const topicDetails = function(topicId) {
	return new Promise((resolve, reject) => {
		Topics.findOne({ '_id': topicId, status: constants.CONTENT_STATUS[2] })
		.populate({ path:'subtopics',
			match: { status: constants.STATUS.ACTIVE }})
		.exec(function(err,data) {
			if(err) {
				logger.error(loggerConstants.TOPIC_DATA_NOT_FOUND + ' : ' + err);
				reject(err);
			}else {
				CourseHelper.getCourseStatus(data.courseId).then((success)=>{
					let topicData=data.toObject();
					topicData.courseStatus=success.msg.status;
					logger.debug({ success: true, msg: loggerConstants.TOPIC_DETAIL_FOUND });
					resolve({ success: true, msg: loggerConstants.TOPIC_DETAIL_FOUND, data:topicData });
				},(error)=>{
					logger.error(error.msg);
					reject(error);
				})
			}
		})
	})
}

// function topicDetails(req, res) {
//     var topicId = req.body.id;
//     Topics.findOne({ '_id': topicId })
//         .populate({
//             path: 'subtopics',
//             model: 'subtopics',
//             // populate: [
//             //   {
//             //     path: 'texts',
//             //     model: 'texts'
//             //   },
//             //   {
//             //     path: 'videos',
//             //     model: 'videos'
//             //   },
//             //   {
//             //     path: 'urls',
//             //     model: 'urls'
//             //   }
//             // ]
//         })
//         .populate({
//             path: 'playlists',
//             model: 'playlists'
//         })
//         .then((topic) => {
//             res.json({
//                 topic: topic,
//             })
//         });
// }


//get topics by course id
function getPlaylistsByTopicId(topicId) {
	return new Promise((resolve, reject) => {
		Topics.findOne({ _id: topicId })
		.populate("playlists")
		.populate("subtopics")
		.exec((err, playlists) => {
			if(err) {
				logger.error(err);
				reject({ msg: loggerConstants.INTERNAL_ERROR});
			}else if(playlists) {
				resolve({success : true, msg : loggerConstants.GET_DATA_SUCCESSFULLY, data: playlists});
			} else {
				reject({ msg: loggerConstants.NO_DATA_FOUND});
			}
		});
	});
}

// Upload text solutions
const uploadTextSolutions = function(data,topicId,userInfo) {
	return new Promise((resolve, reject) => {
		let actionData= SubTopicsCtrl.actionData(userInfo,'solutions',constants.METHODS[0]);
		if(!actionData) {
			reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
		}
		let uploadDetails=data;
		uploadDetails.status=constants.CONTENT_STATUS[2];
		if (!data.path) {
			logger.error(loggerConstants.TOPIC_SOLUTION_NOT_SAVED + ':' + err);
			reject({ success: false, msg: loggerConstants.TOPIC_SOLUTION_NOT_SAVED });
		} else {
			var ifError = validation.validationForm(data);
			if (ifError) {
				reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
			} else {
				Topics.findOneAndUpdate({_id:topicId},{
					$push:{
						solutions:uploadDetails,
						action:actionData
					},
					$set: {
						updatedBy:actionData
					}
				},{new : true},function(err, data) {
					if (err) {
						logger.error(loggerConstants.TOPIC_SOLUTION_NOT_SAVED + ':' + err);
						reject({ success: false, msg: loggerConstants.TOPIC_SOLUTION_NOT_SAVED });
					}  else {
						logger.debug(loggerConstants.TOPIC_SOLUTION_SAVED + ':' + err);
						resolve({ success: true, msg: loggerConstants.TOPIC_SOLUTION_SAVED, data:data });
					}
				})
			}
		}
	});
}

// Delete Solution file from topic
const deleteSolutions = function(solutionId, topicId, userInfo) {
	return new Promise((resolve, reject) => {
		let actionData= SubTopicsCtrl.actionData(userInfo,'solutions',constants.METHODS[2]);
		if(!actionData) {
			reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
		}
		actionData.contentId=topicId;
		Topics.findOne({ '_id': topicId },function(err,topicDetails){
			if(err){
				logger.error(loggerConstants.TOPIC_DATA_NOT_FOUND + ' : ' + err);
				reject(err);
			} else {
				Topics.update({'solutions._id': solutionId}, {
					'$set': {
						'solutions.$.status':constants.CONTENT_STATUS[5]
					}
				},function(err,solutionDetails){
					if(err) {
						logger.error({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_SOLUTION_FROM_TOPICS + ' : ' + err })
						reject({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_SOLUTION_FROM_TOPICS });

					} else {
						Topics.findOneAndUpdate({ '_id': topicId }, {
							$push:{
								action: actionData
							}, $set : {
								updatedBy:actionData
							}
						},function(err, data) {
							if (err) {
								logger.error(loggerConstants.Action_DATA_NOT_UPDATED + ':' + err);
								reject({success : false, msg :loggerConstants.Action_DATA_NOT_UPDATED});
							} else {
								logger.debug({ success: true, msg: loggerConstants.SOLUTION_SUCCESSFULLY_DELETED });
								resolve({ success: true, msg: loggerConstants.SOLUTION_SUCCESSFULLY_DELETED });
							}
						})
					}
				})
			}
		})
	})
}

//get subtopicDetails
const getSubtopicDetails= data=> {
  return new Promise((resolve, reject) => {
    let topics=data.topics;
    let subtopics=data.subtopics;
    Topics.find({"_id": {"$in": topics}},{title:1})
    .populate({ path: 'subtopics',  match: {"_id": {"$in": subtopics}}, select: 'title'})
    .exec((err,topics)=> {
      if(err) reject(err);
      resolve({ success: true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: topics});
    });
  });
}

module.exports = {
	createTopic: createTopic,
	updateTopic : updateTopic,
	deleteTopic: deleteTopic,
	topicDetails: topicDetails,
	getPlaylistsByTopicId: getPlaylistsByTopicId,
	rearrangeSubtopicByTopicId: rearrangeSubtopicByTopicId,
	uploadTextSolutions: uploadTextSolutions,
	deleteSolutions: deleteSolutions,
  getSubtopicDetails: getSubtopicDetails,
}