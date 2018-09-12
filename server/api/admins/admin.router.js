var express = require('express');
var router = express.Router();
const logger = require('./../../services/app.logger');
var controller = require('./admin.controller');
const loggerConstants= require('./../../constants/logger').ADMIN;


//register admin
router.post('/', (req, res, next)=> {
	let platform=req.headers.platform;
	controller.register(req, res,platform).then((successResult)=> {
		logger.info(loggerConstants.REQUEST_FOR_ADMIN_DATA);
		return res.status(201).send(successResult);
	},(error)=>{
		logger.error(loggerConstants.ERROR_OCCURED_IN_GET_ADMIN_INFO_FOR +_id +err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR_OCCURED });
	});
});

//update user profiles images
router.put('/updateProfiles', (req, res, next)=> {
	controller.updateProfiles(req, res).then((successResult)=> {
		logger.info(loggerConstants.REQUEST_FOR_ADMIN_DATA);
		return res.status(201).send(successResult);
	},(error)=>{
		logger.error(loggerConstants.ERROR_OCCURED_IN_GET_ADMIN_INFO_FOR +_id +err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR_OCCURED });
	});
});

// update course image
router.put('/updateCourses', (req, res, next)=> {
	controller.updateCourses(req, res).then((successResult)=> {
		logger.info(loggerConstants.REQUEST_FOR_ADMIN_DATA);
		return res.status(201).send(successResult);
	},(error)=>{
		logger.error(loggerConstants.ERROR_OCCURED_IN_GET_ADMIN_INFO_FOR +_id +err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR_OCCURED });
	});
});

// update media image
router.put('/updateMedia', (req, res, next)=> {
	controller.updateMedia(req, res).then((successResult)=> {
		logger.info(loggerConstants.REQUEST_FOR_ADMIN_DATA);
		return res.status(201).send(successResult);
	},(error)=>{
		logger.error(loggerConstants.ERROR_OCCURED_IN_GET_ADMIN_INFO_FOR +_id +err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR_OCCURED });
	});
});

// update media image
router.put('/updateTextBookSolutions', (req, res, next)=> {
	controller.textBook(req, res).then((successResult)=> {
		logger.info(loggerConstants.REQUEST_FOR_ADMIN_DATA);
		return res.status(201).send(successResult);
	},(error)=>{
		logger.error(loggerConstants.ERROR_OCCURED_IN_GET_ADMIN_INFO_FOR +_id +err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR_OCCURED });
	});
});

// update media image
router.get('/getFiles', (req, res, next)=> {
	controller.getFiles(req, res).then((successResult)=> {
		logger.info(loggerConstants.REQUEST_FOR_ADMIN_DATA);
		return res.status(201).send(successResult);
	},(error)=>{
		logger.error(loggerConstants.ERROR_OCCURED_IN_GET_ADMIN_INFO_FOR +_id +err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR_OCCURED });
	});
});

//get admin on basis of mongo id
router.get('/id',(req,res)=> {
	let _id=req.decoded.userId;
  try {
		logger.info(loggerConstants.REQUEST_FOR_ADMIN_DATA+_id);
		controller.findById(_id).then(successResult=> {
			logger.info(successResult.msg +" for: "+_id);
			return res.status(200).send(successResult);
		},error=> {
			logger.error(error.msg || error +" for: "+ _id);
			return res.status(417).json(error);
		})
	}catch (err) {
		logger.error(loggerConstants.ERROR_OCCURED_IN_GET_ADMIN_INFO_FOR +_id +err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR_OCCURED });
	}
});


// //get all schools
// router.get('/',function(req,res){
// 	try
// 	{
// 		controller.findAll().then((successResult)=>{
// 			return res.status(203).send(successResult);
// 		}, (errResult) => {
// 			logger.error('Internal error occurred');
// 			return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
// 		});
// 	}
// 	catch(err) {
// 		logger.fatal('Exception occurred' + err);
// 		res.send({ error: 'Failed to complete, please check the request and try again..!' });
// 		return;
// 	}
// });


// /*
// * To update data 
// */
// router.put('/id/:id',function(req, res){
// 	let admin=req.body;
// 	let _id=req.params.id;
// 	try {
// 		if(!admin){
// 			logger.error('Instructor data not found');
// 			throw new Error('Invalid inputs passed...!');
// 		}
// 		controller.update(admin,_id).then((successResult) => {
// 			logger.info('Update successfully and return back');
// 			return res.status(201).send(successResult);
// 		}, (errResult)=>{
// 			logger.error('Internal error occurred');
// 			return res.status(304).send({error : 'Internal error occurred, please try later..!' });
// 		});
// 	} catch(err) {
// 		logger.fatal('Exception occurred' + err);
// 		res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
// 		return;
// 	}
// });

// router.delete('/:id',function(req,res){
// 	let _id=req.params.id;
// 	try
// 	{
// 		controller.deleteRecord(_id).then((successResult)=>{
// 			logger.info('Delete request for admin data');
// 			return res.status(203).send(successResult);
// 		}, (errResult) => {
//             //log the error for internal use
//             logger.error('Internal error occurred');
//             return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
//           });
// 	}
// 	catch(err) {
//         // Log the Error for internal use
//         logger.fatal('Exception occurred' + err);
//         res.send({ error: 'Failed to complete, please check the request and try again..!' });
//         return;
//       }
//     });

module.exports = router;
