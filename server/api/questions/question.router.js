const express = require('express');
const router = express.Router();
const logger = require('../../services/app.logger');
const controller = require('./question.controller');
const loggerConstants= require('./../../constants/logger').QUESTION;
const CustomError = require('./../../services/custom-error');

/*
* save question
*/ 
router.post('/',(req,res)=> {
  let userInfo=req.decoded;
  try {
    let question=req.body;
    if(!question || !question.subTopicId){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.persistOrMergeQuestion(question,userInfo).then(successResult=> {
    logger.info(successResult.msg +" requested by: "+userInfo.username);
    return res.status(200).send(successResult);
  },error=> {
    logger.error("Requested by: "+userInfo.username);
    logger.error(error.stack || error);
    if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
 }catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userInfo.username);
  logger.error(err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

/*
*fetch questions by dynamic filter
*/ 
router.get('/',(req,res)=> {
  let userInfo=req.decoded;
  try {
    let queryParams=req.query || {};
    controller.getQuestions(queryParams,false,userInfo).then(successResult=>{
      logger.info(successResult.msg +" requested by: "+userInfo.username);
      return res.status(200).send(successResult);
    },error=> {
     logger.error("Requested by: "+userInfo.username);
     logger.error(error.stack || error);
     if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
  }catch (err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userInfo.username);
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

/*
* get question by question id
*/
router.get('/:id',(req,res)=> {
  let userInfo=req.decoded;
  try {
    let questionId=req.params.id;
    if(!questionId || !userInfo) {
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.getQuestionById(questionId,userInfo).then(successResult=> {
     logger.info(successResult.msg +" requested by: "+userInfo.username);
     return res.status(200).send(successResult);
   },error=> {
     logger.error("Requested by: "+userInfo.username);
     logger.error(error.stack || error);
     if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
 }catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userInfo.username);
  logger.error(err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

/*
* update question object
*/
router.put('/:id',(req,res)=>{
  let userInfo=req.decoded;
  try{
    let question= req.body;
    let qusId=req.params.id;
    if(!question ||!qusId || !userInfo){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.persistOrMergeQuestion(question,userInfo,qusId).then(successResult=> {
    logger.info(successResult.msg +" requested by: "+userInfo.username);
    return res.status(200).send(successResult);
  },error=> {
   logger.error("Requested by: "+userInfo.username);
   logger.error(error.stack || error);
   if(error instanceof CustomError) {
    return res.status(417).json({ msg: error.message });
  }else {
    return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
  }
});
 }catch(err){
   logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userInfo.username);
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
})


/*
* submit question report issue details
*/
router.put('/issues/:id',(req,res)=>{
  let userInfo=req.decoded;
  try{
    let qusId=req.params.id;
    if(!qusId || !req.body) {
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.submitQuestionIssue(qusId,req.body,userInfo).then(successResult=> {
    logger.info(successResult.msg +" requested by: "+userInfo.username);
    return res.status(200).send(successResult);
  },error=> {
   logger.error("Requested by: "+userInfo.username);
   logger.error(error.stack || error);
   return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
 });
 }catch(err){
   logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userInfo.username);
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
})


// route for fetch question by subtopicId
/*router.put('/updateQuestion/:questionId',(req,res)=>{
  let questionData=req.body;
  let questionId=req.params.questionId;
  let username = req.decoded.username;
  try
  {
    controller.updateQuestion(questionData,questionId,username).then((successResult)=>{
     logger.info('Get All Data of Question');
     return res.status(203).send({'msg':successResult});
   }, (errResult) => {
     logger.error(errResult);
     return res.status(204).send({ error: errResult });
   });
  }
  catch(err) {
    // Log the Error for internal use
    logger.fatal('Exception occurred' + err);
    res.send({ error: err });
    return;
  }
})
*/


// route for fetch question by subtopicId
router.get('/fetchBySubTopicId/:subTopicId',function(req,res){
  let subTopicId=req.params.subTopicId;
  try
  {
    controller.fetchQuestionBySubTopicId(subTopicId).then((successResult)=>{
     logger.info('Get All Data of Question');
     return res.status(203).send({'msg':successResult});
   }, (errResult) => {
      //log the error for internal use
      logger.error('Internal error occurred');
      return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
    });
  }
  catch(err) {
    // Log the Error for internal use
    logger.fatal('Exception occurred' + err);
    res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
    return;
  }
});

// route for delete question by questionId
router.delete('/:questionId',(req,res)=> {
  let userInfo=req.decoded;
  try  {
    let questionId=req.params.questionId;
    controller.deleteById(questionId,req.decoded).then((successResult) => {
     logger.info(successResult.msg);
     return res.status(203).send(successResult);
   }, (error) => {
     logger.error("Requested by: "+userInfo.username);
     logger.error(error.stack || error);
     if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  });
  } catch(err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userInfo.username);
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

module.exports = router;
