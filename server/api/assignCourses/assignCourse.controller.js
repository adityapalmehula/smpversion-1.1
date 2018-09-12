const appConstant = require('../../constants').app;
const logger = require('./../../services/app.logger');
const CustomError = require('./../../services/custom-error');
const Course = require('./../courses/course.entity');
const AssignCourse = require('./assignCourse.entity');
const Topics = require('../topics/topic.entity');
const loggerConstants= require('./../../constants/logger').ASSIGN_COURSE;

/*
* persist student assign courses for type B2C user
*/
const persistAssignCourse=(courseId,studentId)=> {
	return new Promise((resolve, reject)=> {
		getAssignCourseObject(courseId).then(success=> { 
			if(success.topics) {
				saveOrUpdate({
					courseId: courseId,
					studentId: studentId,
					topics: success.topics
				}).then(success=> {
					updateCourseStudentsList(courseId,studentId)
					.then(success => {
						resolve(success);
					})
				})
			}
		}).catch(err=> {
			reject(err);
		})
	});
}

/*
* get course details and create assign course object 
*/
const getAssignCourseObject=(courseId)=> {
	return new Promise((resolve,reject)=> {
		Course.findOne({ '_id': courseId },['topics'])
		.populate({ path: 'topics', select: '_id', model: 'topics',
			populate: { path: 'subtopics',select: {
				'_id':1 ,
				'learningPaths':1,
			}, model: 'subtopics' }
		}).exec((err, course)=> {
			if(err) {
				reject(err);
			}else {
				let topics=[];
				if(course && course.topics && course.topics.length>0) {
					topics=course.topics.map(topic=> {
						let obj={}; 
						obj['topicId'] = topic._id;
						obj['subtopics'] = topic.subtopics.map(subtopic=> {
							let temp={}; 
							temp['subtopicId'] = subtopic._id;
							temp['learningPaths'] = subtopic['learningPaths'].map(ele=>{
								let obj={};
								obj['contentId']=ele._id;
								return obj;
							});
							return temp;
						});
						return obj;
					})
				}
				resolve({topics: topics});
			}
		});
	});
} 

/*
* update subtopic status 
* based on subtopic status update topic status 
* based on topic status update course status
*/
const setLearningStatus = (sub_topicStatus,userId)=> {
	return new Promise((resolve,reject)=> {
		getAssignCourse(userId,sub_topicStatus.courseId).then(assignCourse=> {
			assignCourse=assignCourse['data'];
			if(assignCourse && assignCourse.topics && assignCourse.topics.length>0) {
				let t_index = assignCourse.topics.findIndex(t=> t.topicId == sub_topicStatus.topicId);
				if(t_index >= 0) {
					let s_index=assignCourse['topics'][t_index].subtopics.findIndex(s=> s.subtopicId == sub_topicStatus.subtopicId);
					if(s_index >= 0) {
						assignCourse['topics'][t_index].subtopics[s_index].status= sub_topicStatus.status;
						for(let i in assignCourse.topics) {
							if(assignCourse.topics[i].subtopics && assignCourse.topics[i].subtopics.length>0) {
								assignCourse.topics[i].status= manageCourseStatus(assignCourse.topics[i].subtopics);
							}
						}
						assignCourse.status=manageCourseStatus(assignCourse.topics);
					}
				}
				saveOrUpdate(assignCourse).then(success=> {
					logger.info(success.msg);
					resolve({success: true, msg: loggerConstants.LEARNING_STATUS_SUCCESSFULLY_UPDATED});
				},err=>{
					reject(err);
				})
			}else {
				reject(new CustomError(loggerConstants.loggerConstants.INTERNAL_ERROR));
			}
		},error=> {
			reject(err);
		})
	});
}

/*
* return calculated status based on topic/subtopic status
*/
const manageCourseStatus=(dataArr)=> {
	if(dataArr.some(data=> data.status == appConstant.LEARNING_PROGRESS_STATUS[1])) {
		return appConstant.LEARNING_PROGRESS_STATUS[1];
	}
	if(dataArr.some(data=> data.status == appConstant.LEARNING_PROGRESS_STATUS[0]) && dataArr.some(data=> data.status === appConstant.LEARNING_PROGRESS_STATUS[2])) {
		return appConstant.LEARNING_PROGRESS_STATUS[1];
	}
	if(dataArr.every(data=> data.status == appConstant.LEARNING_PROGRESS_STATUS[0])) {
		return appConstant.LEARNING_PROGRESS_STATUS[0];
	}
	if(dataArr.every(data=> data.status == appConstant.LEARNING_PROGRESS_STATUS[2])) {
		return appConstant.LEARNING_PROGRESS_STATUS[2];
	}
}

