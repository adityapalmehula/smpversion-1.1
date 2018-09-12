const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const helpController = require('./help.controller');
const loggerConstants = require('./../../constants/logger');
const fileUpload = require('./../fileUpload/upload');
const helpConstants = loggerConstants.HELPS;

//save help data
router.post('/', (req, res) => {
  let platform=req.headers.platform;
  let startIndex ='',filePath='', extension='';
  let helpData = {};
  let currentUser = req.decoded;
  logger.debug(helpConstants.GET_OBJECT_AND_STORE_HELP);
  try {
    req.index=4;
    if (!helpData || !currentUser) {
      logger.error(helpConstants.HELP_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    if (platform === 'Mobile') {
      let uploadDetails={
        fileData:req.body.attachment,
        requestType:'helps'
      }
      helpData = req.body;
      if (req.body.attachment) {
        fileUpload.uploadfile(uploadDetails).then((successfull)=>{
          let filePath = successfull.filename;
          let extension = successfull.extension;
          let attachment = {
              type: extension,
              path: filePath
            }
            helpData['attachment']=attachment;
            saveHelp(res, helpData, currentUser);
        },err=>{
          logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err.msg);
         return res.status(500).send(err);
       });
      } else {
        saveHelp(res, helpData, currentUser);
      }
    } else{
    fileUpload.upload(req, res, function(err) {
      if(err) {
        return res.status(500).send({ success: false, msg: loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM });
      } else {
        helpData = req.body;
        if (req.files[0]) {
          extension = req.files[0].originalname.split('.');
          filePath = req.files[0].key;
          if(filePath) {
            let attachment = {
              type: extension[extension.length - 1],
              path: filePath
            }
            helpData['attachment']=attachment;
            saveHelp(res, helpData, currentUser);
          }
        }
       
      } 
    })
  }
     
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});
 
 function saveHelp(res, helpData, currentUser) {
    helpController.saveHelp(helpData, currentUser).then((successResult) => {
      logger.info(helpConstants.HELP_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
 }
//get all helps
router.get('/',function(req,res){
  try {
    helpController.getHelps().then((successResult)=>{
      return res.status(200).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch(err) {
    logger.fatal(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR_OCCURED, data: err });
  }
});

//get help by id
router.get('/:helpId',function(req,res){
  let helpId=req.params.helpId;
  logger.info(helpConstants.GET_HELP_STARTED);
  try {
    helpController.getHelpById(helpId).then((successResult)=>{
      return res.status(200).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch(err) {
    logger.fatal(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR_OCCURED, data: err });
  }
});

//Update replies for help by id
router.put('/:helpId/replies',function(req,res){
  let helpId=req.params.helpId;
  let replyData = {};
  let currentUser = req.decoded;
  replyData['message'] = req.body.description;
  logger.info(helpConstants.GET_HELP_STARTED);
  try {
    helpController.saveReplyByHelpId(helpId, currentUser,replyData).then((successResult)=>{
      return res.status(200).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch(err) {
    logger.fatal(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR_OCCURED, data: err });
  }
});

module.exports = router;