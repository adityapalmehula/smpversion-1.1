const videoModel = require('./video.entity');
const subTopicsModel = require('../../subtopics/subtopic.entity');
const logger = require('./../../../services/app.logger');
const validation = require('./../../../common/validation')
const getVideoId = require('get-video-id');
const students = require('./../../students/student.entity');
const loggerConstants = require('./../../../constants/logger');
const appConstants = require('./../../../constants/app');
const SubTopicsCtrl = require('../../subtopics/subtopic.controller');
const constants = require('./../../../constants/app');


// Save SUBTOPICS Video
const saveVideos = function(video, userInfo) {
    // insert the data into db using promise
    return new Promise((resolve, reject) => {
    	let videoContent = video.videoContent;
    	let videoData = new videoModel({
    		title: videoContent.title,
    		description: videoContent.description,
    		url: videoContent.url,
    		videoId: videoContent.videoId,
    		thumbnail: videoContent.thumbnail,
    		source : videoContent.source,
    		startTime: 0,
    		status: appConstants.STATUS.ACTIVE,
    		type : appConstants.CONTENTS[0],
    	});
    	let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[0],constants.METHODS[0]);
    	if(!actionData) {
    		reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
    	}
    	videoData.createdBy=actionData;
    	let subTopicId = video.subTopicId;
    	logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' videoData ');

    	let error= videoData.validateSync();
    	if(error){
    		let msg= validation.formValidation(error);
    		reject(msg)
    	} else {
    		videoData.save(function(err, data) {
    			if (err) {
    				logger.error(loggerConstants.SUBTOPICS_VIDEO_NOT_SAVED + ':' + err);
    				reject({ success: false, msg: loggerConstants.SUBTOPICS_VIDEO_NOT_SAVED });
    			} else {
    				actionData.contentId=data._id;
    				subTopicsModel.findOneAndUpdate({ '_id': subTopicId }, {
    					$push: {
    						videos: data._id,
    						action: actionData
    					}
    				}, (err, data) => {
    					if (err) {
    						logger.error({ success: false, msg: loggerConstants.VIDEO_ID_NOT_SAVED_IN_SUBTOPICS })
    						reject({ success: false, msg: loggerConstants.VIDEO_ID_NOT_SAVED_IN_SUBTOPICS });

    					} else {
    						logger.debug({ success: true, msg: loggerConstants.SUBTOPICS_VIDEO_SUCCESSFULLY_SAVED })
    						resolve({ success: true, msg: loggerConstants.SUBTOPICS_VIDEO_SUCCESSFULLY_SAVED });

    					}
    				})
    			}
    		});
    	}

    });
  }

// Delete video from SUBTOPICS
const deleteVideos = function(videoId, subTopicId, userInfo) {
	return new Promise((resolve, reject) => {
		let actionData= SubTopicsCtrl.actionData(userInfo,appConstants.CONTENTS[0],constants.METHODS[2]);
		if(!actionData) {
			reject({ success: false, msg: constants.Action_DATA_NOT_FOUND });
		}
		videoModel.updateOne({ '_id': videoId },{
			$set : {
				status: constants.CONTENT_STATUS[5] ,
				deletedBy:actionData
			} 
		}, function(err, data) {
			if (err) {
				logger.error(loggerConstants.VIDEO_DATA_NOT_FOUND + ' : ' + err);
				reject(err);
			} else {
				subTopicsModel.findOneAndUpdate({ '_id': subTopicId }, {
					$pull: {
						videos: videoId
					},  $push : {
						action:actionData
					}
				}, (err, data) => {
					if (err) {
						logger.error({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_VIDEO_FROM_SUBTOPICS + ' : ' + err })
						reject({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_VIDEO_FROM_SUBTOPICS });
					} else {
						logger.debug({ success: true, msg: loggerConstants.VIDEO_SUCCESSFULLY_DELETED });
						resolve({ success: true, msg: loggerConstants.VIDEO_SUCCESSFULLY_DELETED });

					}
				})
			}
		});
	});
}

