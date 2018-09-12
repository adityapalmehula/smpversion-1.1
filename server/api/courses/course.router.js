var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
var controller = require('./course.controller');
const logger = require('./../../services/app.logger');
const loggerConstants= require('./../../constants/logger');
const authenticate = require('./../authenticateToken/authToken.router');
const CustomError = require('./../../services/custom-error');
const appConstant = require('../../constants').app;
const authCtrl = require('./../authenticateToken/authToken.controller');
const fileUpload = require('./../fileUpload/upload');

//get all courses.
// This route expects a query param "q" to be used for selecting fields
router.get('/',function(req,res){
  try {
    let queryFlag = req.query.q;
    if(req.headers && req.headers.authorization) {
      authCtrl.verifyToken(req.headers.authorization).then(success=> {
        if(success.decoded) {
          controller.findAllCourse(queryFlag,success.decoded).then((successResult)=>{
            logger.info(loggerConstants.GET_ALL_DATA_COURSES);
            return res.status(203).send(successResult);
          }, (errResult) => {
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult);
            return res.status(500).send(errResult);
          });
        }
      });
    }else {
      controller.findAllCourse(queryFlag).then((successResult)=>{
        logger.info(loggerConstants.GET_ALL_DATA_COURSES);
        return res.status(203).send(successResult);
      }, (errResult) => {
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
        return res.status(500).send(errResult);
      });
    }
  }catch(err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success:false, msg: err });
    return;
  }
});

// For authentication
router.use(authenticate);


// var storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'server/uploads/courses')
//   },
//   filename: function(req, file, cb) {
//     let userId = req.decoded.userId;
//     cb(null, userId + '-' + Date.now() + path.extname(file.originalname))
//   }
// })

// File uploaded by multer
// var upload = multer({ storage: storage }).any();

// uploadCourseIcon=(iconData,userId)=>{
//  return new Promise((resolve, reject) => {
//   let data=iconData;
//   let ext = data.split(';')[0].match(/jpeg|png|jpg/)[0];
//   if(!ext) {
//    reject({success:false,msg:loggerConstants.FILE_TYPE_ERROR});
//  }
//  let y=1;
//  let last2=data.slice(-2);
//  if(last2=='==') {
//   y=2;
// }
// let size=(data.length*(3/4))-y;
// if(size>256000) {
//   reject({success:false,msg:loggerConstants.FILE_SIZE_ERROR});
// }
// let base64Data = data.replace(/^data:image\/png;base64,/, "");
// let buf = new Buffer(base64Data, 'base64');
// let filname=userId+'-'+Date.now() +'.'+ ext;
// fs.writeFile('server/uploads/courses/'+filname, buf,function(err){
//   if(err) {
//     reject({success:false,msg:loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM});
//   } else {
//     resolve({success:true,filename:filname})
//   }
// });
// });
// }

