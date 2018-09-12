var express = require('express');
var router = express.Router();
const logger = require('./../../services/app.logger');
const controller = require('./teacher.controller');
const loggerConstants= require('./../../constants/logger').TEACHERS;
const CustomError = require('./../../services/custom-error');
const appConstant = require('../../constants').app;

//register teacher
router.post('/',(req,res)=>{
  try {
    let platform=req.headers.platform;
    let email=req.body.email;
    logger.info(loggerConstants.REGISTRATION_REQUEST+" : "+email);
    controller.register(req.body,req.decoded,platform).then(successResult=>{
      logger.info(successResult.msg +" for: "+email);
      return res.status(200).send(successResult);
    },error=> {
      logger.error(error.stack || error);
      if(error instanceof CustomError) {
        return res.status(417).json({ msg: error.message });
      }else {
        return res.status(500).json({ msg: error.msg });
      }
    })
  }catch (err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//get all teachers
router.get('/',(req,res)=> {
  try {
   let queryParams=req.query || {};
   controller.getTeachers(queryParams,req.decoded).then((successResult)=> {
    logger.info(successResult.msg);
    return res.status(201).send(successResult);
  },(error) => {
   logger.error(error.stack || error);
   return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
 });
 }catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//get all teachers by school
router.get('/school',(req,res)=> {
  try {
    let schoolId= req.decoded.userId;
    controller.getTeachersBySchool(schoolId).then((successResult)=> {
      logger.info(successResult.msg);
      return res.status(201).send(successResult);
    },(error) => {
     logger.error(error.stack || error);
     return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
   });
  }catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//get teacher by id 
router.get('/:id',function(req,res){
  try {
    let teacherId=req.params.id;
    controller.getTeacherById(teacherId).then((successResult)=>{
      logger.info(successResult.msg);
      return res.status(201).send(successResult);
    },(error) => {
     logger.error(error.stack || error);
     return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
   });
  }catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//update teacher 
router.put('/assignClasses/:id',function(req, res){
  try {
    let data=req.body;
    let _id=req.params.id;
    if(!data){
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.assignClasses(_id,data,req.decoded).then((successResult) => {
      logger.info(successResult.msg +" for "+_id);
      return res.status(200).send(successResult);
    },(error)=>{
     logger.error(error.stack || error);
     if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
  } catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});


//update teacher 
router.put('/:id',function(req, res){
  try {
    let teacher=req.body;
    let _id=req.params.id;
    if(!teacher){
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.update(teacher,_id,req.decoded).then((successResult) => {
      logger.info(successResult.msg +" for "+_id);
      return res.status(200).send(successResult);
    },(error)=>{
     logger.error(error.stack || error);
     if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
  } catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//delete teacher
router.delete('/:id',(req,res)=> {
  try {
    let _id=req.params.id;
    controller.deleteTeacher(_id,req.decoded).then((successResult)=>{
      return res.status(203).send(successResult);
    }, (rejection) => {
      logger.error(rejection.msg +" for: "+ _id);
      return res.status(417).json(rejection);
    }).catch(error=> {
     logger.error(error.stack || error);
     return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
   });
  }catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//get all teacher by school id
router.get('/schoolId/:schoolId',function(req,res){
 let schoolId=req.params.schoolId;
 try
 {
  controller.findBySchoolId(schoolId).then((successResult)=>{
    return res.status(203).send(successResult);
  }, (errResult) => {
    logger.error('Internal error occurred');
    return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
  });
}
catch(err) {
  logger.fatal('Exception occurred' + err);
  res.send({ error: 'Failed to complete, please check the request and try again..!' });
  return;
}
});


module.exports = router;
