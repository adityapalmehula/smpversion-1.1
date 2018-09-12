var Course = require('./course.entity');
var SubTopics = require('../subtopics/subtopic.entity');
var Topics = require('../topics/topic.entity');
const logger = require('./../../services/app.logger');
const loggerConstants= require('./../../constants/logger');
const validation = require('./../../common/validation');
const constants = require('./../../constants/app');
const courseHelper = require('./course.helper');
const courseflags = require('./course.flag');
const fs = require('fs');
const CustomError = require('./../../services/custom-error');
const appConstant = require('../../constants').app;
const Video = require('../contents/videos/video.entity');
const Note = require('../contents/notes/note.entity');
const Keypoint = require('../contents/keypoints/keypoint.entity');
const Media = require('../contents/media/media.entity');
const Reference = require('../contents/references/reference.entity');
const Assessments = require('./../assessments/assessment.entity');
const releaseCourseController = require('./../releaseCourses/releaseCourse.controller');

// Find all courses
const findAllCourse = function(queryFlag,userInfo) {
	return new Promise((resolve, reject)=> {

    let filter={ status: constants.CONTENT_STATUS[2] };
    if(userInfo && userInfo.role === appConstant.USER_DETAILS.USER_ROLES[0]) {
      filter={};
    } else if(userInfo && userInfo.role === appConstant.USER_DETAILS.USER_ROLES[1]) {
      filter={ $or: [ { status: constants.CONTENT_STATUS[2]  }, { status: constants.CONTENT_STATUS[1] } ] }
    }
    Course.find(filter)
    .select(courseflags[queryFlag].queryFields)
    .populate('topics',`status`)
    .exec((err, data) => {
      if (err) {
       logger.error(loggerConstants.NO_COURSE_FOUND + ' : ' + err);
       reject({ success: false, msg: err });
     } else if (!data) {
       logger.error(loggerConstants.NO_COURSE_FOUND);
       reject({ success: false, msg: loggerConstants.NO_COURSE_FOUND });
     } else {
      let courses = courseHelper.processCourses(data, queryFlag);
      logger.debug(loggerConstants.GET_ALL_DATA_COURSES);
      resolve({ success: true, data: courses });
    }
  });
  });
};

// create course
const createCourse = function(data,currentUser) {
  return new Promise((resolve, reject) => {
    let courseDetails =data;
    courseDetails['createdBy']= {
     id: currentUser['userId'],
     role: currentUser['role']
   }
   if(currentUser['role'] && currentUser['role'] === constants.USER_DETAILS.USER_ROLES[1]) {
    courseDetails['createdBy']['name']=constants.DEFAULT_NAME_FOR_BACKEND_USER;
  }else {
    courseDetails['createdBy']['name']=currentUser['name'];
  }
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE +' courseDetails');
  courseDetails['status']=constants.CONTENT_STATUS[0];
  let newCourse = new Course(courseDetails);

  let error= newCourse.validateSync();
  if(error){
    let msg= validation.formValidation(error);
    reject(msg)
  } else {
    newCourse.save(function(err, data) {
     if (err) {
      logger.error(loggerConstants.COURSE_NOT_SAVED + ':' + err);
      reject({success : false, msg :loggerConstants.COURSE_NOT_SAVED});
    } else {
      logger.debug(loggerConstants.COURSE_SUCCESSFULLY_SAVED);
      resolve({ success: true, msg: loggerConstants.COURSE_SUCCESSFULLY_SAVED});
    }
  });
  }
});
}

