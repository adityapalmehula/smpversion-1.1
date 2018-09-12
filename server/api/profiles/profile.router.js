const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const logger = require('./../../services/app.logger');
const controller = require('./profile.controller');
const loggerConstants = require('./../../constants/logger').BASICPROFILE;
const authenticate = require('./../authenticateToken/authToken.router');
const fileUpload = require('./../fileUpload/upload');
const CustomError = require('./../../services/custom-error');


// router.get('/country',(req,res)=> {

// 	let allData = [];
// 	let state = String;
// 	let city = [];
// 	  var request = require('request');
// request('https://battuta.medunes.net/api/city/in/search/?region=West Bengal&key=103f1644b7d145f526b29c271a6d3061', function (error, response, body) {
//     allData=JSON.parse(body);
//     state = allData[0].region;
//    city = allData.map((obj) => {
//    	return {'city':obj.city}
//    });
//    try {
//     controller.getCountry(state , city).then(successResult=> {
//       return res.status(200).send(successResult);
//     },error=> {
     
//     })
//   }catch (err) {
//    // return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
//   }
// });
// });


//get user details on basis of role
// router.get('/country',(req,res)=> {
//   let userId = req.decoded.userId;
//     let role = req.decoded.role;
//   try {
//     logger.info(loggerConstants.REQUEST_FOR_USER_DATA + userId);
//     controller.getCountry().then(successResult=> {
//       logger.info(successResult.msg +" for: "+userId);
//       return res.status(200).send(successResult);
//     },error=> {
//       logger.error(error.msg || error +" for: "+ userId);
//       if(error instanceof CustomError) {
//         return res.status(417).json({ msg: error.message });
//       }else{
//         return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
//       }
//     })
//   }catch (err) {
//     logger.error(loggerConstants.ERROR_OCCURED_IN_GET_USER_INFO_FOR +userId +err.stack || err);
//     return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
//   }
// });


// router for upload file
router.put('/image', function(req, res) {
  let userId = req.decoded.userId;
  let username = req.decoded.name;
  let userRole = req.body.role;
  let fileData = req.body.image;
  try {
    let uploadDetails={
      userId:userId,
      title:username,
      fileData:fileData,
      requestType:'profiles'
    }
    fileUpload.uploadfile(uploadDetails).then((successfull)=>{
      let filePath = successfull.filename;
      let extension = successfull.extension;
      controller.uploadProfileImage(filePath, extension, userId, userRole).then((successResult) => {
        logger.info(successfull);
        return res.status(201).send({success:true,msg:loggerConstants.PROFILE_IS_SUCCESSFULLY_UPDATED});
      }, (errResult) => {
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
        return res.status(500).send(errResult);
      });
    },err=>{
     return res.status(500).send(err);
   });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//router forUpdate User profile 
router.put('/', function(req, res) {
  try {
    let profileData = req.body;
    let userId = req.decoded.userId;
    let role = req.body.role;
    logger.info(loggerConstants.UPDATE_PROFILE_DATA_OF_USER, profileData.name);
    controller.updateBasicProfile(profileData, userId, role).then(success => {
      logger.info(loggerConstants.PROFILE_IS_SUCCESSFULLY_UPDATED);
      return res.status(201).send({success:true,msg:loggerConstants.PROFILE_IS_SUCCESSFULLY_UPDATED});
    }, errResult => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(403).send(errResult);
    })
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//router for Update user Address
router.put('/address', function(req, res) {
  try {
    let profileaddressData = req.body;
    let userId = req.decoded.userId;
    let role = req.body.role;
    logger.info(loggerConstants.UPDATE_PROFILE_DATA_OF_USER, profileaddressData.name);
    controller.updateProfileAddress(profileaddressData, userId, role).then(success => {
      logger.info(loggerConstants.ADDRESS_IS_SUCCESSFULLY_UPDATED);
      return res.status(201).send({success:true,msg:loggerConstants.ADDRESS_IS_SUCCESSFULLY_UPDATED});
    }, errResult => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(403).send(errResult);
    })
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

// router for add socail profile in db.
router.put('/socailInfo', function(req, res) {
  try {
    let socailData = req.body;
    let userId = req.decoded.userId;
    let role = req.body.role;
    logger.info(loggerConstants.UPDATE_PROFILE_DATA_OF_USER, socailData.name);
    controller.updateSocailProfile(socailData, userId, role).then(success => {
      logger.info(loggerConstants.SOCAILPROFILE_IS_SUCCESSFULLY_UPDATED);
      return res.status(201).send({success:true,msg:loggerConstants.SOCAILPROFILE_IS_SUCCESSFULLY_UPDATED});
    }, errResult => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    })
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

// router for Update user academic details
router.put('/academicInfo', function(req, res) {
  try {
    let profileacademicData = req.body;
    let userId = req.decoded.userId;
    let role = req.body.role;
    logger.info(loggerConstants.UPDATE_PROFILE_DATA_OF_USER, profileacademicData.name);
    controller.updateProfileAcademic(profileacademicData, userId, role).then(success => {
      logger.info(loggerConstants.ACADEMIC_IS_SUCCESSFULLY_UPDATED);
      return res.status(201).send({success:true,msg:loggerConstants.ACADEMIC_IS_SUCCESSFULLY_UPDATED});
    }, errResult => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(403).send(errResult);
    })
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

// router for delete seleted url of socail profile.
router.delete('/:selectedUrl', function(req, res) {
  let urlId=req.params.selectedUrl;
  try
  {
    controller.deleteProfileUrls(urlId,req.decoded).then((successResult)=>{
      return res.status(201).send(successResult);
    }, (errResult) => {
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

// Edit and update Selected Social Profile urls -
router.put('/editSocailInfo', function(req, res) {
  try {
    let editurlData = req.body;
    let userId = req.decoded.userId;
    let role = req.body.role;
    logger.info(loggerConstants.UPDATE_PROFILE_DATA_OF_USER, editurlData.name);
    controller.updateSelecteUrls(editurlData, userId, role).then(success => {
      logger.info(loggerConstants.SOCAILPROFILEURL_IS_SUCCESSFULLY_UPDATED);
      return res.status(201).send({success:true,msg:loggerConstants.SOCAILPROFILEURL_IS_SUCCESSFULLY_UPDATED});
    }, errResult => {
      return res.status(500).send(errResult);
    })
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//get user details on basis of role
router.get('/',(req,res)=> {
  let userId = req.decoded.userId;
    let role = req.decoded.role;
  try {
    logger.info(loggerConstants.REQUEST_FOR_USER_DATA + userId);
    controller.getUserDetail(userId,role).then(successResult=> {
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
    logger.error(loggerConstants.ERROR_OCCURED_IN_GET_USER_INFO_FOR +userId +err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});


module.exports = router;