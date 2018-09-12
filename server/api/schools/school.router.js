var express = require('express');
var router = express.Router();
const logger = require('./../../services/app.logger');
var controller = require('./school.controller');
const loggerConstants= require('./../../constants/logger').SCHOOLS;
const CustomError = require('./../../services/custom-error');
const appConstant = require('../../constants').app;

//register school
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
        return res.status(417).json({ msg: error.msg });
      }else {
        return res.status(500).json({ msg:  error.msg });
      }
    })
  }catch (err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

//get all schools
router.get('/',(req,res)=> {
  try {
   let queryParams=req.query || {};
   controller.getSchools(queryParams).then((successResult)=> {
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

//get all schools
router.get('/filter',(req,res)=> {
	try	{
   controller.getSchoolList().then((successResult)=> {
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

//get school by id 
router.get('/:id',function(req,res){
  try {
    let schoolId=req.params.id;
    controller.getSchoolById(schoolId).then((successResult)=>{
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

//update school 
router.put('/:id',function(req, res){
  try {
    let school=req.body;
    let _id=req.params.id;
    if(!school){
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.update(school,_id,req.decoded).then((successResult) => {
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

//delete school
router.delete('/:id',(req,res)=> {
  try {
    let _id=req.params.id;
    controller.deleteSchool(_id,req.decoded).then((successResult)=>{
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
//get assign categories by id 
router.get('/assign/categories/:id',function(req,res){
  try {
   let schoolId=req.params.id;
   controller.getAssignCategories(schoolId).then((successResult)=>{
    return res.status(203).send(successResult);
  }, (rejection) => {
    logger.error(rejection.msg +" for: "+ _id);
    return res.status(417).json(rejection);
  }).catch(error=> {
    logger.error("Internal Error: "+error);
    return res.status(500).json({success:false, msg: "Internal error occurred"});
  });
} catch(err) {
  logger.error(err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

//update categories data 
router.put('/assign/categories/:id',function(req, res){
  try {
    let categories=req.body;
    let _id=req.params.id;
    if(!categories){
     logger.error('No data found for assign-categories' +_id);
     return res.status(417).send({success: false,msg: `Expecting assign-categories data to be updated`});
   }
   controller.updateCategories(categories,_id).then(successResult=> {
     logger.info(successResult.msg +" for "+_id);
     return res.status(200).send(successResult);
   },errResult=> {
    logger.error(errResult.msg+ 'for'+ _id);
    return res.status(500).send(errResult);
  }).catch(error=> {
    logger.error("Internal Error: "+error);
    return res.status(500).json({success:false, msg: "Internal error occurred"});
  });
} catch(err) {
 logger.error(err.stack || err);
 return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

module.exports = router;