const updateCourseById=function(courseData,_id,userInfo,deleteImg) {
  let courseObj = courseData
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : courseObj');
  return new Promise((resolve,reject)=>{
    let updateObject={
      category: courseObj.category,
      subcategory: courseObj.subcategory,
      title: courseObj.title,
      shortDescription: courseObj.shortDescription,
      longDescription: courseObj.longDescription,
      prerequisites: courseObj.prerequisites,
      isPaid: courseObj.isPaid,
      activationMethod: courseObj.activationMethod,
      currency: courseObj.currency,
      tags: courseObj.tags,
      price: {
        offered: courseObj.price.offered,
        actual: courseObj.price.actual,
        discount: courseObj.price.discount
      },
      updatedBy:{
       id: userInfo.userId,
       role: userInfo.role,
       name: userInfo.name,
       date: Date.now()
     },
     duration: courseObj.duration,
     status: courseObj.status,
   }
   if(deleteImg) {
    updateObject['icon']=courseData.icon
  }
  let updateCourse = new Course(updateObject);
  let error= updateCourse.validateSync();
  if(error){
    let msg= validation.formValidation(error);
    reject(msg)
  }
  Course.findOneAndUpdate({ _id:_id }, {
    $set: updateObject
  },(err,data)=> {
    if(err) {
      logger.error(loggerConstants.COURSE_NOT_UPDATED + ':' + err);
      reject({success : false, msg :loggerConstants.COURSE_NOT_UPDATED});
    } else {
      logger.debug({success: true, msg: loggerConstants.COURSE_SUCCESSFULLY_UPDATED });
      if(deleteImg) {
        fs.unlink('server/uploads/courses/'+data['icon'],(error)=> {
          resolve({ success: true, msg: loggerConstants.COURSE_SUCCESSFULLY_UPDATED});
        });
      }else {
        resolve({ success: true, msg: loggerConstants.COURSE_SUCCESSFULLY_UPDATED});
      }
    }
  });
});
}

/* rearrange topics by course id */
const rearrangeTopicOfCourse=function(courseData,_id,userInfo) {
  let courseObj = courseData;
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : courseObj');
  return new Promise((resolve,reject)=>{
    Course.findOneAndUpdate({ _id:_id }, {
      $set: {
        topics: courseData.topics,
        updatedBy:{
         id: userInfo.userId,
         role: userInfo.role,
         name: userInfo.name,
         date: Date.now()
       },
     }
   },(err,data)=> {
    if(err) {
      logger.error(loggerConstants.COURSE_NOT_UPDATED + ':' + err);
      reject({success : false, msg :loggerConstants.COURSE_NOT_UPDATED});
    } else {
      logger.debug({success: true, msg: loggerConstants.COURSE_SUCCESSFULLY_UPDATED });
      
      resolve({ success: true, msg: loggerConstants.COURSE_SUCCESSFULLY_UPDATED});
    }
  });
  });
}


function getCourseById(id) {
 let courseId = id;
 return new Promise((resolve, reject) => {
  Course.findOne({ '_id': courseId })
  .populate( { path:'topics',
    match: { status: constants.STATUS.ACTIVE }})
  .exec(function(err, courseData) {
   if(err) {
    logger.error(loggerConstants.COURSE_DATA_NOT_FOUND + ' : ' + err);
    reject(err);
  } else if (courseData) {
    logger.debug({ success: true, msg: loggerConstants.GET_COURSE_DATA_BY_ID })
    resolve({ success: true, msg: loggerConstants.GET_COURSE_DATA_BY_ID, data:courseData });
  } else {
    logger.debug({ success: true, msg: loggerConstants.COURSE_DATA_NOT_FOUND })
    resolve({ success: true, msg: loggerConstants.COURSE_DATA_NOT_FOUND });
  }
});
});
}

// Delete Course Data
const deleteCourse=function(courseId,userInfo){
	return new Promise((resolve,reject)=>{
		Course.updateOne({'_id': courseId},
		{
			$set : {
				status: constants.CONTENT_STATUS[5] ,
        deletedBy:{
          id: userInfo.userId,
          role: userInfo.role,
          name: userInfo.name,
          date: Date.now()
        }
      }
    },function(err,data){
     if (err) {
      logger.error(loggerConstants.COURSE_DATA_NOT_FOUND + ' : ' + err);
      reject(err);
    } else {
      logger.debug({ success: true, msg: loggerConstants.Course_SUCCESSFULLY_DELETED });
      resolve({ success: true, msg: loggerConstants.Course_SUCCESSFULLY_DELETED });
    }
  });
	});
}


