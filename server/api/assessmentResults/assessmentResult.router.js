const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const controller = require('./assessmentResult.controller');
const loggerConstants= require('./../../constants/logger').ASSESSMENT_RESULT;
const CustomError = require('./../../services/custom-error');

//save assessment results 
router.post('/', (req, res)=> {
  let user=req.decoded.username;
  try {
    let assessmentResult = req.body;
    if(!assessmentResult) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.save(assessmentResult,req.decoded).then(successResult=> {
      logger.info("Assessment Result: "+ successResult.msg +" requested by: "+user);
      return res.status(201).send(successResult);
    },(error)=>{
     logger.error(error.stack || error);
     if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  });
  }catch(err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

//save assessment results 
router.get('/assessmentInfo/:id', (req, res)=> {
	let user=req.decoded.username;
  let queryFlag = req.query.q;
	try {
    let assessmnetId= req.params.id;
    if(!assessmnetId) {
     logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
     return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
   }
   controller.getAssessmentDetails(assessmnetId,req.decoded,queryFlag).then(successResult=> {
     logger.info("Assessment Result: "+ successResult.msg +" requested by: "+user);
     return res.status(201).send(successResult);
   },(error)=>{
     logger.error(error.stack || error);
     if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else {
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  });
 }catch(err) {
  logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
});

//save assessment results
router.post('/practice', (req, res)=> {
  let user=req.decoded.username;
  try {
    let assessmentResult = req.body;
    if(!assessmentResult) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.persistPracticeDetails(assessmentResult,req.decoded).then(successResult=> {
      logger.info("Assessment Result: "+ successResult.msg +" requested by: "+user);
      return res.status(201).send(successResult);
    },(error)=>{
      logger.error(error.stack || error);
      if(error instanceof CustomError) {
        return res.status(417).json({ msg: error.message });
      }else {
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    });
  }catch(err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+user+' '+err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

//get assessment results by assessment id
router.get('/assessmentId/:assessmentId',(req,res)=> {
	let user=req.decoded.username;
	try {
		let assessmentId=req.params.assessmentId;
		if(!assessmentId){
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		controller.findByAssessmentId(assessmentId).then(successResult=>{
			logger.info("Assessment Result: "+ successResult.msg +" requested by: "+user);
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

//get assessment result by assessment id and student id
router.get('/studentId/assessmentId/:assessmentId',(req,res)=> {
	let user=req.decoded.username;
	try {
		let assessmentId=req.params.assessmentId;
		if(!assessmentId){
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		controller.getStudentAssessmentResults(assessmentId,req.decoded).then(successResult=>{
			logger.info("Assessment Result: "+ successResult.msg +" requested by: "+user);
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

//get assessment results by assessment-result id
router.get('/:id',(req,res)=> {
	let user=req.decoded.username;
	try {
		let id=req.params.id;
		if(!id){
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({success: false,msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		controller.findById(id).then(successResult=>{
			logger.info("Assessment Result: "+ successResult.msg +" requested by: "+user);
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

/*
* update assessment result on user answer submiti
*/
router.put('/:id',(req,res)=>{
	let user=req.decoded.username;
	try{
		let id=req.params.id;
		if(!req.body) {
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		controller.update(req.body,id,req.decoded).then(successResult=> {
			logger.info(successResult.msg +" requested by: "+user);
			return res.status(200).send(successResult);
		},error=> {
			logger.error("Requested by: "+user);
			logger.error(error.stack || error);
			return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
		});
	}catch(err){
		logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+user);
		logger.error(err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
	}
})

/*
* update assessment result on user assessment finish
*/
router.put('/result/:id',(req,res)=>{
  let user=req.decoded.username;
  try{
    let id=req.params.id;
    /*if(!req.body) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }*/
    controller.submitAndFinishAssessment(id,req.body,req.decoded).then(successResult=> {
      logger.info(successResult.msg +" requested by: "+user);
      return res.status(200).send(successResult);
    },error=> {
      logger.error("Requested by: "+user);
      logger.error(error.stack || error);
      return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
    });
  }catch(err){
    logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+user);
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
})

/*
* update user answers
*/
router.put('/userAnswers/:id',(req,res)=>{
  let user=req.decoded.username;
  try{
    let id=req.params.id;
    if(!req.body.questions) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.saveUserAnswers(id,req.body,req.decoded).then(successResult=> {
      logger.info(successResult.msg +" requested by: "+user);
      return res.status(200).send(successResult);
    },error=> {
      logger.error("Requested by: "+user);
      logger.error(error.stack || error);
      return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
    });
  }catch(err){
    logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+user);
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
})

/*
* update assessment result on user assessment finish
*/
router.put('/submit/:id',(req,res)=>{
	let user=req.decoded.username;
	try{
		let id=req.params.id;
		if(!req.body.questions) {
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		controller.finishAssessment(id,req.body,req.decoded).then(successResult=> {
			logger.info(successResult.msg +" requested by: "+user);
			return res.status(200).send(successResult);
		},error=> {
			logger.error("Requested by: "+user);
			logger.error(error.stack || error);
			return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
		});
	}catch(err){
		logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+user);
		logger.error(err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
	}
})


/*
* update question and assessment time
*/
router.put('/question/time/:id',(req,res)=>{
	let user=req.decoded.username;
	try{
		let id=req.params.id;
		if(!req.body) {
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		controller.updateTimeAndStatus(id,req.body,req.decoded).then(successResult=> {
			logger.info(successResult.msg +" requested by: "+user);
			return res.status(200).send(successResult);
		},error=> {
			logger.error("Requested by: "+user);
			logger.error(error.stack || error);
			return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
		});
	}catch(err){
		logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+user);
		logger.error(err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
	}
})

/*
* update questions for review
*/
router.put('/questions/review/:id',(req,res)=>{
	let user=req.decoded.username;
	try{
		let id=req.params.id;
		if(!req.body) {
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		controller.updateQuestionsForReview(id,req.body,req.decoded).then(successResult=> {
			logger.info(successResult.msg +" requested by: "+user);
			return res.status(200).send(successResult);
		},error=> {
			logger.error("Requested by: "+user);
			logger.error(error.stack || error);
			return res.status(417).json({msg: loggerConstants.INTERNAL_ERROR });
		});
	}catch(err){
		logger.error(loggerConstants.INTERNAL_ERROR+' requested by: '+user);
		logger.error(err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
	}
});

//get assessment status for user
router.get('/status/:assessmentId',(req,res)=> {
  try {
    let assessmentId=req.params.assessmentId;
    if(!assessmentId){
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.getUserAssessmentStatus(assessmentId,req.decoded).then(successResult=>{
      return res.status(200).send(successResult);
    },error=> {
      logger.error(error.msg || error);
      return res.status(417).json({ success: false,msg: loggerConstants.INTERNAL_ERROR });
    })
  }catch (err) {
    logger.error(err.stack || err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR });
  }
});


module.exports = router;
