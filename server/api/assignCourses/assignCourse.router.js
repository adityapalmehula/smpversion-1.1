const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const controller = require('./assignCourse.controller');
const loggerConstants= require('./../../constants/logger').ASSIGN_COURSE;
const CustomError = require('./../../services/custom-error');

/*
* update assing course rating   
*/
router.put('/rating/:courseId',(req,res)=>{
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


// Set learning status 

router.put('/learningStatus', (req,res)=>{
  let userId = req.decoded.userId;
  try {
   let statusData=req.body;
   logger.info(loggerConstants.REQUEST_FOR_SET_STATUS_OF_LEARNING_DATA + userId);
   if(!userId || !statusData || !statusData.courseId || !statusData.topicId || !statusData.subtopicId) {
    logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
    return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
  }
  controller.setLearningStatus(statusData,userId).then(successResult=> {
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
  logger.error(loggerConstants.ERROR_OCCURED_IN_SET_STATUS_OF_LEARNING_DATA_FOR +userId +err.stack || err);
  return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
}
})


/*
*fetch assign course based on studentId and courseId
*/
router.get('/:courseId',(req,res)=> {
  let studentId = req.decoded.userId;
  try {
    let courseId = req.params.courseId;
    if(!studentId || !courseId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    controller.getAssignCourse(studentId,courseId).then(successResult=> {
      logger.info(successResult.msg +" requested by: "+studentId);
      return res.status(200).send(successResult);
    },error=> {
      logger.error("Requested by: "+studentId);
      logger.error(error.stack || error);
      if(error instanceof CustomError) {
        return res.status(417).json({ msg: error.message });
      }else {
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    })
  }catch (err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+studentId+' '+err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

module.exports = router;