function fetchCourseDetail(req, res) {
	var courseId = req.body.id;
	Course.findOne({ '_id': courseId })
	.populate({
		path: 'topics',
		model: 'topics',
		populate: {
			path: 'subtopics',
			model: 'subtopics',
			populate: [
			{
				path: 'texts',
				model: 'texts'
			},
			{
				path: 'videos',
				model: 'videos'
			},
			{
				path: 'urls',
				model: 'urls'
			}
			]
		}
	})
	.then((course) => {
		if(course.topics && course.topics.length>1){
			course.topics=course.topics.sort(sortNumBasedValue("topicNo"));
		}
		res.json({
			course: course,
		})
	});
}

//Get course by course id
const getCourse = (courseId, queryFlag,userInfo)=> {
	return new Promise((resolve,reject)=> {
    let filter={_id:courseId, status: constants.STATUS.ACTIVE}
    if(userInfo && userInfo.role === appConstant.USER_DETAILS.USER_ROLES[1]) {
      filter={_id: courseId, status: { $ne: constants.CONTENT_STATUS[5]}};
    } 
    if(userInfo && userInfo.role === appConstant.USER_DETAILS.USER_ROLES[0]) {
      filter={_id: courseId };
    }
    Course.findOne(filter)
    .populate({
      path:'topics',
      match: {status: appConstant.STATUS.ACTIVE},
      populate: {
        path: 'subtopics',
        select: courseflags[queryFlag].populateSubtopics,
        match: {status: appConstant.STATUS.ACTIVE},
      },
      select: courseflags[queryFlag].populateTopics,
    })
    .select(courseflags[queryFlag].queryFields)
    .exec((err,course)=>{
      if(err) {
        logger.error(err);
        reject({ msg: loggerConstants.INTERNAL_ERROR});
      }else if(course) {
        let courseObj = courseHelper.processCourse(course, queryFlag);
        resolve({success : true, msg : loggerConstants.GET_DATA_SUCCESSFULLY, data: courseObj});
      } else {
        reject({ msg: loggerConstants.NO_DATA_FOUND});
      }
    });
  });
}
  // for sorting any string keys
  function sortNumBasedValue(prop,order){
  	return (a,b)=>{
  		if(order==='dec'){
  			return (a[prop] > b[prop]) ? -1 :(a[prop] < b[prop]) ? 1 : 0;
  		}
  		return (a[prop] > b[prop]) ? 1 :(a[prop] < b[prop]) ? -1 : 0;
  	}
  }


// get subcategories based on category id
const getCoursesBySubCat=function(id,filterObj) {
	return new Promise((resolve,reject)=> {
		let condition={subcategory: id};
		if(filterObj) {
			condition.status=filterObj.status;
		}
		Course.find(condition,["title","category","subcategory"],(err,data)=> {
			if (err) {
				logger.error(err);
				reject({msg: loggerConstants.INTERNAL_SERVER_ERROR})
			} else {
				resolve(data);
			}
		});
	});
}

  //get courses by subcategories id's
  const getCoursesBySubCategories=(subCategories)=> {
  	let promises=[];
  	let courses=[];
  	return new Promise((resolve, reject)=> {
  		subCategories.map(ele=> {
  			promises.push(getCoursesBySubCat(ele.id,{status: constants.STATUS.ACTIVE}))
  		});
  		Promise.all(promises).then(responses => {
  			responses.map(ele=>{
  				courses=courses.concat(ele);
  			});
  			resolve({success: true, msg: 'Courses '+loggerConstants.GET_DATA_SUCCESSFULLY, data: courses});
  		}).catch(error => { 
  			logger.error(error);
  			reject({msg: loggerConstants.INTERNAL_SERVER_ERROR})
  		});
  	});
  }

 //get courese by categorry id
 const getCourseByCategoryId=(categorryId,filterObj)=>{
 	return new Promise((resolve,reject)=>{
 		let condition={category: categorryId, status : constants.STATUS.ACTIVE };
 		if(filterObj) {
 			condition.status=filterObj.status;
 		}
 		Course.find(condition,["title","category","subcategory"],(err,data)=> {
 			if (err) {
 				logger.error(err);
 				reject({msg: loggerConstants.INTERNAL_SERVER_ERROR})
 			} else {
 				resolve(data);
 			}
 		});
 	});
 }

