const express = require('express');
const router = express.Router();
const logger = require('./../../../services/app.logger');
const references = require('./reference.controller');
const loggerConstants = require('./../../../constants/logger');
const appConstants = require('./../../../constants/app');


//save references data
router.post('/:subTopicId', (req, res) => {
  try {
    let subTopicId = req.params.subTopicId;
    let subTopicData = req.body;
    subTopicData.type=appConstants.CONTENTS[3];
    if (!subTopicData) {
      logger.error(loggerConstants.REFERENCES_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    references.saveReferences(subTopicData, subTopicId,req.decoded).then((successResult) => {
      logger.info(loggerConstants.SUBTOPICS_REFERENCES_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
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


/*
* To update notes data 
*/
router.put('/',function(req, res){
 
  try {
    let referencesData=req.body;
    logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': notesData');
    if(!referencesData){
      logger.error(loggerConstants.REFERENCES_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    references.updateReferences(referencesData,req.decoded).then((successResult) => {
      logger.info(loggerConstants.REFERENCES_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
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

// Delete references data 
router.delete('/:referencesId/:subTopicId',function(req,res){
  try
  {
   let referencesId=req.params.referencesId;
   let subTopicId = req.params.subTopicId;
   references.deleteReferences(referencesId,subTopicId,req.decoded).then((successResult)=>{
    logger.info(loggerConstants.DATA_DELETED_FROM_REFERENCES + ' : ' + successResult.msg);
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


module.exports = router;