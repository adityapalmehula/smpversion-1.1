const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const controller = require('./assessment.controller');
const loggerConstants= require('./../../constants/logger').ASSESSMENT;
const CustomError = require('./../../services/custom-error');

//save assessment 
router.post('/',(req,res)=> {
  let user=req.decoded.userId;
  let assessment=req.body;
  try {
    if(!assessment || !assessment.courseId){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.save(assessment,req.decoded).then(successResult=>{
    logger.info(successResult.msg +" requested by: "+user);
    return res.status(200).send(successResult);
  },error=> {
    logger.error(error.stack || error);
    if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
 }catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

// get assessments
router.get('/',(req,res)=> {
  let queryParams=req.query || {};
  let user=req.decoded.userId;
  try {
   controller.getAssessments(queryParams,req.decoded).then(successResult=> {
    logger.info(successResult.msg +" requested by: "+user);
    return res.status(200).send(successResult);
  },error=> {
    logger.error(error.msg || error +" requested by: "+ user);
    return res.status(417).json(error);
  })
 }catch (err) {
  logger.error(err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

// get assessments by id
router.get('/:id',(req,res)=> {
 let id=req.params.id;
 let user=req.decoded.username;
 try {
  if(!id){
   logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
   return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
 }
 controller.getAssessmentsById(id).then(successResult=>{
  logger.info(successResult.msg +" requested by: "+user);
  return res.status(200).send(successResult);
},error=> {
  logger.error(error.msg || error +" requested by: "+ user);
  return res.status(417).json(error);
})
}catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

// get assessments by id
router.post('/generate/practiceTest',(req,res)=> {
 let user=req.decoded.username;
 try {
   let queryParams=req.query || {};
   if(!queryParams || !req.body){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.generatePracticeTest(req.body,queryParams,req.decoded).then(successResult=> {
    logger.info(successResult.msg +" requested by: "+user);
    return res.status(200).send(successResult);
  },error=> {
   logger.error(error.stack || error);
   if(error instanceof CustomError) {
    return res.status(417).json({ msg: error.message });
  }else {
    return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
  }
})
 }catch (err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

// to submit assessmentData
router.put('/:id',(req, res) => {
  let assessmentData = req.body;
  let userInfo=req.decoded;
  let id=req.params.id;
  try {
   if(!id || !assessmentData || !userInfo){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.updateAssessmentInfo(id,assessmentData,userInfo).then(successResult=>{
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
 }catch(err) {
  logger.error(err.stack || err);
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userInfo.username);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

// route for delete assessment by assessment
router.delete('/:id',(req,res)=> {
  let userInfo=req.decoded;
  try  {
    let id=req.params.id;
    if(!id || !userInfo){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.deleteById(id,userInfo).then((successResult) => {
    logger.info(successResult.msg +" requested by: "+userInfo.username);
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
  logger.error('Requested by: '+userInfo.username);
  logger.error(err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});


/*// get assessments by TopicId
router.get('/topicId/:topicId',(req,res)=> {
 let topicId=req.params.topicId;
 let user=req.decoded.username;
 try {
  if(!topicId){
   logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
   return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
 }
 controller.getAssessmentsByTopicId(topicId).then(successResult=> {
  logger.info(successResult.msg +" requested by: "+user);
  return res.status(200).send(successResult);
},error=> {
  logger.error(error.msg || error +" requested by: "+ user);
  return res.status(417).json(error);
})
}catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});*/



// get assessments (without answers) by assessment id 
/*router.get('/:id',(req,res)=> {
 let id=req.params.id;
 let user=req.decoded.username;
 try {
  if(!id){
   logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
   return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
 }
 controller.getAssessmentsWithoutAns(id).then(successResult=>{
  logger.info(successResult.msg +" requested by: "+user);
  return res.status(200).send(successResult);
},error=> {
  logger.error(error.msg || error +" requested by: "+ user);
  return res.status(417).json(error);
})
}catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});
*/

/*
// to Get assessmentData
router.get('/:studentId', function(req, res) {
  let studentId = req.params.studentId;
  logger.debug('Get parameter and store into studentId');
  try {
    if (!studentId) {
      logger.error('studentId not found');
      throw new Error('Invalid inputs passed...!');
    }
    controller.quizResult(studentId).then((successResult)=> {
      logger.info('Get successResult successfully and return back');
      return res.status(201).send(successResult);
    }, (errResult)=> {
            // Log the error for internal use
            logger.error('Internal error occurred');
            return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
          });
  } catch (err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed , please check the request and try again..!' });
        return;
      }
    });*/
/*
// for time basis add student
router.post('/student', function(req, res) {
  let assessmentData = req.body;
  logger.debug('Get object and store into assessmentData');
  try {
    if (!assessmentData) {
      logger.error('assessmentData not found');
      throw new Error('Invalid inputs passed...!');
    }
    controller.insertStudent(assessmentData).then((successResult)=> {
      logger.info('Get successResult successfully and return back');
      return res.status(201).send(successResult);
    }, (errResult)=> {
            // Log the error for internal use
            logger.error('Internal error occurred');
            return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
          });
  } catch (err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
      }
    });*/

//get quizzes
/*router.get('/quiz/quizzes', function(req, res) {
  try {
    controller.getQuizzes().then((successResult)=> {
      logger.info('Get quizzes successfully and return back');
      return res.status(201).send(successResult);
    }, (errResult)=> {
      logger.error('Internal error occurred');
      return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
    });
  } catch (err) {
    logger.fatal('Exception occurred' + err);
    res.send({ error: 'Failed , please check the request and try again..!' });
    return;
  }
});*/


router.get('/id/:id', function(req, res) {
  let quizId = req.params.id;
  logger.debug('Get parameter and store into quizId');
  try {
    if (!quizId) {
      logger.error('quizId not found');
      throw new Error('Invalid inputs passed...!');
    }
    controller.getQuizById(quizId).then((successResult)=> {
      logger.info('Get successResult successfully and return back');
      return res.status(201).send(successResult);
    }, (errResult)=> {
      logger.error('Internal error occurred');
      return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
    });
  }catch (err) {
    logger.fatal('Exception occurred' + err);
    res.send({ error: 'Failed , please check the request and try again..!' });
    return;
  }
});

// get assessments (without answers) by assessment id 
router.get('/take-assessment/:id',(req,res)=> {
 let user=req.decoded.userId;
 try {
   let id=req.params.id;
   if(!id){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({ success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.getAssessmentsWithoutAns(id).then(successResult=> {
    logger.info(successResult.msg +" requested by: "+user);
    return res.status(200).send(successResult);
  },error=> {
    logger.error(error.msg || error +" requested by: "+ user);
    return res.status(417).json(error);
  })
 }catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user);
  logger.error(err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

// get assessments based on 
router.get('/subtopics/:id',(req,res)=> {
 let user=req.decoded.userId;
 try {
   let subTopicId=req.params.id;
   if(!subTopicId){
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({ success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.getAssessmentsBySubTopicId(subTopicId).then(successResult=> {
    logger.info(successResult.msg +" requested by: "+user);
    return res.status(200).send(successResult);
  },error=> {
    logger.error(error.msg || error +" requested by: "+ user);
    return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
  })
 }catch (err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user);
  logger.error(err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

module.exports = router;