/*
* get topics and subopics based on course id
* used for filter data
*/
const getTopicsAndSubtopicsForFilters=(courseId)=> {
  return new Promise((resolve,reject)=> {
    Course.findOne({ '_id': courseId },['topics'])
    .populate({ path: 'topics', select: '_id title', model: 'topics',
      populate: { path: 'subtopics',select: '_id title', model: 'subtopics'}
    }).exec((err,course)=>{
      if(err) {
        return reject(err);
      }
      resolve({success: true, msg: loggerConstants.GET_COURSE_DATA_BY_ID, data: course});
    })
  })
}

/*
* validate and update course status
*/
const validateAndUpdateCourseStatus=(courseId,statusDetails,userInfo)=> {
  return new Promise((resolve,reject)=> {
   Course.findOne({ '_id': courseId },['status','createdBy'],(err,course)=> {
    if(err) { return reject(err); } 
    let ADMIN_RIGHTS=[constants.CONTENT_STATUS[0],constants.CONTENT_STATUS[1], constants.CONTENT_STATUS[2],constants.CONTENT_STATUS[3],constants.CONTENT_STATUS[4], constants.CONTENT_STATUS[5]]; 
    if(course) {
      if(course.createdBy.id==userInfo.userId || userInfo.role===appConstant.USER_DETAILS.USER_ROLES[0]) {
        if((ADMIN_RIGHTS.indexOf(statusDetails.statusTo) > -1 && userInfo.role === appConstant.USER_DETAILS.USER_ROLES[0])
          || (statusDetails.statusTo === constants.CONTENT_STATUS[1]  && userInfo.role === appConstant.USER_DETAILS.USER_ROLES[1]
            )) {
          if(statusDetails.statusTo === constants.CONTENT_STATUS[1]) {
           validateCourseOnSubmission(course).then(courseStatus=> {
            if(courseStatus['isInvalid']) {
              return resolve({success: true, msg:'Validation Fail',isInvalid: true});
            }
            updateCourseStatus(course,statusDetails,userInfo)
            .then(successResponse=> {
              resolve(successResponse);
            },err=> {
              reject(err);
            });
          },err=> {
            reject(err);
          });
         }else {
          updateCourseStatus(course,statusDetails,userInfo)
          .then(success=> {
           if(statusDetails.statusTo === constants.CONTENT_STATUS[2]) {
            releaseCourse(courseId,userInfo).then(releaseSuccess=> {
             resolve(success);
           },err => {
            reject(err);
          });

          }else {
           resolve(success);
         }
       },err=> {
        reject(err);
      });
        }
      }else {
        reject(new CustomError(loggerConstants.NO_RIGHTS_TO_UPDATE_COURSE_STATUS));
      }
    }else {
      reject(new CustomError(loggerConstants.NO_RIGHTS_TO_UPDATE_COURSE_STATUS));
    }
  }else {
    reject(new CustomError(loggerConstants.COURSE_DATA_NOT_FOUND));
  }
})
 });
}

//update course status
const updateCourseStatus= (course,statusDetails,userInfo)=> {
  return new Promise((resolve,reject)=> {
    let statusInfo={
      id: userInfo.userId,
      role: userInfo.role,
      name: userInfo.name,
      date: Date.now(),
      statusFrom: course.status,
      statusTo: statusDetails.statusTo,
      comment: statusDetails.message
    }
    Course.updateOne({ '_id': course._id }, {
      $push : { workFlows: statusInfo },
      $set : { status: statusDetails.statusTo,validationTracking: {}}
    },(err,data)=> {
     if (err) {
      logger.error(loggerConstants.COURSE_DATA_NOT_FOUND + ' : ' + err);
      reject(err);
    }else {
      logger.debug({ success: true, msg: loggerConstants.COURSE_STATUS_UPDATED_SUCCESSFULLY });
      resolve({ success: true, msg: loggerConstants.COURSE_STATUS_UPDATED_SUCCESSFULLY, data: { updatedStatus: statusInfo.statusTo}});
    }
  });
  });
}

