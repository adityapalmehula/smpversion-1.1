var express = require('express');
var router = express.Router();
const logger = require('./../../services/app.logger');
var controller = require('./subtopic.controller');
const loggerConstants= require('./../../constants/logger');

// route for post subTopic
router.post('/', function(req, res) {
	let subTopicData = req.body;
	let createdId = req.decoded.userId;
	let createdName = req.decoded.username;
	let role = req.decoded.role;
	logger.debug(loggerConstants.GET_OBJECT_AND_STORE_SUBTOPIC);
	try {
		if (!subTopicData) {
			logger.error(loggerConstants.SUBTOPIC_DATA_NOT_FOUND);
			throw new Error(loggerConstants.INVALID_INPUTS);
		}
		controller.createSubTopic(subTopicData,req.decoded).then((successResult)=> {
			logger.info(loggerConstants.SUBTOPIC_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
			return res.status(201).send(successResult);
		}, (errResult)=> {
            // Log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(500).send(errResult);
          });
	} catch (err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });

// Delete subTopic routes
router.delete('/delete/:subTopicId',function(req,res){
	let subTopicId=req.params.subTopicId;
	try
	{
		controller.deleteSubTopic(subTopicId,req.decoded).then((successResult)=>{
			logger.info(loggerConstants.DATA_DELETED_FROM_SUBTOPIC);
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
/*
* To update SubTopic data 
*/
router.put('/id/:subTopicId',function(req, res){
	let subTopicData=req.body;
	let subTopicId=req.params.subTopicId;

	logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': subTopicData');
	try {
		if(!subTopicData){
			logger.error(loggerConstants.SUBTOPIC_DATA_NOT_FOUND);
			throw new Error(loggerConstants.INVALID_INPUTS);
		}
		controller.updateSubTopic(subTopicData,subTopicId,req.decoded).then((successResult) => {
			logger.info(loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
			return res.status(201).send(successResult);
		}, (errResult)=>{
        // log the error for internal use
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
        return res.status(500).send(errResult);
      });
	} catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });


/*
* rearrange learning path on basis of subtopic Id
*/
router.put('/:subTopicId/learningPath/rearrange',function(req, res){
	let subTopicData=req.body;
	let subTopicId=req.params.subTopicId;

	logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': subTopicData');
	try {
		if(!subTopicData){
			logger.error(loggerConstants.SUBTOPIC_DATA_NOT_FOUND);
			throw new Error(loggerConstants.INVALID_INPUTS);
		}
		controller.rearrangeLPBySubtopicId(subTopicData, subTopicId, req.decoded).then((successResult) => {
			logger.info(loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
			return res.status(201).send(successResult);
		}, (errResult)=>{
        // log the error for internal use
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
        return res.status(403).send(errResult);
      });
	} catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });


/*
* To insert learning Data
*/
router.put('/:id/learningData',function(req, res){
	let subTopicId=req.params.id;
	let learningData=req.body;
	logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': learningData');
	try {
		if(!learningData){
			logger.error(loggerConstants.LEARNING_DATA_NOT_FOUND);
			throw new Error(loggerConstants.INVALID_INPUTS);
		}
		controller.insertLearningData(subTopicId,learningData,req.decoded).then((successResult) => {
			logger.info(loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
			return res.status(201).send(successResult);
		}, (errResult)=>{
                // log the error for internal use
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
                return res.status(403).send(errResult);
              });
	} catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });

/*
* To update learning path
*/
router.put('/:id/learningData/:learningDataId',function(req, res){
	let subTopicId=req.params.id;
	let learningData=req.body;
	let lPId=req.params.learningDataId;
	logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': learningData');
	try {
		if(!learningData){
			logger.error(loggerConstants.LEARNING_DATA_NOT_FOUND);
			throw new Error(loggerConstants.INVALID_INPUTS);
		}
		controller.updateLearningData(subTopicId,lPId,learningData,req.decoded).then((successResult) => {
			logger.info(loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
			return res.status(201).send(successResult);
		}, (errResult)=>{
                // log the error for internal use
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
                return res.status(403).send(errResult);
              });
	} catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });


/*
* To change order of stepper learning path
*/
router.put('/:id/learningData/changeOrder',function(req, res){
	let subTopicId=req.params.id;
	let learningData=req.body;
	logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': learningData');
	try {
		if(!learningData){
			logger.error(loggerConstants.LEARNING_DATA_NOT_FOUND);
			throw new Error(loggerConstants.INVALID_INPUTS);
		}
		controller.changeOrderOfLearningData(subTopicId,learningData,req.decoded).then((successResult) => {
			logger.info(loggerConstants.SUBTOPIC_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
			return res.status(201).send(successResult);
		}, (errResult)=>{
                // log the error for internal use
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
                return res.status(403).send(errResult);
              });
	} catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });


// Delete learningpath routes
router.delete('/:subTopicId/learningDataId/:id',function(req,res){
	let subTopicId=req.params.subTopicId;
	let learningDataId =req.params.id;
	try
	{
		controller.deleteLearningData(subTopicId,learningDataId,req.decoded).then((successResult)=>{
			logger.info(loggerConstants.LEANING_DATA_DELETED_FROM_SUBTOPIC);
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


// Get subTopic routes
router.get('/subTopicId/:subTopicId',function(req,res){
	let subTopicId=req.params.subTopicId;
	try {
		controller.getSubTopicData(subTopicId).then((successResult)=>{
			return res.status(203).send(successResult);
		},(errResult) => {
			logger.error(errResult);
			return res.status(204).send({ error: errResult });
		});
	} catch(err) {
		logger.error('Exception occurred' + err);
		res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
		return;
	}
});

//get subtopic by id
router.get('/:id',(req,res)=> {
	let user=req.decoded.username;
	try {
		let subTopicId=req.params.id;
		if(!subTopicId) {
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		controller.getSubtopicById(subTopicId).then(successResult=> {
			logger.info(successResult.msg +" for: "+user);
			return res.status(200).send(successResult);
		},error=> {
			logger.error(error.msg || error +" for: "+ user);
			return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
		})
	}catch(err) {
		logger.error(err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
	}
});

module.exports = router;
