const nodemailer = require('nodemailer');
var request = require('request');
const Student = require('./student.entity');
const User = require('./../users/users.entity');
const AssignCourse = require ('./../assignCourses/assignCourse.entity');
const appConstant = require('../../constants').app;
const logger = require('./../../services/app.logger');
const mailer = require('./../../services/mailer');
const { getQuery }= require('./../../services/filter');
const CustomError = require('./../../services/custom-error');
const validation=require('./../../common/validation');
const userController = require('./../users/users.controller');
const assignCourseController = require('./../assignCourses/assignCourse.controller');
const Course = require('./../courses/course.entity');
const courseController = require('./../courses/course.controller');
const MAIL_CONFIG=appConstant.MAIL_CONFIG;
const loggerConstants= require('./../../constants/logger').STUDENT;
const studentHelper = require('./student.helper');
const studentflags = require('./student.flag');
const Video = require('../contents/videos/video.entity');
const Note = require('../contents/notes/note.entity');
const Keypoint = require('../contents/keypoints/keypoint.entity');
const Media = require('../contents/media/media.entity');
const Assessments = require('./../assessments/assessment.entity');
const Reference = require('../contents/references/reference.entity');
const assessmentResultController = require('./../assessmentResults/assessmentResult.controller');
const Config= require('./../../config/commonConfig');
const unfurled = require('unfurled');
const releaseCourseController = require('./../releaseCourses/releaseCourse.controller');
const ReleaseCourse = require('./../releaseCourses/releaseCourse.entity');
const _ = require('lodash');
const Teacher = require("./../teachers/teacher.entity");

/*
* save student record for type B2C
*/
const register= (student,platform)=> {
	student['email']=student.email.toLowerCase();
	return new Promise((resolve,reject)=> {
		checkUserExistence(student)
		.then(persistStudent)
		.then(student=> {
			userController.saveUserDetails(student,appConstant.USER_DETAILS.USER_ROLES[4],platform)
			.then(success=> {
				resolve(success);
			}).catch(err=> {
				reject(err);
			});
		}).catch(err=> {
			reject(err);
		});
	})
}

/*
* save student record for type B2B
*/
const save = (student,userInfo,platform)=> {
	student['email']=student.email.toLowerCase();
	return new Promise(async(resolve, reject)=> { 
		student['createdBy']={id: userInfo['userId'],role: userInfo['role'],name: userInfo['name']};
   if(userInfo['role'] === appConstant.USER_DETAILS.USER_ROLES[2]) {
    student['schoolId']=userInfo['userId'];
  }else if(userInfo['role'] === appConstant.USER_DETAILS.USER_ROLES[3]) {
   let teacher = await Teacher.findOne({_id: userInfo['userId']},'schoolId');
   if(teacher && teacher['schoolId']) {
    student['schoolId']=teacher['schoolId'];
  }else {
    logger.error(loggerConstants.TEACHER_NOT_FOUND+ ' : '+userInfo['userId']);
    reject(new Error(loggerConstants.INTERNAL_ERROR));
  }
}
checkUserExistence(student)
.then(assignDefaultCourses)
.then(persistStudent)
.then(student=> {
 userController.saveUserDetails(student,appConstant.USER_DETAILS.USER_ROLES[4],platform)
 .then(success=> {
  resolve(success);
}).catch(err=> {
  reject(err);
});
}).catch(err=> {
 reject(err);
});
});
}

/*
  validate student fields 
  */
  const validateStudentInfo=(student)=> {
  	return new Promise((resolve,reject)=>{
  		if(!student.name) {
  			reject(new CustomError('Name is required'));
  		}else if(!validation.isOnlyAlpahabetic(student.name)){
  			reject(new CustomError('Please enter valid name'));
  		}else if(!student.gender) {
  			reject(new CustomError('Gender is required'));
  		}else if(!student.email) {
  			reject(new CustomError('Email is required'));
  		}else if(!validation.isValidEmail(student.email)){
  			reject(new CustomError('Please enter valid email'));
  		}else if(!student.mobile) {
  			reject(new CustomError('Mobile number is required'));
  		}else if(!validation.isValidMobNo(student.mobile)|| student.mobile.length>10){
  			reject(new CustomError('Please enter valid mobile number'));
  		}else if(!student.class) {
  			reject(new CustomError('Class is required'));
  		}else if(!student.schoolId) {
  			reject(new CustomError('School is required'));
  		}else {
  			resolve(student);
  		}
  	});
  }

/*
 *check user already register or not 
 *based on username in user collection
 */
 const checkUserExistence=(student)=> {
 	return new Promise((resolve, reject)=> {
 		User.findOne({ "username": student.email },(err,user)=> {
 			if(err) {
 				reject(err);
 			}else if(user) {
 				reject(new CustomError(student.email + loggerConstants.USER_ALREADY_REGISTERED));
 			}else {
 				resolve(student);
 			}
 		});
 	});
 }

/*
*assign default courses to student by schoolId and class 
*deafult courses are the courses which is assign to school and a perticular class
*/
const assignDefaultCourses =(student)=> {
	return new Promise(async(resolve,reject)=> {
    try {
      if(!student['board']) {
        return reject(new CustomError(loggerConstants.BOARD_REQUIRED));
      }
      if(!student['class']) {
        return reject(new CustomError(loggerConstants.CLASS_REQUIRED));
      }
      let classWiseCourses = await releaseCourseController.getCoursesWithLatestVersion('assign_courseInfo',{'category._id': student['board'],'subcategory._id': student['class']});
      if(classWiseCourses && classWiseCourses['data']) {
        student['courses']= classWiseCourses['data'].map(course=>({courseId: course.courseId, current: course}));
      }
      resolve(student);
    }catch(err) {
     reject(err);
   }
 });
}

/*
* persist student data into student collection 
*/
const persistStudent=(studentObj)=> {
	return new Promise((resolve,reject)=> {
    studentObj['academicDetails']={
      board: studentObj['board'], 
      class: studentObj['class'],
      schoolId: studentObj['schoolId'],
    };  
    studentObj['address']={
      address1: studentObj['address'],
      country: studentObj['country'],
      state: studentObj['state'],
      city: studentObj['city'],
      pincode: studentObj['pincode'],
    };
    let student = new Student(studentObj);
    student.save((err,studentInfo)=> {
     if(err) return reject(err);
     if(studentInfo){
      studentObj['_id']=studentInfo._id;
      logger.info(loggerConstants.STUDENT_SAVE_SUCCESSFULLY);
      resolve(studentObj);
    }else {
      reject({ msg: loggerConstants.FAILED_TO_SAVE});
    }
  })
  });
}