//validate course on submission
const validateCourseOnSubmission = courseId=> {
  return new Promise((resolve, reject)=> {
    Course.findOne({ '_id': courseId },['topics','title','status'])
    .populate({ path: 'topics',match: {status: appConstant.STATUS.ACTIVE}, select: '_id title status', model: 'topics',
      populate: { path: 'subtopics', match: {status: appConstant.STATUS.ACTIVE}, select: {
        '_id':1 ,
        'title':1,
        'learningPaths':1,
        'status':1,
      }, model: 'subtopics' }
    }).exec((err, course)=> {
      if(err) return reject(err);
      course= course.toObject();
      course['isInvalid']=false;
      if(course.topics.length === 0) {
        course['isInvalid']=true;
        course['type']='NO TOPIC';   
      }else {
       course.topics.forEach((topic,t)=> {
        if(topic.subtopics.length === 0) {
          course['isInvalid']=true;
          topic['isInvalid']=true;
          topic['type']='NO SUBTOPIC';
        }else {
         topic.subtopics.forEach((subopic,s)=> {
          if(subopic.learningPaths.length === 0) {
            course['isInvalid']=true;
            topic['isInvalid']=true;
            subopic['isInvalid']=true;
            subopic['type']='NO LP';
          }
        })
       }
     });
     }
     if(course['isInvalid']) {
      addCourseValidationTrackingDetails(courseId,course).then(success=> {
        resolve({isInvalid: true });
      },err=> reject(err));
    }else {
      resolve({ isInvalid: false});
    }
  })
  })
}

//add course validation tracking details in course
const addCourseValidationTrackingDetails=(courseId,course)=> {
  return new Promise((resolve,reject)=>{
    Course.updateOne({ '_id': courseId }, {
      $set : { validationTracking: course } },(err,data)=> {
       if(err) return reject(err);
       logger.info('Course validation tracking details added successfully in course');
       resolve();
     });
  });
}

//get courses for instructor -created by him only
const getMyCreatedCourses=(userId,queryFlag)=> {
  return new Promise((resolve, reject)=> {
    Course.find({ 'createdBy.id': userId, status: { $ne: constants.CONTENT_STATUS[5]}})
    .select(courseflags[queryFlag].queryFields)
    .populate('topics',`status`)
    .sort({'createdBy.date': -1})
    .exec((err, data) => {
      if (err) {
       logger.error(loggerConstants.NO_COURSE_FOUND + ' : ' + err);
       reject({ success: false, msg: err });
     } else if (!data) {
       logger.error(loggerConstants.NO_COURSE_FOUND);
       reject({ success: false, msg: loggerConstants.NO_COURSE_FOUND });
     } else {
      let courses = courseHelper.processCourses(data, queryFlag);
      logger.debug(loggerConstants.GET_ALL_DATA_COURSES);
      resolve({ success: true, data: courses });
    }
  });
  });
}

//get course details 
const getCourseDetails= (courseId,fields)=> {
  return new Promise((resolve, reject) => {
    let courseFind=Course.findOne({ '_id': courseId });
    if(fields) {
      courseFind=courseFind.select(fields)
    }
    courseFind.exec(function(err, course) {
     if(err) {
      reject(err);
    } else if (course) {
      resolve({ success: true, msg: loggerConstants.GET_COURSE_DATA_BY_ID, data:course });
    } else {
      resolve({ success: true, msg: loggerConstants.COURSE_DATA_NOT_FOUND });
    }
  });
  });
}

//release course
const releaseCourse= (courseId,userInfo)=> {
  return new Promise((resolve, reject) => {
   getFullCourseDetails(courseId,userInfo).then(fullCourse=> {
    releaseCourseController.persistReleaseCourse(courseId,fullCourse,userInfo)
    .then(success => {
      resolve(success);
    })
  }).catch(err=> {
    reject(err);
  });
});
}