// Add Video TOC to video content
let addVideoTOC = (videoId, videoTOC) => {
	logger.debug(loggerConstants.GET_VIDEO_AND_ADD_TOC_DATA)
	return new Promise((resolve, reject) => {
		let ifError = validation.validationForm(videoTOC);
		if (ifError) {
			resolve({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
		} else {
			videoModel.findOneAndUpdate({ '_id': videoId }, {
				$push: {
					chapters: videoTOC
				}
			}, function(err, data) {
				if (err) {
					logger.error({ success: false, msg: loggerConstants.VIDEO_TOC_NOT_ADDED });
					reject({ success: false, msg: loggerConstants.VIDEO_TOC_NOT_ADDED });
				} else {
					logger.info({ success: true, msg: loggerConstants.VIDEO_TOC_ADDED_SUCCESSFULLY });
					resolve({ success: true, msg: loggerConstants.VIDEO_TOC_ADDED_SUCCESSFULLY });
				}
			});
		};
	});
}

// Delete TOC from video
const deleteToc = function(videoId, tocId) {
	return new Promise((resolve, reject) => {
		videoModel.findOne({ '_id': videoId }, function(err, data) {
			if (err) {
				logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
				reject(err);
			} else if (!data) {
				logger.error(loggerConstants.VIDEO_DATA_NOT_FOUND + ' : ' + err);
				reject(err);
			} else {
				videoModel.findOneAndUpdate({ '_id': videoId }, {
					$pull: {
						'chapters': {
							'_id': tocId
						}
					}
				}, (err, data) => {
					if (err) {
						logger.error({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_TOC_FROM_VIDEO + ' : ' + err })
						reject({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_DELETING_TOC_FROM_VIDEO });
					} else {
						logger.debug({ success: true, msg: loggerConstants.TOC_SUCCESSFULLY_DELETED });
						resolve({ success: true, msg: loggerConstants.TOC_SUCCESSFULLY_DELETED });
					}
				})
			}
		});
	});
}

// Update TOC from video

const updateToc = function(videoId, tocId, tocData) {
	return new Promise((resolve, reject) => {
		var ifError = validation.validationForm(tocData);
		if (ifError) {
			reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
		} else {
			videoModel.findOne({ '_id': videoId }, function(err, data) {
				if (err) {
					logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
					reject(err);
				} else if (!data) {
					logger.error(loggerConstants.VIDEO_DATA_NOT_FOUND + ' : ' + err);
					reject(err);
				} else {
					videoModel.updateOne({ _id: videoId,"chapters._id": tocId }, {
						$set: {
							'chapters.$.title': tocData.title,
							'chapters.$.startTime': tocData.startTime,
							'chapters.$.endTime': tocData.endTime,
						}
					}, (err, data) => {
						if (err) {
							logger.error({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_UPDATING_TOC_FROM_VIDEO + ' : ' + err })
							reject({ success: false, msg: loggerConstants.ERROR_OCCURED_WHILE_UPDATING_TOC_FROM_VIDEO });
						}
						if (!data) {
							console.log('data not found')
						} else {
							console.log('data upload',data);
							logger.debug({ success: true, msg: loggerConstants.TOC_SUCCESSFULLY_UPDATED });
							resolve({ success: true, msg: loggerConstants.TOC_SUCCESSFULLY_UPDATED });
						}
					})
				}

			});

		}
	});
}

// Get Video by Id
const getVideoByVideoId = (videoId) => {
	return new Promise((resolve, reject) => {
		videoModel.findOne({ '_id': videoId }, function(err, video) {
			if (err) {
				reject({ message: "Video is not found", success: false, error: err });
			} else {
				resolve({ message: "Video is found", success: true, data: video });
			}
		});
	});
}

// Funtion to update video like status for user
const likeVideoByVideoId = (videoId, owner) => {
	let video = videoId;
	let userId = owner;
	return new Promise((resolve, reject) => {
		videoModel.find({ _id: video }, function(err, video) {
			if (err) {
				reject({ message: "Video not found", success: false, error: err });
			} else {
				videoModel.findOneAndUpdate({ 'likes.userId': userId }, {
					$pull: {
						likes: {
							userId: userId
						}
					}
				}, { 'new': true }, function(err, data) {
					if (err) {
						reject({ message: "Unable to update Video like status", success: false, error: err });
					} else {
						if (data) {
							resolve({ message: "Video is Unliked by you", success: true, video: data });
						} else {
							videoModel.findOneAndUpdate({ _id: video }, {
								$push: {
									likes: {
										userId: userId
									}
								}
							}, { 'new': true }, function(err, like) {
								if (err) {
									reject({ message: "Unable to update Video like status", success: false, error: err });
								} else {
									if (like) {
										videoModel.findOneAndUpdate({ _id: video }, {
											$pull: {
												dislikes: {
													userId: userId
												}
											}

										}, { 'new': true }, function(err, data) {
											if (err) {
												reject({ message: "Unable to update Video like status", success: false, error: err });
											} else {
												resolve({ message: "Video is liked by you", success: true, video: data });

											}
										});
									}
								}
							});
						}
					}
				});
			}
		});
	});
}

const unLikeVideoByVideoId = (videoId, owner) => {
	let video = videoId;
	let userId = owner;
	return new Promise((resolve, reject) => {
		videoModel.find({ _id: video }, function(err, video) {
			if (err) {
				reject({ message: "Video not found", success: false, error: err });
			} else {
				videoModel.findOneAndUpdate({ 'dislikes.userId': userId }, {
					$pull: {
						dislikes: {
							userId: userId
						}
					}
				}, { 'new': true }, function(err, data) {
					if (err) {
						reject({ message: "Unable to update Video like status", success: false, error: err });
					} else {
						if (data) {
							resolve({ message: "Video is liked by you", success: true, video: data });
						} else {
							videoModel.findOneAndUpdate({ _id: video }, {
								$push: {
									dislikes: {
										userId: userId
									}
								}
							}, { 'new': true }, function(err, like) {
								if (err) {
									reject({ message: "Unable to update Video like status", success: false, error: err });
								} else {
									if (like) {
										videoModel.findOneAndUpdate({ _id: video }, {
											$pull: {
												likes: {
													userId: userId
												}
											}
										}, { 'new': true }, function(err, data) {
											if (err) {
												reject({ message: "Video is Unliked by you", success: true });
											} else {
												resolve({ message: "Video is Unliked by you", success: true, video: data });

											}

										});
									}
								}
							});
						}
					}
				});
			}
		});
	});
}




module.exports = {
	saveVideos: saveVideos,
	deleteVideos: deleteVideos,
	addVideoTOC: addVideoTOC,
	getVideoByVideoId: getVideoByVideoId,
	likeVideoByVideoId: likeVideoByVideoId,
	unLikeVideoByVideoId: unLikeVideoByVideoId,
	deleteToc: deleteToc,
	updateToc: updateToc
}