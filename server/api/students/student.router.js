const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const controller = require('./student.controller');
const loggerConstants= require('./../../constants/logger').STUDENT;
const CustomError = require('./../../services/custom-error');
const authenticate = require('./../authenticateToken/authToken.router');
const UserController = require('./../users/users.controller.js');
const appConstant = require('../../constants').app;
const helpController = require('../helps/help.controller');

/*
* student registration for type B2C  
*/
router.post('/register',(req,res)=>{
  let user=req.body.email;
  let platform=req.headers.platform;
  try {
    let student=req.body;
    if(!student || !user) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.register(student,platform).then(successResult=>{
      logger.info(successResult.msg +" requested by: "+user);
      return res.status(200).send(successResult);

    },error=> {
      logger.error("Requested by: "+user+"\n"+ error.stack || error);
      if(error instanceof CustomError) {
        return res.status(417).json({ msg: error.message });
      } else {
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    })
  }catch (err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

//update assign course data for students
router.get('/UpdateAssignCourses/:id',function(req,res) {
  logger.info("----------------- Get Request to update student assign courses -----------------");
  if(!req.params.id)  {
   logger.error('No student id provided');
   return res.status(417).send({ success: false, msg: 'No student id provided'});
 }
 controller.updateAssignCoursesData(req.params.id).then((successResult)=> {
  return res.status(200).send(successResult);
},errResult=> {
  logger.error('UpdateAssignCourses: error occurred: ');
  logger.error(errResult.stack || errResult);
  return res.status(500).send(errResult);
});
});

// For authentication
router.use(authenticate);

//register B2B student 
router.post('/',(req,res)=>{
  let user=req.decoded.username;
  try {
    let student=req.body;
    if(!student || !user) {
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.save(student,req.decoded,req.headers.platform).then(successResult=>{
    logger.info(successResult.msg +" requested by: "+user);
    return res.status(200).send(successResult);
  },error=> {
    logger.error("Requested by: "+user)
    logger.error(error.stack || error);
    if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else{
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
 }catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

//get student on id
router.get('/studentId/:id',(req,res)=> {
  try {
    let _id=req.params.id;
    logger.info("Request for student data "+_id);
    controller.findById(_id).then(successResult=> {
      logger.info(successResult.msg +" for: "+_id);
      return res.status(200).send(successResult);
    },error=> {
      logger.error(error.msg || error +" for: "+ _id);
      return res.status(417).json(error);
    })
  }catch (err) {
    logger.error('Error occurred in  get student info for: '+_id +err.stack || err);
    return res.status(500).send({ msg: "Internal error occurred" });
  }
});


//get student on basis of login user
router.get('/userId',(req,res)=> {
  let userId=req.decoded.userId;
  try {
    logger.info(loggerConstants.REQUEST_FOR_STUDENT_DATA+userId);
    controller.findById(userId).then(successResult=> {
      logger.info(successResult.msg +" for: "+userId);
      return res.status(200).send(successResult);
    },error=> {
      logger.error(error.msg || error +" for: "+ userId);
      if(error instanceof CustomError) {
        return res.status(417).json({ msg: error.message });
      }else{
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    })
  }catch (err) {
    logger.error(loggerConstants.ERROR_OCCURED_IN_GET_STUDENT_INFO_FOR +userId +err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

/*
* get student by student id
* get student details based on query param
*/
router.get('/id',(req,res)=> {
  let userId=req.decoded.userId;
  try {
    let queryFlag = req.query.q;
    controller.getStudentInfo(userId,queryFlag).then(successResult=> {
      logger.info(successResult.msg +" for: "+userId);
      return res.status(200).send(successResult);
    },error=> {
      logger.error(error.msg || error +" for: "+ userId);
      if(error instanceof CustomError) {
        return res.status(417).json({ msg: error.message });
      }else{
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    })
  }catch (err) {
    logger.error(loggerConstants.ERROR_OCCURED_IN_GET_STUDENT_INFO_FOR +userId +err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

//Get dashboard data for student.
router.get('/mydashboard', (req, res) => {
  let _id=req.decoded.userId;
  // let queryFlag = req.query.q;
  try {
    if(!_id) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.getDashboardDetails(_id, "dashboard").then((successResult) => {
        logger.info(successResult.msg+" for student: "+_id);
        return res.status(200).send(successResult);
      }, (errResult)=> {
        logger.error(errResult.msg || errResult.stack || errResult+" for student: "+_id);
        return res.status(417).send(errResult);
      });
    }
  } catch(err) {
   logger.error(loggerConstants.INTERNAL_ERROR+ " in get assign courses for student: "+" for student: "+_id+" "+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});


//get all courses assigned to student.
// This route expects a query param "q" to be used for selecting fields
router.get('/mycourses', (req, res) => {
  let _id=req.decoded.userId;
  let platform=req.headers.platform;
  console.log(platform);
  let queryFlag = req.query.q;
  try {
    if(!_id) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.getMyCourses(_id, queryFlag).then((successResult) => {
        logger.info(successResult.msg+" for student: "+_id);
        return res.status(200).send(successResult);
      }, (errResult)=> {
        logger.error(errResult.msg || errResult.stack || errResult+" for student: "+_id);
        return res.status(417).send(errResult);
      });
    }
  } catch(err) {
   logger.error(loggerConstants.INTERNAL_ERROR+ " in get assign courses for student: "+" for student: "+_id+" "+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//get assigned course details for student.
router.get('/mycourses/:courseId', (req, res) => {
  let _id=req.decoded.userId;
  try {
    let courseId=req.params.courseId;
    let queryFlag = req.query.q;
    if(!_id || !courseId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.getMyCourseDetails(_id, courseId, queryFlag).then((successResult) => {
        logger.info(successResult.msg+" for student: "+_id);
        return res.status(200).send(successResult);
      }, (errResult)=> {
        logger.error(errResult.msg || errResult.stack || errResult+" for student: "+_id);
        return res.status(417).send(errResult);
      });
    }
  } catch(err) {
   logger.error(loggerConstants.INTERNAL_ERROR+ " in get assign courses for student: "+" for student: "+_id+" "+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//get topic details of a assigned course to view the contents of seleced topic.
router.get('/mycourses/:courseId/topics/:topicId', (req, res) => {
  let _id=req.decoded.userId;
  let courseId=req.params.courseId;
  let topicId=req.params.topicId;
  try {
    if(!_id) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.getMyCourseTopic(_id, courseId, topicId, 'topicDetails').then((successResult) => {
        logger.info(successResult.msg+" for student: "+_id);
        return res.status(200).send(successResult);
      }, (errResult)=> {
        logger.error(errResult.msg || errResult.stack || errResult+" for student: "+_id);
        return res.status(417).send(errResult);
      });
    }
  } catch(err) {
   logger.error(loggerConstants.INTERNAL_ERROR+ " in get assign courses for student: "+" for student: "+_id+" "+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});


  /*
  * assign subscribe course to student based on student id
  */
  router.put('/mycourses/assign',(req,res)=>{
    let studentId=req.decoded.userId;
    try{
      let courseInfo= req.body;
      if(!studentId || !courseInfo.courseId){
       logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
       return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
     }
     controller.assignCourse(studentId,courseInfo).then(successResult=> {
      logger.info(successResult.msg +" requested by: "+studentId);
      return res.status(200).send(successResult);
    },error=> {
      logger.error("Requested by: "+studentId+"\n"+ error.stack || error);
      if(error instanceof CustomError) {
        return res.status(500).json({msg: error.message});
      }else {
        return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
      }
    });
   }catch(err){
    logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+studentId);
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
})
  /*
  * update assinged course rating by student   
  */
  router.put('/mycourses/:courseId/rating',(req,res)=>{
    let userId=req.decoded.userId;
    let name=req.decoded.name;
    try {
      let courseId = req.params.courseId;
      let rating= req.body.rating;
      let title= req.body.title;
      let description= req.body.description;
      let ratingData = {
        userId : userId,
        name : name,
        rating : rating,
        title : title,
        description : description
      }

      if(!userId || !courseId || !rating || !title || !description) {
        logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
        return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
      }
      controller.rateCourse(userId,courseId,ratingData).then(successResult=>{
        logger.info(successResult.msg +" requested by: "+userId);
        return res.status(200).send(successResult);
      },error=> {
        logger.error("Requested by: "+userId);
        logger.error(error.stack || error);
        if(error instanceof CustomError) {
          return res.status(417).json({ msg: error.message });
        }else{
          return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
        }
      })
    }catch (err) {
      logger.error(loggerConstants.ERROR_OCCURED_TO_GET_ASSIGN_COURSE_FOR +userId +err.stack || err);
      return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })

  /*
  * Get learning content details based on contentId and type
  */
  router.post('/learningContent',(req,res)=>{
    let studentId=req.decoded.userId;
    try{
      let contentId= req.body.contentId;
      let type= req.body.type;
      if(!contentId || !type){
       logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
       return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
     }
     controller.getLearningContent(contentId,type).then(successResult=> {
      logger.info(successResult.msg +" requested by: "+studentId);
      return res.status(200).send(successResult);
    },error=> {
      logger.error("Requested by: "+studentId);
      logger.error(error.stack || error);
      if(error instanceof CustomError) {
        return res.status(500).json({msg: error.message});
      }else {
        return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
      }
    });
   }catch(err){
    logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+studentId);
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
})

/*
* get url details
*/  
router.post('/mycourse/url-details',(req,res)=>{
  try{
    if(!req.body.url){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.getUrlDetails(req.body.url).then(successResult=> {
    logger.info(successResult.msg +" requested by: "+req.decoded.userId);
    return res.status(200).send(successResult);
  },error=> {
    logger.error("Requested by: "+req.decoded.userId);
    logger.error(error.stack || error);
    if(error instanceof CustomError) {
      return res.status(500).json({msg: error.message});
    }else {
      return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
    }
  });
 }catch(err){
  logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+req.decoded.userId);
  logger.error(err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
})

//get student on basis of login user
// router.get('/byId',(req,res)=> {
//  let userId=req.decoded.userId;
//  try {
//   logger.info(loggerConstants.REQUEST_FOR_STUDENT_DATA+userId);
//   controller.findById(userId).then(successResult=> {
//     logger.info(successResult.msg +" for: "+userId);
//     return res.status(200).send(successResult);
//   },error=> {
//     logger.error(error.msg || error +" for: "+ userId);
//     if(error instanceof CustomError) {
//       return res.status(417).json({ msg: error.message });
//     }else{
//       return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
//     }
//   })
// }catch (err) {
//   logger.error(loggerConstants.ERROR_OCCURED_IN_GET_STUDENT_INFO_FOR +userId +err.stack || err);
//   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
// }
// });

//get students
router.get('/',(req,res)=> {
  try {
    let queryParams=req.query || {};
    controller.getStudents(queryParams,req.decoded).then((successResult)=> {
      logger.info(successResult.msg);
      return res.status(201).send(successResult);
    }, (rejection) => {
     logger.error(rejection.msg || rejection);
     return res.status(417).send(rejection);
   })
  }catch(err) {
    logger.error('Error occurred while fetching students: '+err.stack || err);
    return res.status(500).send({ msg: "Internal error occured" });
  }
});

//get students based on school id
router.get('/school/:schoolId',(req,res)=> {
 try {
   let schoolId=req.params.schoolId;
   controller.getStudentsBySchoolId(schoolId).then((successResult)=>{
    logger.info(successResult.msg);
    return res.status(203).send(successResult);
  }, (rejection) => {
    logger.error(rejection.msg || rejection);
    return res.status(417).send(rejection);
  })
 }catch(err) {
  logger.error('Error occurred while fetching students by school id: '+err.stack || err);
  return res.status(500).send({ msg: "Internal error occured" });
}
});

//update student subscription details
router.put('/subscription', (req,res)=> {
  let userId=req.decoded.userId;
  let youtubeToken = req.body.youtubeToken;
  try {
    if(!userId || !youtubeToken) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.updateSubscription(req.decoded, youtubeToken).then((successResult)=> {
      logger.info(successResult.msg+" for: "+userId);
      return res.status(200).send(successResult);
    }, (errResult)=>{
      logger.error(errResult.msg || errResult+" for: "+userId);
      return res.status(417).send(errResult);
    });
  }catch(err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userId+' '+err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});


//router for Update user class
router.put('/classInfo', function(req, res) {
  try {
    let classObj = req.body;
    let userId = req.decoded.userId;
    controller.updateClass(classObj, userId).then(success => {
    logger.info(loggerConstants.CLASS_IS_SUCCESSFULLY_UPDATED);
      return res.status(200).send({success:true,msg:'successfully save'});
    }, errResult => {
     logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(403).send(errResult);
    })
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//update student info
router.put('/:id',(req, res)=> {
  try {
    let student=req.body;
    let _id=req.params.id;
    if(!student){
      logger.error('No data found for student' +_id);
      return res.status(417).send({success: false,msg: `Expecting student data to be updated`});
    } 
    controller.update(student,_id, req.decoded).then((successResult) => {
      logger.info(successResult.msg +" for "+_id);
      return res.status(200).send(successResult);
    }, (errResult)=>{
      logger.error(errResult.msg || errResult+ 'for'+ _id);
      return res.status(500).send(errResult);
    });
  } catch(err) {
   logger.error('Error occurred in update student info for :  '+_id +err.stack || err);
   return res.status(500).send({ msg: "Internal error occurred" });
 }
});

//delete student
router.delete('/:id',(req,res)=> {
  let _id=req.params.id;
  try {
    controller.deleteStudentById(_id,req.decoded).then((successResult)=>{
      logger.info('Delete request for student data');
      return res.status(203).send(successResult);
    }, (rejection) => {
      logger.error(rejection.msg || rejection +" for: "+ _id);
      return res.status(417).json(rejection);
    })
  }catch(err) {
    logger.error('Error occurred in delete student info for :  '+_id +err.stack || err);
    return res.status(500).send({ msg: "Internal error occurred" });
  }
});


//get students classes based on school code
router.get('/classes/:id',(req,res)=>{
  try {
    let schoolCode=req.params.id;
    if( !schoolCode) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.getClassesBySchoolId(schoolCode).then((successResult)=>{
        logger.info(successResult.msg+" for school: "+schoolCode);
        return res.status(203).send(successResult);
      },errResult=> {
        logger.error(errResult.msg || errResult+" for school: "+schoolCode);
        return res.status(417).send(errResult);
      });
    }
  }catch(err) {
   logger.error(loggerConstants.INTERNAL_ERROR+ " while fetching classes for school: "+schoolCode+" " +err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//assign courses to perticular class
router.put('/class/assign/courses/:schoolId/:standard', (req, res) => {
  try {
    let schoolId=req.params.schoolId;
    let standard=req.params.standard;
    let userId=req.decoded.userId;
    let courses=req.body;
    if( !schoolId || !standard || !courses) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.assignCoursesToClass(schoolId,standard,courses,userId).then((successResult) => {
        logger.info(successResult.msg+" for school: "+schoolId+" class: "+standard);
        return res.status(200).send(successResult);
      }, (errResult)=>{
        logger.error(errResult.msg || errResult+" for school: "+schoolId+" class: "+standard);
        return res.status(417).send(errResult);
      });
    }
  }catch(err) {
   logger.error(loggerConstants.INTERNAL_ERROR+ " in assign courses for school: "+schoolId+" class: "+standard +err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//assign courses to perticular class
router.get('/class/assign/courses/:schoolId/:standard', (req, res) => {
  let schoolId=req.params.schoolId;
  let standard=req.params.standard;
  try {
    if( !schoolId || !standard ) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.getAssignCoursesToClass(schoolId,standard).then((successResult) => {
        logger.info(successResult.msg+" for school: "+schoolId+" class: "+standard);
        return res.status(200).send(successResult);
      }, (errResult)=> {
        logger.error(errResult.msg || errResult.stack || errResult+" for school: "+schoolId+" class: "+standard);
        return res.status(417).send(errResult);
      });
    }
  }catch(err) {
   logger.error(loggerConstants.INTERNAL_ERROR+ " in get assign courses for school: "+schoolId+" class: "+standard +" "+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

/* //Update profile 
 router.put('/profile/updateProfile',function(req,res){
  try{
    let profileData=req.body;
    let username = req.decoded.username;
    logger.info('updateProfile data of user',profileData);
    controller.updateProfile(profileData,username).then(success=>{
      logger.info('profile is successfully updated');
      return res.status(201).send({'msg': success});
    },fail=>{
      logger.info(fail);
      res.status(404).send(fail);
    })
  }catch(error){
    logger.error("Exception occurred: ",error);
    // res.status(404).send(error : 'Failed to complete successfully, please check the request and try again..!' );
  }
});*/ 


/*
* update learning path status   
*/
router.put('/mycourses/learningpaths/status',(req,res)=> {
  let userId=req.decoded.userId;
  try {
    let { courseId, topicId, subtopicId, learningPathId } = req.body;
    if(!courseId || !topicId || !subtopicId || !learningPathId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.updateLearningPathStatus(req.body,req.decoded).then(successResult=>{
      logger.info(successResult.msg +" requested by: "+userId);
      return res.status(200).send(successResult);
    },error=> {
      logger.error("Requested by: "+userId);
      logger.error(error.stack || error);
      return res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
    })
  }catch (err) {
    logger.error(err.stack || err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR });
  }
})

/*
* update learning path status   
*/
router.put('/mycourses/update/version',(req,res)=> {
  let userId=req.decoded.userId;
  try {
    let { courseId, upgrade } = req.body;
    if(!courseId || !userId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.upgradeOrDowngradeCourseVersion(courseId,userId,upgrade).then(successResult=>{
      logger.info(successResult.msg +" requested by: "+userId);
      return res.status(200).send(successResult);
    },error=> {
      logger.error("Requested by: "+userId);
      logger.error(error.stack || error);
      return res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
    })
  }catch (err) {
    logger.error(err.stack || err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR });
  }
})

/* start change status 3 May Rohit*/
router.put('/status/change',(req,res)=>{
 let userId=req.decoded.userId;
 try {
  let updateDetails=req.body.updateDetails;
  let students=req.body.students;
  if(!req.decoded.role || !students || !updateDetails) {
    logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
    return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
  }
  if(req.decoded.role !== appConstant.USER_DETAILS.USER_ROLES[0]) {
    return res.status(417).send({ success: false, msg: loggerConstants.PERMISSION_DENIED});
  }
  controller.updateStatus(students,updateDetails).then(successResult=>{
    logger.info(successResult.msg +" requested by: "+userId);
    return res.status(200).send(successResult);
  },error=> {
    logger.error("Requested by: "+userId);
    logger.error(error.stack || error);
    return res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
  })
}catch (err) {
  logger.error(err.stack || err);
  return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR });
}
});
/* end change status 3 May Rohit*/

//get all my helps
router.get('/myhelps',function(req,res){
  try {
    let userId=req.decoded.userId;
    helpController.getMyHelps(userId).then((successResult)=>{
      return res.status(200).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch(err) {
    logger.fatal(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR_OCCURED, data: err });
  }
});

//get my performace
router.get('/myperformance',function(req,res){
  try {
    let userId=req.decoded.userId;
    controller.getMyPerformance(userId).then((successResult)=>{
      return res.status(200).send(successResult);
    }, (errResult) => {
      logger.error(errResult.msg || errResult);
      return res.status(500).send({success: false, msg: loggerConstants.INTERNAL_ERROR_OCCURED} );
    });
  } catch(err) {
    logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR_OCCURED});
  }
});



module.exports = router;