//get course full details
const getFullCourseDetails =  (courseId,userInfo) => {
  return new Promise(async (resolve,reject) => {
    try{
      let course = await Course.findOne({ '_id': courseId })
      .populate({ path: 'category',model: 'categories'})
      .populate({ path: 'subcategory',model: 'subcategories'})
      .populate({ path: 'topics',match: { status: appConstant.STATUS.ACTIVE }, model: 'topics',
        populate: { path: 'subtopics', match: { status: appConstant.STATUS.ACTIVE },  model: 'subtopics'}
      });
      let reqCounter=resCounter=0;
      course=course.toObject();
      course.topics.map((topic,t_index) => {
        topic['topicId']=topic._id;
        delete topic._id;
        topic.subtopics.map((subtopic,s_index) => {
         subtopic['subtopicId']=subtopic._id;
         delete subtopic._id;
         subtopic['learningPaths'].map(async (lp,l_index) => {
          let contentPromises = [];
          contentPromises.push(getContentDetails(lp.mainContent,{t_index: t_index,s_index: s_index,l_index: l_index}));
          lp.otherContents.map((oc,oc_index) => {
            contentPromises.push(getContentDetails(lp.otherContents[oc_index],{t_index: t_index,s_index: s_index,l_index: l_index,oc_index: oc_index}));
          });
          try {
            reqCounter++;
            let contentResults = await Promise.all(contentPromises);
            resCounter++;
            contentResults.map((result,i) => {
              let { t_index, s_index, l_index, oc_index} = result.idx;
              if(i==0) {
                course.topics[t_index].subtopics[s_index].learningPaths[l_index].mainContent.contentId = result.data;
              }else {
                course.topics[t_index].subtopics[s_index].learningPaths[l_index].otherContents[oc_index].contentId = result.data;
              }
              if(reqCounter === resCounter && i === contentResults.length-1) {
                return resolve(course);
              }
            });
          }catch(err) {
            reject(err);
          }
        });
       });
      });
    }catch(err) {
      reject(err);
    }
  });
}

//get schema based on content type
const getContentSchema = type => {
  let ContentSchRef='';
  switch(type) {
    case 'videos': ContentSchRef = Video; break;
    case 'notes': ContentSchRef = Note; break;
    case 'keypoints': ContentSchRef = Keypoint; break;
    case 'keyPoints': ContentSchRef = Keypoint; break;
    case 'media': ContentSchRef = Media; break;
    case 'references': ContentSchRef = Reference; break;
    case 'assessments': ContentSchRef = Assessments; break;
  }
  return ContentSchRef;
}

//get content details 
const getContentDetails = (content,indexes) => {
  return new Promise((resolve,reject) => {
    let ContentSchRef = getContentSchema(content.type);
    ContentSchRef.findById(content.contentId, (err,contentDetails) => {
      if(err) return reject(err);
      resolve({data: contentDetails,idx: indexes});
    });
  });
}

//get course details 
const getCourseInfo = (id,fields=null) => Course.findOne({_id: id}).select(fields);

module.exports = {
  findAllCourse: findAllCourse,
  createCourse: createCourse,
  fetchCourseDetail: fetchCourseDetail,
  deleteCourse: deleteCourse,
  getCourseById: getCourseById,
  updateCourseById: updateCourseById,
  getCourse: getCourse,
  getCoursesBySubCategories: getCoursesBySubCategories,
  getCourseByCategoryId: getCourseByCategoryId,
  getTopicsAndSubtopicsForFilters: getTopicsAndSubtopicsForFilters,
  validateAndUpdateCourseStatus: validateAndUpdateCourseStatus,
  getMyCreatedCourses: getMyCreatedCourses,
  getCourseDetails: getCourseDetails,
  rearrangeTopicOfCourse: rearrangeTopicOfCourse,
  getFullCourseDetails: getFullCourseDetails,
  getCourseInfo: getCourseInfo,
}