/*
* delete  student record by mongo id
*/
const deleteStudentById=(_id,userInfo)=> {
	return new Promise(async (resolve,reject)=> {
    try {
      let student = await Student.findOne({_id:_id});
      if(!student) {
        logger.error(loggerConstants.STUDENT_NOT_FOUND);
        reject({ msg: loggerConstants.INTERNAL_ERROR});
      }
      if(userInfo['userId'] == student.createdBy.id || userInfo['role'] === appConstant.USER_DETAILS.USER_ROLES[0] || (student.academicDetails && userInfo['userId']==student.academicDetails.schoolId)) {
        Student.updateOne({_id:_id },{
          $set : {
            status: appConstant.CONTENT_STATUS[5],
            deletedBy:{
              id: userInfo.userId,
              role: userInfo.role,
              name: userInfo.name,
              date: Date.now()
            }
          }
        },(err,data) => {
          if(err) return reject(err);
          userController.updateUserInfo(student.email,{status: appConstant.CONTENT_STATUS[5]},userInfo)
          .then(success=> {
           resolve({success : true, msg : loggerConstants.UPDATE_SUCCESSSFULLY});
         }).catch(err=>reject(err));
        });
      }else {
        reject(new CustomError(loggerConstants.NO_RIGHTS));
      }
    }catch(err) {
      reject(err);
    }
  });
}

/*
* assign course to student 
* B2C user can assign course himself  
*/
const assignCourse = (studentId,courseInfo) => {
	return new Promise(async(resolve, reject) => {
		try{
			let studentInfo = await getStudentDetails(studentId,'assignCoursesInfo');
			if(!studentInfo) {
				return reject(new CustomError(loggerConstants.STUDENT_NOT_FOUND));
			}
			if(studentInfo.courses[0]) {
				if(studentInfo.courses.some(data => data.courseId == courseInfo.courseId)) {
					return reject(new CustomError(loggerConstants.COURSE_ALREADY_ASSIGN));
				}
			}
			releaseCourseController.findLatestCourse(courseInfo.courseId,null)
			.then(async latestCourse => {
				let isAssign = false;
				if(latestCourse.isPaid){
					if (latestCourse.activationMethod ===appConstant.COURSE_ACTIVATION_TYPE[0]) {
						if (studentInfo.isSubscribed) {
							isAssign = true;
						} else {
							// Make this false once mobile subscription implemented
							isAssign = true;
						//	logger.debug(loggerConstants.COURSE_ASSIGN_YOUTUBE_SUBSCRIPTION_ERROR);
						//	return reject(new CustomError(loggerConstants.COURSE_ASSIGN_YOUTUBE_SUBSCRIPTION_ERROR));
          }
        } else if(latestCourse.activationMethod ===appConstant.COURSE_ACTIVATION_TYPE[1]){
						// Add to cart implementation
						// return reject(new CustomError(loggerConstants.COURSE_ASSIGN_YOUTUBE_SUBSCRIPTION_ERROR));
					}
				} else if(!latestCourse.isPaid){
					isAssign = true;
				}
				
				if (isAssign) {
					try {
						let assignedCourse =	await assignCourseToStudent(latestCourse,studentId,courseInfo.byShare);
						logger.info(loggerConstants.ASSIGN_COURSE_PERSISTED_IN_STUDENT);
						studentHelper.updateReleaseCourseStudentsList(courseInfo.courseId,latestCourse.version,studentId)
						.then(success => {
							resolve(success);
						},error=> {
							reject(error);
						});
					}catch(err) {
						reject(err);
					}
				} else {
					logger.error(loggerConstants.COURSE_ASSIGN_ERROR);
					return reject(new CustomError(loggerConstants.COURSE_ASSIGN_ERROR));
				}

			}).catch(err => {
				reject(err);
			});
    }catch(error) {
     reject(error);
   }
 });
}

/*
* refine assign course
*/
const refineAssignCourse = course => {
	course=course.toObject();
	delete course._id;
	course['topics'] = course.topics.map(topic=> {
		delete topic.status;
		topic.subtopics.map(subtopic=> {
			delete subtopic.status;
			subtopic.learningPaths.map(lp=> {
				delete lp.status;
				return lp;
			});
			return subtopic;
		});
		return topic;
	});
	return course;
}

/*
 * fetch course details based on course id 
 */
 const assignCourseToStudent= async (course,studentId,byShare) => {
 	try {
 		course = refineAssignCourse(course);
 		let update = { 
 			$push: { 
 				courses: { courseId: course.courseId,	current: course	}
 			} 
 		};
 		// Disabled updating subscription details as we are using youtube sucscription instead of facebook
 		// if(byShare) {
 		// 	update=getSubscriptionDetails(update,true)
 		// }
 		return await Student.findOneAndUpdate({ _id: studentId },update, {new: true});
 	} catch(error) {
 		throw error;
 	}
 }

/*
* get subscription detials
*/
const getSubscriptionDetails=(update,isPushTypePipe=false)=> {
	let now = new Date();
	let endDate = new Date(now.setDate(now.getDate() + Config.SUBSCRIPTION_DAYS));
	update['$set']={};
	if(!isPushTypePipe) {
		update['$push']={};
	}
	update['$set']['isSubscribed'] = true;
	update['$push']['subscriptions'] = 
	{
		startDate: new Date(),
		endDate: endDate
	}
	update['$set']['subscriptionEndDate']=endDate;
	return update;
}