/*
* rate assign course and update course rating
*/
const rateCourse = (stuId,courseId,ratingData)=> {
	let stuRating = ratingData.rating;
	return new Promise((resolve,reject)=> {
		AssignCourse.findOneAndUpdate({studentId: stuId,courseId: courseId},{
			$set: { rating: stuRating }
		},(err,data)=> {
			if(err) {
				reject(err);
			}else {
				logger.info(loggerConstants.ASSIGN_COURSE_RATTED_SUCCESSFULLY);
				Course.findOne({_id: courseId },(err,courseDetail)=> {
					if(err) {
						reject(err);
					}else {
						let courseRating= courseDetail.rating || 0;
						let finalRating= stuRating;
						if(!courseDetail['userRatings']) {
							courseDetail['userRatings']=[];
						}
						let index=courseDetail['userRatings'].findIndex(rating=>rating.userId == stuId);
						if(index >= 0) {
							courseDetail['userRatings'].splice(index,1);
						}
						let sumOfRating= courseDetail['userRatings'].reduce((prv,cur)=> {
							return{ rating: prv['rating'] + cur['rating']};
						},{rating:0});
						if(courseDetail['userRatings'].length>0) {
							finalRating=Number.parseFloat((sumOfRating.rating+ stuRating)/(courseDetail.userRatings.length+1)).toFixed(1);
						}
						courseDetail['rating']=finalRating;
						// courseDetail['userRatings'].push({ userId: stuId,rating: stuRating});
						courseDetail['userRatings'].push(ratingData);
						let updateCourse= new Course(courseDetail);
						updateCourse.save({_id: courseId},(err,data)=> {
							if(err){
								reject(err);
							}else {
								resolve({success: true, msg: loggerConstants.COURSE_RATTED_SUCCESSFULLY,data: {courseRating: data.rating} });
							}
						});
					}
				});
			}
		})
	});
}

/*
* fetch assign course baseed on student id and course id
*/
const getAssignCourse= (stuId,courseId)=> {
	return new Promise((resolve,reject)=> {
		AssignCourse.findOne({studentId: stuId,courseId: courseId},
			(err,assignCourse)=> {
				if(err) {
					return reject(err);
				}
				resolve({success: true, msg: loggerConstants.GET_DATA_SUCCESSFULLY,data: assignCourse});
			});
	});
}


/*
* save/ update assign object  
*/
const saveOrUpdate=(dataObj)=> {
	return new Promise((resolve,reject)=> {
		let assignCourse= new AssignCourse(dataObj);
		assignCourse.save((err,data)=> {
			if(err) {
				return reject(err);
			}
			resolve({success: true, msg: loggerConstants.ASSIGN_COURSE_SUCCESSFULLY});
		});
	});
}

/*
* Add student id into course's students property. 
	This property is used to count the no. of students enrolled for the course.   
	*/
	const updateCourseStudentsList=(courseId,studentId)=> {
		return new Promise((resolve,reject)=> {
			Course.updateOne({_id: courseId },
				{$push : {students:{studentId:studentId}}},
				(err,data)=> {
					if(err) {
						return reject(err);
					}
					resolve({success: true, msg: loggerConstants.ASSIGN_COURSE_SUCCESSFULLY});
				});
		});
	}


/*
* assign course for B2B user
*/
const assignCourseToB2BUser=(courses,students)=> {
	return new Promise((resolve,reject)=> {
		let promises= courses.map(ele=> getAssignCourseObject(ele.course));
		Promise.all(promises).then(assignCourses=> {
			let assignCourseArr=[];
			for(let i in assignCourses) {
				if(assignCourses[i].topics && assignCourses[i].topics.length>0){
					for(let j in students) {
						assignCourseArr.push({ 
							courseId: courses[i].course,
							studentId: students[j]._id,
							topics: assignCourses[i].topics 
						});
					}
				}
			}
			AssignCourse.insertMany(assignCourseArr, (err, docs)=> {
				if(err) {
					return reject(err);
				}
				resolve({success: true, msg: loggerConstants.ASSIGN_COURSE_SUCCESSFULLY});
			});
		}) 
	})
}

module.exports= {
	persistAssignCourse: persistAssignCourse,
	setLearningStatus: setLearningStatus,
	rateCourse: rateCourse,
	getAssignCourse: getAssignCourse,
	assignCourseToB2BUser: assignCourseToB2BUser,
}