// Create course
router.post('/', function(req, res) {
  let courseData = req.body;
  let currentUser = req.decoded;
  let userId=currentUser.userId;
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE_COURSE);
  try {
    if (!courseData || !currentUser) {
      logger.error(loggerConstants.COURSE_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    let uploadDetails={
     userId:userId,
     title:courseData.title,
     fileData:courseData.icon,
     requestType:'courses'
   }
   fileUpload.uploadfile(uploadDetails).then((successfull)=>{
     courseData['icon'] = successfull.filename;
     courseData['iconExtension'] = successfull.extension;
     controller.createCourse(courseData, currentUser).then((successResult)=> {
      logger.info(loggerConstants.COURSE_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult)=> {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
      return res.status(500).send(errResult);
    });
   },(error)=>{
    logger.error(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
    return res.status(500).send(error);
  }); 
 } catch (err) {
  logger.fatal(err.stack || err);
  res.status(500).send({ success:false, msg: err });
  return;
}
});

// update course by id
router.put('/id/:id',function(req,res){
  try {
    let courseData = req.body;
    let _id=req.params.id;
    let currentUser = req.decoded;
    let userId=currentUser.userId;
    let deleteImg=false;
    if(!courseData){
      logger.error(loggerConstants.COURSE_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    controller.getCourseById(_id).then(successResult=> {
      if(successResult['data'] && successResult['data'].createdBy) {
        if(successResult['data'].createdBy.id==req.decoded.userId || req.decoded.role===appConstant.USER_DETAILS.USER_ROLES[0]) {
          if(courseData.icon){
           let uploadDetails={
             userId:userId,
             title:courseData.title,
             fileData:courseData.icon,
             requestType:'courses'
           }
           fileUpload.uploadfile(uploadDetails).then((successfull)=>{
             courseData['icon'] = successfull.filename;
             courseData['iconExtension'] = successfull.extension;
             deleteImg=true;
             controller.updateCourseById(courseData,_id,req.decoded,deleteImg).then(successResult=>{
               logger.info(loggerConstants.COURSE_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
               return res.status(201).send(successResult);
             }, (errResult) => {
               logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.stack || errResult);
               return res.status(500).send(errResult);
             });
           },(error)=>{
            logger.error(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
            return res.status(403).send(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
          })
         } else {
           controller.updateCourseById(courseData,_id,req.decoded,deleteImg).then(successResult=>{
             logger.info(loggerConstants.COURSE_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
             return res.status(201).send(successResult);
           }, (errResult) => {
             logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.stack || errResult);
             return res.status(403).send(errResult);
           });
         }
       }else {
        return res.status(403).json({ success:false, msg: loggerConstants.NO_RIGHTS_TO_UPDATE});
      }
    }else {
      return res.status(500).json({ success:false, msg: successResult.msg });
    }
  },error=> {
    logger.fatal(error.stack || error);
    return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
  })
  } catch(err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success:false, msg: err });
  }
});



// update course by id
// router.put('/id/:id',function(req,res){
//   try {
//     let courseData = JSON.parse(req.headers.coursedata);
//     let _id=req.params.id;
//     let deleteImg=false;
//     if(!courseData){
//       logger.error(loggerConstants.COURSE_DATA_NOT_FOUND);
//       throw new Error(loggerConstants.INVALID_INPUTS);
//     }
//     controller.getCourseById(_id).then(successResult=> {
//       if(successResult['data'] && successResult['data'].createdBy) {
//         if(successResult['data'].createdBy.id==req.decoded.userId || req.decoded.role===appConstant.USER_DETAILS.USER_ROLES[0]) {
//           upload(req, res,(err)=> {
//             if(err) {
//               return res.status(403).send(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
//             }
//             if(req.files) {
//               let startIndex = req.files[0].path.split('/');
//               let filePath = startIndex[startIndex.length - 1];
//               courseData['icon']=filePath;
//               deleteImg=true;
//             }else {
//               courseData['icon']=courseData['imageName'] || "";
//             }
//             controller.updateCourseById(courseData,_id,req.decoded,deleteImg).then(successResult=>{
//              logger.info(loggerConstants.COURSE_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
//              return res.status(201).send(successResult);
//            }, (errResult) => {
//              logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.stack || errResult);
//              return res.status(403).send(errResult);
//            });
//           })
//         }else {
//           return res.status(403).json({ success:false, msg: loggerConstants.NO_RIGHTS_TO_UPDATE});
//         }
//       }else {
//         return res.status(500).json({ success:false, msg: successResult.msg });
//       }
//     },error=> {
//       logger.fatal(error.stack || error);
//       return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
//     })
//   } catch(err) {
//     logger.fatal(err.stack || err);
//     res.status(500).send({ success:false, msg: err });
//   }
// });


// rearrange topic of course by id
router.put('/:courseId/topics/rearrange',function(req,res){
  try {
    let courseData = req.body;
    let _id=req.params.courseId;
    if(!courseData){
      logger.error(loggerConstants.COURSE_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    controller.getCourseById(_id).then(successResult=> {
      if(successResult['data'] && successResult['data'].createdBy) {
        if(successResult['data'].createdBy.id==req.decoded.userId || req.decoded.role===appConstant.USER_DETAILS.USER_ROLES[0]) {
          controller.rearrangeTopicOfCourse(courseData,_id,req.decoded).then(successResult=>{
           logger.info(loggerConstants.COURSE_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
           return res.status(201).send(successResult);
         }, (errResult) => {
           logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.stack || errResult);
           return res.status(403).send(errResult);
         });
        }else {
          return res.status(403).json({ success:false, msg: loggerConstants.NO_RIGHTS_TO_UPDATE});
        }
      }else {
        return res.status(500).json({ success:false, msg: successResult.msg });
      }
    },error=> {
      logger.fatal(error.stack || error);
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    })
  } catch(err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success:false, msg: err });
  }
});





router.post('/courseDetail', (req, res, next) => {
  // Here we are fetching one particular course detail based on course id.
  controller.fetchCourseDetail(req, res);
});

// Delete courses routes
router.delete('/deleteCourse/:courseId',function(req,res){
  let courseId=req.params.courseId;
  try
  {
    controller.deleteCourse(courseId,req.decoded).then((successResult)=>{
      logger.info(loggerConstants.DATA_DELETED_FROM_COURSE + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
            //log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
          });
  }
  catch(err) {
         // Log the Error for internal use
         logger.fatal(err.stack || err);
         res.status(500).send({ success:false, msg: err });
         return;
       }
     });


router.get('/id/:id',function(req,res){
  let _id=req.params.id;
  try {
    controller.getCourseById(_id).then((successResult)=>{
      return res.status(203).send(successResult);
    },errResult=> {
      logger.error('Internal error occurred');
      return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
    });
  } catch(err) {
    logger.fatal('Exception occurred' + err);
    res.send({ error: 'Failed to complete, please check the request and try again..!' });
  }
});

//get my courses for instructor
router.get('/mycourses', (req, res) => {
  let _id=req.decoded.userId;
  try {
    let queryFlag = req.query.q;
    controller.getMyCreatedCourses(_id,queryFlag).then((successResult) => {
      logger.info(successResult.msg+" for student: "+_id);
      return res.status(200).send(successResult);
    }, (errResult)=> {
      logger.error(errResult.stack || errResult+" for student: "+_id);
      return res.status(417).send(errResult);
    });
  } catch(err) {
   logger.error(err.stack || err);
   logger.error(loggerConstants.INTERNAL_ERROR+'for student: '+_id);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//get course based on course id 
router.get('/:courseId',(req,res)=> {
  let courseId=req.params.courseId;
  try {
    if( !courseId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      let queryFlag='courseDetails';
      if(req.query.q) {
        queryFlag=req.query.q;
      }
      controller.getCourse(courseId, queryFlag,req.decoded).then((successResult) => {
        logger.info(successResult.msg+" for topics by course id: "+courseId);
        return res.status(200).send(successResult);
      }, (errResult)=> {
        logger.error(errResult.msg || errResult.stack || errResult+" for topics by course id: "+courseId);
        return res.status(417).send(errResult);
      });
    }
  } catch(err) {
   logger.error(loggerConstants.INTERNAL_SERVER_ERROR+ " in get topics by course id: "+courseId+" "+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_SERVER_ERROR });
 }
});

//get courses by subcategories id
router.post('/subcategories',(req, res)=> {
  try {
    let subCategories=req.body;
    if(!subCategories ){
      logger.error(loggerConstants.NO_SUBCATEGORIES_FOUND);
      throw new Error(loggerConstants.NO_SUBCATEGORIES_FOUND);
    }else {
      controller.getCoursesBySubCategories(subCategories).then((successResult) => {
       logger.info(successResult.msg);
       return res.status(201).send(successResult);
     }, (errResult)=>{
       logger.error(errResult.msg);
       return res.status(403).send(errResult);
     }).catch(err=>{
      logger.error(loggerConstants.INTERNAL_SERVER_ERROR+ err.stack || err);
      return res.status(500).send({ success:false, msg: err });
    });
   }
 }catch(err) {
  logger.error(loggerConstants.INTERNAL_SERVER_ERROR+ err.stack || err);
  return res.status(500).send({ success:false, msg: err });
}
});

/*
* get topics and subtopics
*/
router.get('/topics/subtopics/:courseId',(req,res)=> {
  let user=req.decoded.userId;
  try {
    let courseId = req.params.courseId;
    if(!user || !courseId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.getTopicsAndSubtopicsForFilters(courseId).then(successResult=> {
      logger.info(successResult.msg +" requested by: "+user);
      return res.status(200).send(successResult);
    }, error=> {
      logger.error("Requested by: "+user);
      logger.error(error.stack || error);
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    })
  }catch(err) {
    logger.error(loggerConstants.ERROR_OCCURED_TO_GET_ASSIGN_COURSE_FOR +user +err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
})


//update student subscription details
router.put('/status/:courseId', (req,res)=> {
  let userId=req.decoded.userId;
  try {
    let statusDetails=req.body;
    let courseId=req.params.courseId;
    if(!courseId || !statusDetails.statusTo || !statusDetails.message) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.validateAndUpdateCourseStatus(courseId,statusDetails,req.decoded).then((successResult)=> {
      logger.info(successResult.msg+" for: "+userId);
      return res.status(200).send(successResult);
    },error=>{
      logger.error("Requested by: "+userId);
      logger.error(error.stack || error);
      if(error instanceof CustomError) {
        return res.status(403).json({ msg: error.message });
      }else {
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    });
  }catch(err) {
    logger.error(err.stack || err);
    logger.error('requested by: '+userId);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

//update student subscription details
router.get('/validation-tracking/:courseId', (req,res)=> {
  let userId=req.decoded.userId;
  try {
    let courseId=req.params.courseId;
    if(!courseId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.getCourseDetails(courseId,'_id validationTracking').then((successResult)=> {
      logger.info(successResult.msg+" for: "+userId);
      return res.status(200).send(successResult);
    },error=>{
      logger.error("Requested by: "+userId);
      logger.error(error.stack || error);
      if(error instanceof CustomError) {
        return res.status(403).json({ msg: error.message });
      }else {
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    });
  }catch(err) {
    logger.error(err.stack || err);
    logger.error('requested by: '+userId);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

module.exports = router;