//upgrade course version for student
const upgradeOrDowngradeCourseVersion = (courseId,studentId,isUpradeCourse=false) => {
	return new Promise((resolve,reject) => {
		getStudentAssignCourse(studentId, courseId).then(studentDetails => {
			let temp = course = {};
			if(!studentDetails.courses[0] ) {
				return reject(new CustomError(loggerConstants.NO_ASSIGN_COURSE_FOUND));
			}
			if(!isUpradeCourse) {
				if(studentDetails.courses[0].last) {
					temp= studentDetails.courses[0].current;
					course.current = studentDetails.courses[0].last;
					course.last = temp;
					updateAssignedCourse(courseId,studentId,course).then(updatedInfo => {
						resolve({success: true, msg: loggerConstants.REASSIGN_COURSE_FROM_COURSE_HISTORY});
					});
				}else {
					reject(new CustomError(loggerConstants.NO_VERSION_HISTORY_AVAILABLE_FOR_COURSE));
				}
			}else {
				releaseCourseController.findLatestCourse(courseId,null)
				.then(async latestCourse => {
					studentDetails.courses[0].current.version
					if(latestCourse.version === studentDetails.courses[0].current.version) {
						return resolve({success: true, msg: loggerConstants.COURSE_UP_TO_DATE});
					}
					course.last = studentDetails.courses[0].current;
					course.current = refineAssignCourse(latestCourse);;
					updateAssignedCourse(courseId,studentId,course).then(updatedInfo => {
						resolve({success: true, msg: loggerConstants.COURSE_VERSION_UPDATED_SUCCESSFULLY});
					});
				})
			}
		}).catch(err => {
			reject(err);
		});
	});
} 

/*
* get student assign course
* return array of courses at 0 index you will get your course
*/
const getStudentAssignCourse = (studentId, courseId,fields='courses') => Student.findOne({
	_id: studentId,'courses.courseId': courseId},{
		'courses.$' : 1
	}).exec();

/*
* get student assign course
* return array of courses at 0 index you will get your course
*/
const getStudentDetails = async (studentId,query) => {
	try {
		return await Student.findById(studentId).select(studentflags[query].queryFields).exec();
	}catch (error) {
		throw error;
	}
}

