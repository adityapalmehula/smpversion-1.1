const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const controller = require('./class.controller');
const loggerConstants= require('./../../constants/logger').CLASSES;
const CustomError = require('./../../services/custom-error');
const appConstant = require('../../constants').app;

//get all classess based on school id
router.get('/',(req,res)=>{
  try {
    let schoolId=req.decoded.userId;
    if( !schoolId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.getClassesBySchoolId(schoolId).then((successResult)=>{
        return res.status(200).send(successResult);
      }).catch(error=> {
       logger.error(error.stack || error);
       return res.status(500).send({success: false, msg: loggerConstants.INTERNAL_ERROR });
     });
    }
  }catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR });
 }
});

//assign courses to class
router.put('/assignCourses/:classId',(req,res)=>{
  try {
    let classId=req.params.classId;
    if( !classId || !req.body) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.assignCourses(classId,req.body,req.decoded).then((successResult)=>{
        return res.status(200).send(successResult);
      }).catch(error=> {
       logger.error(error.stack || error);
       return res.status(500).send({success: false, msg: loggerConstants.INTERNAL_ERROR });
     });
    }
  }catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR });
 }
});

module.exports = router;
