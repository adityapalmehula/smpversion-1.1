var express = require('express');
var router = express.Router();
const logger = require('./../../services/app.logger');
var controller = require('./instructor.controller');
const loggerConstants= require('./../../constants/logger').INSTRUCTOR;


//Register instructor data
router.post('/', (req, res) => {
	let instructorData = req.body;
  let currentUser = req.decoded;
  let platform=req.headers.platform;
	logger.debug(loggerConstants.GET_OBJECT_AND_STORE_INSTRUCTOR);
  try {
    if (!instructorData) {
      logger.error(loggerConstants.INSTRUCTOR_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    controller.registerInstructor(instructorData, currentUser,platform).then((successResult) => {
      logger.info(loggerConstants.INSTRUCTOR_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});
//register instructor
// router.post('/', (req, res, next)=> {
	
// 	controller.register(req, res).then((successResult)=> {
// 		logger.info('Get successesult successfully and return back');
// 		return res.status(201).send(successResult);
// 	},(error)=>{
// 		logger.error('Internal error occurred');
// 		return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
// 	});
// });

//get instructor on basis of mongo id
// router.get('/id',(req,res)=> {
// 	try {
// 		let _id=req.decoded.userId;
// 		logger.info(loggerConstants.REQUEST_FOR_INSTRUCTOR_DATA+_id);
// 		controller.findById(_id).then(successResult=> {
// 			logger.info(successResult.msg +" for: "+_id);
// 			return res.status(200).send(successResult);
// 		},error=> {
// 			logger.error(error.msg || error +" for: "+ _id);
// 			return res.status(417).json(error);
// 		})
// 	}catch (err) {
// 		logger.error(loggerConstants.ERROR_OCCURED_IN_GET_INSTRUCTOR_INFO_FOR +_id +err.stack || err);
// 		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR_OCCURED });
// 	}
// });

//get Instructor by id 
router.get('/:id',function(req,res){
  try {
    let insId=req.params.id;
    controller.getInstructorById(insId).then((successResult)=>{
      logger.info(successResult.msg +" for: "+insId);
			return res.status(200).send(successResult);
    },(error) => {
     logger.error(error.stack || error);
     return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
   });
  }catch(err) {
   logger.error(err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});


//get all instructors
router.get('/',function(req,res){
	try
	{
		controller.findAll().then((successResult)=>{
			return res.status(203).send(successResult);
		}, (errResult) => {
			logger.error('Internal error occurred');
			return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
		});
	}
	catch(err) {
		logger.fatal('Exception occurred' + err);
		return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR_OCCURED, data: err });
	}
});

//List all active instructors only
router.get('/list',function(req,res){
	try
	{
		controller.listAll().then((successResult)=>{
			return res.status(203).send(successResult);
		}, (errResult) => {
			logger.error('Internal error occurred');
			return res.status(204).send(errResult);
		});
	}
	catch(err) {
		logger.fatal('Exception occurred' + err);
		res.send({ error: 'Failed to complete, please check the request and try again..!' });
		return;
	}
});


/*
* To update data 
*/
router.put('/:id',function(req, res){
	let instructor=req.body;
	let _id=req.params.id;
	try {
		if(!instructor){
			logger.error('Instructor data not found');
			throw new Error('Invalid inputs passed...!');
		}
		controller.update(instructor,_id,req.decoded).then((successResult) => {
			logger.info('Update successfully');
			return res.status(201).send(successResult);
		}, (errResult)=>{
			logger.error('Internal error occurred');
			return res.status(500).send({error : 'Internal error occurred, please try later..!' });
		});
	} catch(err) {
		logger.fatal('Exception occurred' + err);
		res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
		return;
	}
});

/*
* To update instructor data....
*/
//update school 
// router.put('/:id',function(req, res){
//   try {
//     let school=req.body;
//     let _id=req.params.id;
//     if(!school){
//       logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
//       return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
//     }
//     controller.update(school,_id,req.decoded).then((successResult) => {
//       logger.info(successResult.msg +" for "+_id);
//       return res.status(200).send(successResult);
//     },(error)=>{
//      logger.error(error.stack || error);
//      if(error instanceof CustomError) {
//       return res.status(417).json({ msg: error.message });
//     }else {
//       return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
//     }
//   })
//   } catch(err) {
//    logger.error(err.stack || err);
//    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
//  }
// });

// delete instructor by id
router.delete('/:id',function(req,res){
	let _id=req.params.id;
	try
	{
		controller.deleteRecord(_id,req.decoded).then((successResult)=>{
			logger.info('Delete request for instructor data');
			return res.status(203).send(successResult);
		}, (errResult) => {
            //log the error for internal use
            logger.error('Internal error occurred');
            return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
          });
	}
	catch(err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete, please check the request and try again..!' });
        return;
      }
    });

module.exports = router;