/*
* update student old and new course based on course id
* return array of courses at 0 index you will get your course
*/
const updateAssignedCourse = (courseId,studentId,course) => Student.findOneAndUpdate({ 
	_id: studentId,
	'courses.courseId': courseId
},{
	$set:{
		'courses.$.last': course.last,
		'courses.$.current': course.current,
	}
},{
	"fields": { "courses": 1},
	"new": true 
}).exec();

	/*
	* rate assigned course by student and update course overall rating
	*/
	const rateCourse = (userId,courseId,ratingData)=> {
		let stuRating = ratingData.rating;
		return new Promise((resolve,reject)=> {
			Student.updateOne({"_id": userId,"courses.course": courseId},{
				$set: { "courses.$.userRating": ratingData }
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
							let index=courseDetail['userRatings'].findIndex(rating => rating.userId == userId);
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

//Get dashboard data for student.
/*function getMyDashboard(id, queryFlag) {
	let condition= {'_id': id};
	return new Promise((resolve,reject)=> {
		Student.findOne(condition)
		.populate({
			path:'courses.course',
			select: studentflags[queryFlag].populateFields,
			match: {status: appConstant.STATUS.ACTIVE},
		})
		.select(studentflags[queryFlag].queryFields)
		.exec((err,student)=> {
			if(err) {
				logger.error(err);
				reject({ msg: loggerConstants.INTERNAL_ERROR});
			}else if(student) {
				student = student.toObject();
				student['courses'] = studentHelper.processMyCourses(student.courses, queryFlag);
				resolve({success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: student});
			}else {
				reject({success : false, msg :"No user data not found "});
			}
		});
	});
};*/

/*
* get dashboard aggregated data
*/
const getDashboardDetails = (id, queryFlag)=> {
	return new Promise(async (resolve,reject)=> {
		let dashboardInfo= {
			courses: [],
			assessmentResultDetails: [],
			subscriptionEndDate: null,
			isSubscribed: false,
      assessmentResults: [],
    };
    try {
      dashboardInfo['assessmentResults'] = await assessmentResultController.getResultsByStudentId(id);
      let studentInfo = await getStudentDetails(id,queryFlag);
      if(!studentInfo) {
        return {success : false, msg: loggerConstants.STUDENT_NOT_FOUND};
      }
      dashboardInfo['isSubscribed']=studentInfo.isSubscribed;
      if(studentInfo.subscriptionEndDate) {
        dashboardInfo['subscriptionEndDate'] = studentInfo.subscriptionEndDate;
      }
      if(studentInfo.courses && studentInfo.courses[0]) {
        studentInfo = studentInfo.toObject();
        let courses=studentInfo['courses']
        let refineCourses = courses.map(data => data.current);
        let courseFilterData=refineCourses.map(course=> {
          let course_info={courseId: course.courseId,title: course.title}
          course_info['topics']=course.topics.map(t=>({topicId: t.topicId,title: t.title}));
          delete course.topics;
          return course_info;
        })
        dashboardInfo['courseFilterData']=courseFilterData;
        if(refineCourses.length>3) {
         refineCourses = refineCourses.splice(0,3);
       }
       
       refineCourses =_.orderBy(refineCourses, ['assignedOn'],['desc']);
       dashboardInfo['courses']=refineCourses;
     }
     resolve({success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: dashboardInfo});
   }catch(error) {
     reject(error);
   }
 });
}

//get all assigned courses to student based on queryFlag
const getMyCourses = async (_id,queryFlag) => {
	try{
		let studentInfo = await getStudentDetails(_id,queryFlag);
		if(!studentInfo) {
			return {success : false, msg: loggerConstants.STUDENT_NOT_FOUND};
		}
		if(!studentInfo.courses[0]) {
			return {success : false, msg: loggerConstants.NO_ASSIGN_COURSE_FOUND,data : []};
		}
		if (queryFlag === 'assignCoursesInfo_q2') {
			let courses=studentInfo.courses.toObject()
			courses = courses.map(data => data.current).map(course=> {
				course['totalTopics']= course.topics.length || 0;
				delete course['topics'];
				return course;
			});
			courses =_.orderBy(courses, ['assignedOn'],['desc']);
			return {success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: courses};
		}
		if (queryFlag === '3') {
			let stuInfo= {};
			if(studentInfo['academicDetails'] && studentInfo['academicDetails']['qualification']) {
				stuInfo['qualification']= studentInfo['academicDetails']['qualification'];
			}
			stuInfo['courseCount']=studentInfo.courses.length;
			return {success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: stuInfo};
		}
		return {success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: studentInfo.courses.map(data => data.current)};

	}catch(error) {
		throw error;
	}

}

//get student info based on queryFlag
const getStudentInfo= async (_id,queryFlag) => { 
	try{
		let studentInfo = await getStudentDetails(_id,queryFlag);
		if(!studentInfo) {
			return {success : false, msg: loggerConstants.STUDENT_NOT_FOUND};
		}
		if(studentInfo.courses && studentInfo.courses[0]) {
			studentInfo['courses']=studentInfo.courses.map(data => data.current)
		}
		return {success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data:  studentInfo};
	}catch(error) {
		throw error;
	}
}

//get student info based on queryFlag
const getMyCourseDetails= async (_id,courseId,query) => { 
	return new Promise((resolve,reject) => {
		let fields = studentflags[query].queryFields
		getStudentAssignCourse(_id, courseId,fields).then(studentDetails => {
			if(studentDetails.courses[0] && studentDetails.courses[0].current ) {
				let currentCourse = studentDetails.courses[0].current;
				if(query==='course_details_q1') {
					let courseInfo= {
						isHistoryAvailable: false,
						isUpdateAvailable: false
					};
					if(studentDetails.courses[0].last) {
						courseInfo['isHistoryAvailable']=true;
					}
					releaseCourseController.findLatestCourse(courseId,'version').then(latestCourse => {
						if(latestCourse && latestCourse.version) {
							if(currentCourse.version < latestCourse.version) {
								courseInfo['isUpdateAvailable']=true;
							}
						}
						courseInfo['courseDetails'] = studentHelper.refineCourseDetails(query,currentCourse);
						resolve({success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: courseInfo});
					},error=> {
						return reject(error);
					});
				}else {
					let courseDetails = studentHelper.refineCourseDetails(query,currentCourse);
					resolve({success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: courseDetails});
				}
			}else {
				return reject(new CustomError(loggerConstants.NO_ASSIGN_COURSE_FOUND));
			}
		},error => reject(err));
	});
}

//get assigned course to student based on courseId and queryFlag
/*function getMyCourse(_id, courseId, queryFlag) {
	let courses=[];
	let promises=[];
	let condition= {'_id': _id};
	return new Promise((resolve,reject)=> {
		Student.findOne(condition)
		.populate({
			path:'courses.course',
			populate: {
				path:'topics',
				populate: {
					path: 'subtopics',
					select: studentflags[queryFlag].populateSubtopics,
					match: {status: appConstant.STATUS.ACTIVE},
				},
				select: studentflags[queryFlag].populateTopics,
				match: {status: appConstant.STATUS.ACTIVE},
			},
			select: studentflags[queryFlag].populateFields,
			match: {status: appConstant.STATUS.ACTIVE},
		})
		.select(studentflags[queryFlag].queryFields)
		.exec((err,student)=> {
			if(err) {
				logger.error(err);
				reject({ msg: loggerConstants.INTERNAL_ERROR});
			}else if(student) {
				let myCourse = studentHelper.processCourse(student.courses, courseId, queryFlag);
				resolve({success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: myCourse});
			}else {
				reject({success : false, msg :"No user data not found "});
			}
		});
	});
};*/

//get topic details of assigned course  to student based on courseId, topicId, and queryFlag
function getMyCourseTopic(_id, courseId, topicId, queryFlag) {
	let courses=[];
	let promises=[];
	let condition= {'_id': _id};
	return new Promise((resolve,reject)=> {
		Student.findOne(condition)
		.populate({
			path:'courses.course',
			populate: {
				path:'topics',
				populate: {
					path: 'subtopics',
					select: studentflags[queryFlag].populateSubtopics,
				},
				select: studentflags[queryFlag].populateTopics,
				match: {"_id": topicId},
			},
			select: studentflags[queryFlag].populateFields,
			match: {"_id": courseId},
		})
		.select(studentflags[queryFlag].queryFields)
		.exec((err,student)=> {
			if(err) {
				logger.error(err);
				reject({ msg: loggerConstants.INTERNAL_ERROR});
			}else if(student) {
				let myCourse=student.courses.find(data=> data.course && data.course._id == courseId);
				if(!myCourse) {
					return reject({success : false, msg :"No assign course found"});
				}
				let topicDetails = studentHelper.processTopic(student.courses, courseId, topicId, queryFlag);
				let callCounter=0,resCounter=0;
				if(topicDetails.subtopics) {
					topicDetails.subtopics.forEach((stopic,s_index)=> {
						if(stopic.learningPaths) {
							stopic.learningPaths.forEach((lpath,l_index)=> {
								if(lpath.mainContent) {
									getLeraningPathContent(lpath.mainContent,{s_index: s_index,l_index: l_index},(err,mc_details,indexs)=> {
										if(err) { return reject(err); }
										let { s_index,l_index }=indexs;
										topicDetails.subtopics[s_index].learningPaths[l_index].mainContent=mc_details || {};
										if(lpath.otherContents.length > 0) {
											lpath.otherContents.forEach((o_content,c_index)=> {
												callCounter++;
												getLeraningPathContent(o_content,{ s_index: s_index, l_index: l_index, c_index: c_index },
													(err,oc_details,indexs)=> {
														if(err) { return reject(err);	}
														resCounter++;
														let { s_index,l_index,c_index }=indexs;
														topicDetails.subtopics[s_index].learningPaths[l_index].otherContents[c_index]=oc_details || {};
														if(callCounter===resCounter) {
															resolve({success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: topicDetails});
														}
													});
											})
										}
									});
								}
							});
						}
					});
				}else {
					resolve({success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: topicDetails});
				}
			}else {
				reject({success : false, msg :"No user data not found "});
			}
		});
	});
};

//get learning path contents
const getLeraningPathContent=(content,indexs,callback)=> {
	let schemaRef=getSchemaRef(content.type);
	schemaRef.findOne({ _id: content.contentId },(err,contentDetails)=> {
		callback(err,contentDetails,indexs)
	});
}

//Get learning content based on contentId and type
function getLearningContent(contentId, type){
	let ContentModel ='';
	if (type === 'videos') {
		ContentModel = Video;
	} else if (type === 'notes') {
		ContentModel = Note;
	} else if (type === 'keypoints' || type === 'keyPoints') {
		ContentModel = Keypoint;
	} else if (type === 'media') {
		ContentModel = Media;
	} else if (type === 'references') {
		ContentModel = Reference;
	}
	return new Promise((resolve,reject)=>{
		ContentModel.findOne({'_id': contentId },(err,data)=>{
			if(err){
				logger.error(err.message)
				reject({ msg:loggerConstants.INTERNAL_ERROR});
			}else if(!data){
				reject({ success:false, msg: loggerConstants.WE_COULD_NOT_FOUND_ANY_CONTENT_ASSOCIATED_WITH + contentId})
			}else {
				let responseDetails = {
					success:true,
					msg:loggerConstants.DATA_GET_SUCCESSFULLY,
					data: data
				}
				if (type === 'references') {
					unfurled(data.url)
					.then(urlInfo=> {
						responseDetails['urlInfo']=urlInfo;
						resolve(responseDetails);
					}).catch(err=> {
						resolve(responseDetails);
					})
				}else {
					resolve(responseDetails);
				}
			}
		});
	});
}

// get url details
const getUrlDetails = async url=> {
	return new Promise((resolve,reject)=> {
		let data={};
		data['url']=url;
		unfurled(url).then(urlInfo=> {
			data['urlInfo']=urlInfo;
			resolve({success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: data});
		}).catch(err=> {
			resolve({success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: data});
		});
	});
}

/* ==================================== Assign Courses =====================================================*/

//get all student data
const getStudents=(queryParams={},userInfo) => {
	return new Promise(async(resolve,reject)=> {
		let filterParams=getQuery(queryParams);
		let query= filterParams['$where'] || {};
		let limit= +filterParams['$limit'] || 0;
		let sort= filterParams['$orderby'] || { 'createdBy.date': -1 };
   if(userInfo['role']==appConstant.USER_DETAILS.USER_ROLES[2]) {
    query['academicDetails.schoolId']=userInfo['userId'];
  }
  if(userInfo['role'] === appConstant.USER_DETAILS.USER_ROLES[3]) {
    let teacher = await Teacher.findOne({_id: userInfo['userId']},'schoolId');
    if(teacher && teacher['schoolId']) {
      query['academicDetails.schoolId']=teacher['schoolId'];
    }else {
      logger.error(loggerConstants.TEACHER_NOT_FOUND+ ' : '+userInfo['userId']);
      reject(new Error(loggerConstants.INTERNAL_ERROR));
    }
  }
  //query['status'] = { $ne: appConstant.CONTENT_STATUS[5]}
  Student.find(query)
  .limit(limit)
  .sort(sort)
  .exec((err,students)=> {
   if(err) {
    logger.error(err)
    reject({ msg:loggerConstants.INTERNAL_ERROR});
  } else if(students) {
    resolve({success: true, msg:loggerConstants.DATA_GET_SUCCESSFULLY,data: students})
  }else {
    resolve({success: true, msg: loggerConstants.NO_DATA_AVAILABLE});
  }
});
});
}

//get student data based in id
function findById(_id){
	return new Promise((resolve,reject)=>{
		Student.findOne({'_id': _id },'name email mobile profilePic gender profileUrls academicDetails address status',(err,data)=>{
			if(err){
				logger.error(err.message)
				reject({ msg:loggerConstants.INTERNAL_ERROR});
			}else if(!data){
				reject({ success:false, msg: loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + _id})
			}else{
				resolve({success:true, msg:loggerConstants.DATA_GET_SUCCESSFULLY, data: data})
			}
		});
	});
}

//find students by school id
const getStudentsBySchoolId = (schoolId)=> {
	return new Promise((resolve,reject)=> {
		Student.find({ 'schoolId': schoolId })
		.exec((err,students)=> {
			if(err) {
				logger.error(err.message)
				reject({ msg:'Internal error occoured'});
			} else if(students) {
				resolve({success: true, msg: "data get successfully",data: students})
			}else {
				resolve({success: true, msg: 'No data available'});
			}
		});
	});
};

//get classes by school code
function getClassesBySchoolId(code) {
	return new Promise((resolve,reject)=>{
		Student.find({ 'schoolId': code })
		.distinct('class', function(err, classes) {
			if(err) {
				logger.error(err);
				reject({ msg: loggerConstants.INTERNAL_ERROR});
			}else {
				resolve({success:true, msg: 'Data get successfully', data: classes});
			}
		});
	});
};


// update student data
const update=(studentObj,_id, currentUser)=>{
	return new Promise(async (resolve,reject)=> {
   try {
    let isClassChanged=false;
    let student = await Student.findOne({_id: _id});
    if(!student) {
      logger.error(loggerConstants.STUDENT_NOT_FOUND);
      reject({ msg: loggerConstants.INTERNAL_ERROR});
    }
    if(currentUser['userId'] == student.createdBy.id || currentUser['role'] === appConstant.USER_DETAILS.USER_ROLES[0] || (student.academicDetails && currentUser['userId']==student.academicDetails.schoolId)) {
      if(student['academicDetails'] && student['academicDetails']['class']!= studentObj['class'] && studentObj['board']) {
        studentObj= await assignDefaultCourses(studentObj);
        isClassChanged=true;
      }
      let stuInfo = {
       name: studentObj.name,
       email: studentObj.email,
       mobile: studentObj.mobile,
       gender: studentObj.gender,
       academicDetails: {
        board: studentObj['board'], 
        class: studentObj['class'],
        schoolId: studentObj['schoolId'],
      },
      address: {
        address1: studentObj['address'],
        country: studentObj['country'],
        state: studentObj['state'],
        city: studentObj['city'],
        pincode: studentObj['pincode'],
      },
      status: studentObj.status,
    }
    if(isClassChanged) {
      stuInfo['courses']=studentObj['courses'];
    }
    Student.findOneAndUpdate({_id:_id},{
      $push: {
       updatedBy: {
         id: currentUser.userId,
         role: currentUser.role,
         name: currentUser.name,
         date: Date.now()
       }
     },
     $set: stuInfo
   },(err,data)=>{
    if(err) return reject(err);
    let update={};
    if(student.status!==studentObj.status) {
      update['status']=studentObj.status;
    } 
    if(student.name!== studentObj.name) {
      update['name']=studentObj.name;
    }
    if(update['name'] || update['status']) {
      userController.updateUserInfo(studentObj.email,update,currentUser)
      .then(success=> {
       resolve({success : true, msg : loggerConstants.UPDATE_SUCCESSSFULLY});
     }).catch(err=>reject(err));
    }else{
      resolve({success : true, msg : loggerConstants.UPDATE_SUCCESSSFULLY});
    }
  });
  }else {
    reject(new CustomError(loggerConstants.NO_RIGHTS));
  }

}catch(err) {
  reject(err);
}
});
};

//get data from course based on sub-category id
function getAssignCourses(element) {
	return new Promise((resolve,reject)=>{
		Course.find({'subcategory': {$in:element.subCategories}},function(err,data){
			resolve(data);
		});
	});
}

//assign courses based on school id and class
const assignCoursesToClass = (schoolId,standard,courses,userId)=> {
	return new Promise((resolve,reject)=> {
		let query={ 
			"schoolId": schoolId,
			"class": standard,
			"status": appConstant.STATUS.ACTIVE,
			"type": appConstant.STUDENT.TYPE[1]
		};
		let courseArr=[];
		let newAssignCourses=[];
		Student.findOne(query,(err,student)=> {
			if(err){
				return reject(err);
			}
			if(student && student.courses && student.courses[0]) {
				for(let i in courses) {
					let courseObj = student.courses.find(assignCourse=> assignCourse.course == courses[i].id);
					if(!courseObj) {
						let obj= {};
						obj.course= courses[i].id;
						obj.category= courses[i].category;
						obj.subcategory= courses[i].subcategory;
						obj.assignedBy= userId;
						student.courses.push(obj);
						newAssignCourses.push(obj);
					}
				}
				courseArr=student.courses;
			}else {
				courseArr=courses.map(ele=> {
					let obj= {};
					obj.course= ele.id;
					obj.category= ele.category;
					obj.subcategory= ele.subcategory;
					obj.assignedBy= userId;
					return obj;
				});
				newAssignCourses=courseArr;
			}
			Student.update(query,{ 
				$set: { courses: courseArr }
			}, { multi: true }, (err,data)=> {
				if(err) {
					logger.error(err);
					reject({ msg: loggerConstants.INTERNAL_ERROR});
				} else {
					Student.find(query,['_id','name'],(err,students)=> {
						assignCourseController.assignCourseToB2BUser(newAssignCourses,students)
						.then(success=> {
							resolve(success);
						},error=> {
							reject(err);
						})
					})
					resolve({success : true, msg : loggerConstants.COURSE_UPDATE_SUCCESSSFULLY});
				} 
			});
		})
	});
}

//get assign courses to student by school id and class
const getAssignCoursesToClass=(schoolId,stuClass)=> {
	return new Promise((resolve,reject)=>{
		Student.findOne({"schoolId": schoolId,"class": stuClass})
		.populate('courses.course')
		.populate('courses.category')
		.populate('courses.subcategory')
		.exec((err, student)=> {
			if(err) {
				logger.error(err);
				reject({ msg: loggerConstants.INTERNAL_ERROR});
			}else if(student && student.courses && student.courses.length>0) {
				let stuCourses=student.courses;
				let courseDetails=[];
				stuCourses.map(assignCourse=> {
					let courseDetail={};
					if(assignCourse.category) {
						courseDetail.category= {
							id: assignCourse.category._id,
							itemName: assignCourse.category.name,
						}
					}
					if(assignCourse.subcategory){
						courseDetail.subcategory= {
							id: assignCourse.subcategory._id,
							itemName: assignCourse.subcategory.name,
							category: assignCourse.subcategory.categoryId,
						}
					}
					if(assignCourse.course) {
						courseDetail.course= {
							id: assignCourse.course._id,
							itemName: assignCourse.course.title,
							category: assignCourse.course.category,
							subcategory: assignCourse.course.subcategory,
						}
					}
					courseDetails.push(courseDetail);
				});
				resolve({success : true, msg :"Assign courses "+loggerConstants.GET_DATA_SUCCESSFULLY, data: courseDetails});
			}else{
				resolve({success : true, msg : "Assign courses "+loggerConstants.GET_DATA_SUCCESSFULLY,data: []});
			}
		});
	})
}

//get assigned courses by school id and class
/*const getAssignCoursesBySchoolAndClass=(schoolId,stuClass)=> {
 return new Promise((resolve,reject)=> {
  Student.findOne({"schoolId": schoolId,"class": stuClass},(err,student)=> {
    if(err) {
      logger.error(err);
      reject({ msg: loggerConstants.INTERNAL_ERROR});
    }else if(student) {
      resolve(student.courses);
    }else {
      resolve([]);
    }
  });
});
} */

// Update profile of user
let  updateProfile = (profileData,username)=>{
	return new Promise((resolve,reject) =>{
		Student.updateOne({ 'email': username },{
			$set: {
				firstName:profileData.firstName,
				lastName:profileData.lastName,
				mobile:profileData.mobile,
				gender:profileData.gender,
				year:profileData.year,
				schoolId:profileData.schoolId,
				class:profileData.class,
				rollNo:profileData.rollNo,
				updatedOn:Date.now()
			}
		}, (err, data) => {
			if(err) {
				logger.error(err.message)
				reject({ msg:'Internal error occoured'});
			} else if (data) {
				User.updateOne({'username': username},
				{
					$set : {
						name:profileData.firstName +' '+ profileData.lastName
					}
				},(err,data)=>{
					if(err){
						logger.error('Invalid username' + err);
						reject('Invalid username' + err);
					} else if(data){
						logger.info("Profile is successfully updated for " + username);
						resolve("Profile is successfully updated for " + username)   
					}

				})
			}
		});
	})
}

/*
* update user subscription detials 
*/
const updateSubscription= (userInfo, youtubeToken)=> {
	return new Promise((resolve,reject)=> {
		let update ={};
		if (youtubeToken) {
			// Set get method options
			var options = {
				url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${youtubeToken}`,
			};

			// Get request to verify youtube access token 
			request.get(options, function(error, response, body){
				body = JSON.parse(body);
				if(body['error_description'] && body['error_description'] === 'Invalid Value'){
					reject({success:false, msg:'Youtube access token verification failed'});
				} else if(body['exp'] && (body['exp'] >= (+ new Date()/ 1000))) {
					update=getSubscriptionDetails(update);
					update['updatedBy']=userInfo.userId,
					Student.findOneAndUpdate({_id: userInfo.userId},update, {new: true},(err,data)=> {
						if(err) {
							reject(err);
						}else {
							resolve({ success:true, msg: loggerConstants.SUBSCRIPTION_UPDATE_SUCCESSSFULLY, data: { subscriptionEndDate: data.subscriptionEndDate }});
						}
					});
				}
			});
		}
	})
}

/*
* update learning path status
*/
const updateLearningPathStatus= (learningStatusInfo,userInfo)=> {
	return new Promise((resolve,reject)=> {
		getStudentAssignCourse(userInfo.userId,learningStatusInfo.courseId).then(student=> {
			if(student && student.courses && student.courses[0] && student.courses[0].current) {
				let course =student.courses[0].current;
				learningStatusInfo['status']=appConstant.LEARNING_PROGRESS_STATUS[2];
				setLearningStatus(course, learningStatusInfo, userInfo).then(success=> {
					resolve({success: true, msg: success.msg});
				},err=>{
					reject(err);
				})
			}else {
				reject({success: false, msg: loggerConstants.INTERNAL_ERROR});
			}
		}).catch(error=> {
			reject(error);
		})
	});
}

/*
* fetch student assigned course baseed on student id and course id
*/
const getAssignCourseDetails= (stuId,courseId)=> {
	return new Promise((resolve,reject)=> {
		Student.findOne({'_id': stuId,'courses.courseId': courseId},{
			'courses.$' : 1
		}, (err,assignCourse)=> {
			if(err) {
				return reject(err);
			}
			resolve({success: true, msg: loggerConstants.GET_DATA_SUCCESSFULLY,data: assignCourse});
		});
	});
}

/*
* update learning path status 
* based on learning path status update subtopic status
* based on subtopic status update topic status 
* based on topic status update course status
*/
const setLearningStatus = (assignCourse,learningStatusInfo,userInfo)=> {
	return new Promise((resolve,reject)=> {
		if(assignCourse.topics && assignCourse.topics.length>0) {
			let t_index = assignCourse.topics.findIndex(t=> t.topicId == learningStatusInfo.topicId);
			if(t_index >= 0) {
				let s_index=assignCourse['topics'][t_index].subtopics.findIndex(s=> s.subtopicId == learningStatusInfo.subtopicId);
				if(s_index >= 0) {
					let lp_index=assignCourse['topics'][t_index].subtopics[s_index].learningPaths.findIndex(lp=> lp._id == learningStatusInfo.learningPathId);
					if(lp_index >= 0) {
						assignCourse['topics'][t_index].subtopics[s_index].learningPaths[lp_index].status= learningStatusInfo.status;
						for(let i in assignCourse.topics) {
							if(assignCourse.topics[i].subtopics && assignCourse.topics[i].subtopics.length>0) {
								for(let j in assignCourse.topics[i].subtopics) {
									if(assignCourse.topics[i].subtopics[j].learningPaths && assignCourse.topics[i].subtopics[j].learningPaths.length>0) {
										assignCourse.topics[i].subtopics[j].status= manageCourseStatus(assignCourse.topics[i].subtopics[j].learningPaths,true);
										assignCourse.topics[i].subtopics[j].progress= calculateSubTopicProgress(assignCourse.topics[i].subtopics[j].learningPaths);
									}
								}
								assignCourse.topics[i].status= manageCourseStatus(assignCourse.topics[i].subtopics);
								assignCourse.topics[i].progress= calculateProgress(assignCourse.topics[i].subtopics,'learningPaths');
							}
						}
						assignCourse.status=manageCourseStatus(assignCourse.topics);
						assignCourse.progress=calculateProgress(assignCourse.topics,'subtopics');
					}
				}
			}
			updateAssignCourse(learningStatusInfo.courseId,assignCourse,userInfo).then(success=> {
				logger.info(success.msg);
				resolve({success: true, msg: loggerConstants.COURSE_LEARNING_STATUS_UPDATED_SUCCESSFULLY});
			},err=>{
				reject(err);
			})
		}else {
			reject(new CustomError(loggerConstants.INTERNAL_ERROR));
		}
	});
}

/*
* calculate subtopics progress
*/
const calculateSubTopicProgress= (dataArr)=> {
	let complete = dataArr.filter(data=> data.status === appConstant.LEARNING_PROGRESS_STATUS[2]);
	let progress = (complete.length*100)/dataArr.length;
	if(progress > 0) {
		progress=progress.toFixed(2);
	}
	return progress;
}

/*
* calculate progress
*/
const calculateProgress= (items,prop)=> {
	let itemsToInclude = items.filter(item=> item[prop].length>0);
	let sumProgressCounter= itemsToInclude.reduce((prv,cur)=> {
		return { progress: prv['progress']+cur['progress']};
	},{ progress:0 });
	let progressAvg = sumProgressCounter['progress']/itemsToInclude.length;
	
	if(progressAvg > 0) {
		progressAvg=progressAvg.toFixed(2);
	}
	return progressAvg;
}

/*
* return calculated status based on leraningPath, topic, subtopic status
*/
const manageCourseStatus=(dataArr,isUpdateForLPStatus=false)=> {
	if(!isUpdateForLPStatus) {
		if(dataArr.some(data=> data.status == appConstant.LEARNING_PROGRESS_STATUS[1])) {
			return appConstant.LEARNING_PROGRESS_STATUS[1];
		}
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
* save/update assign object  
*/
const updateAssignCourse=(courseId,course,userInfo)=> {
	return new Promise((resolve,reject)=> {
		Student.findOneAndUpdate({ 
			_id: userInfo.userId,
			'courses.courseId': courseId
		},{
			$set:{
				'courses.$.current': course,
			}
		},{
			"fields": { "courses": 1},
			"new": true 
		},(err,data)=> {
			if(err) {
				return reject(err);
			}
			resolve({success: true, msg: loggerConstants.COURSE_LEARNING_STATUS_UPDATED_SUCCESSFULLY});
		});
		/*Student.updateOne({"_id": userInfo.userId,"courses.course": courseId},{
			$set: {
				'courses.$.topics': courseDetail.topics,
				'courses.$.status': courseDetail.status,
				'courses.$.progress': courseDetail.progress,
			}
		});*/
	});
}

/* start update status request  4 may Rohit*/
const updateStatus = (students, updateDetails)=>{
	return new Promise((resolve,reject)=>{
		Student.update({ _id: { $in: students} },{
			$set: updateDetails
		},{multi: true},(err,response)=>{
			if(err){ 
				reject(err);
			} else {
				if(updateDetails.status) {
					User.update({userId: { $in : students}},{
						$set: updateDetails
					}, {multi : true},(err,response)=>{
						if(err) {
							reject(err);
						} else{
							resolve({success: true, msg: loggerConstants.STUDENT_STATUS_SUCCESSFULLY_UPDATED});
						} 
					})
				}else {
					resolve({success: true, msg: loggerConstants.STUDENT_STATUS_SUCCESSFULLY_UPDATED});
				}
			}
		});
	});
}
/* end update status request  4 may Rohit*/

/*
* get content reference based on type
*/
const getSchemaRef=(contentType)=> {
	let ContentModel ='';
	if (contentType === 'videos') {
		ContentModel = Video;
	} else if (contentType === 'notes') {
		ContentModel = Note;
	} else if (contentType === 'keypoints' || contentType === 'keyPoints'  ) {
		ContentModel = Keypoint;
	} else if (contentType === 'media') {
		ContentModel = Media;
	} else if (contentType === 'references') {
		ContentModel = Reference;
	}else if (contentType === 'assessments') {
		ContentModel = Assessments;
	}
	return ContentModel;
}

const updateAssignCoursesData = (studentId)=> {
	return new Promise(async(resolve,reject) => {
		let student = await Student.findOne({ _id: studentId },{email:1,'courses': 1});
		if(!student) {
			logger.info(`No data found for status='Active'`);
			return reject(`No Student Found`);
		}
		let assignCourses = student.courses.toObject().map(data=> data.course);
		let resCounter=0;
		assignCourses.forEach(courseId => {
			findLatestCourse(courseId,null).then(async latestCourse => {
				try {
					let assignedCourse =	await assignCourseToStudent(latestCourse,studentId,true);
					logger.info(loggerConstants.ASSIGN_COURSE_PERSISTED_IN_STUDENT + " courseId: "+latestCourse.courseId);
					studentHelper.updateReleaseCourseStudentsList(latestCourse.courseId,latestCourse.version,studentId)
					.then(async success => {
						++resCounter;
						logger.info("Student details updated in release course collection successfully");
						if(resCounter === assignCourses.length) {
							let student = await Student.findOne({ _id: studentId },{email:1,'courses': 1});
							let newCourses = student.courses.splice(assignCourses.length);
							Student.updateOne({_id: studentId},{$set: {
								courses: newCourses
							}},(error,data)=> {
								if(error) {
									logger.error('Failed to remove existing data');
									return reject(error);
								}
								resolve(success);
							})
						}
					},error=> {
						reject(error);
					});
				}catch(err) {
					reject(err);
				}
			}).catch(err => {
				reject(err);
			});
		});
	});
}

const findLatestCourse = (courseId,fields) => {
	return new Promise((resolve, reject) => {
		ReleaseCourse.findOne({courseId: courseId})
		.sort('-version')
		.select(fields)
		.exec((err,releaseCourse) => {
			if(err) return reject(err);
			resolve(releaseCourse);
		});
	});
}

const updateClass=(studentClassObj,_id)=>{
	return new Promise((resolve,reject)=>{
   Student.findOneAndUpdate({_id:_id },{
    $set:{
     "academicDetails.qualification" : studentClassObj
   }
 },(err,data)=>{
  if(err) {
   logger.error(err.message)
   reject({ msg:'Internal error occoured'});
 } else{
   logger.info(loggerConstants.CLASS_IS_SUCCESSFULLY_UPDATED)
   resolve({ success: true, msg: loggerConstants.CLASS_IS_SUCCESSFULLY_UPDATED });
 }
});
 });
}

//get student performance report
const getMyPerformance = studentId=> {
  return new Promise(async(resolve, reject) => {
    let performanceInfo = {};
    try {
      performanceInfo['assessmentResults'] = await assessmentResultController.getResultsByStudentId(studentId);
      let studentInfo = await getStudentDetails(studentId,'dashboard');
      if(!studentInfo) {
        return {success : false, msg: loggerConstants.STUDENT_NOT_FOUND};
      }
      if(studentInfo.courses && studentInfo.courses[0]) {
        studentInfo = studentInfo.toObject();
        let courses=studentInfo['courses']
        let refineCourses = courses.map(data => data.current);

        performanceInfo['courseFilterData']=refineCourses.map(course=> {
          let course_info={courseId: course.courseId,title: course.title}
          course_info['topics']=course.topics.map(t=>({topicId: t.topicId,title: t.title}));
          delete course.topics;
          return course_info;
        });
      }
      resolve({success : true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: performanceInfo});
    }catch(error) {
     reject(error);
   }
 });
}

module.exports = {
	register: register,
	save : save,
	getStudents: getStudents,
	findById: findById,
	update: update,
	deleteStudentById: deleteStudentById,
	getStudentsBySchoolId: getStudentsBySchoolId,
	getClassesBySchoolId: getClassesBySchoolId,
	assignCoursesToClass: assignCoursesToClass,
	getMyCourses: getMyCourses,
	getAssignCoursesToClass: getAssignCoursesToClass,
	updateProfile : updateProfile,
	assignCourse: assignCourse,
	rateCourse : rateCourse,
	getMyCourseDetails : getMyCourseDetails,
	getMyCourseTopic : getMyCourseTopic,
	updateSubscription: updateSubscription,
	getLearningContent : getLearningContent,
	//getMyDashboard : getMyDashboard,
	getDashboardDetails : getDashboardDetails,
	updateLearningPathStatus : updateLearningPathStatus,
	updateStatus : updateStatus,
	upgradeOrDowngradeCourseVersion : upgradeOrDowngradeCourseVersion,
	getStudentInfo : getStudentInfo,
	getUrlDetails : getUrlDetails,
	updateAssignCoursesData : updateAssignCoursesData,
	updateClass:updateClass,
  getMyPerformance : getMyPerformance,
}