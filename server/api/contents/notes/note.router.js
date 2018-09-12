const express = require('express');
const router = express.Router();
const logger = require('./../../../services/app.logger');
const notes = require('./note.controller');
const loggerConstants = require('./../../../constants/logger');


//save notes data
router.post('/:subTopicId', (req, res) => {
    try {
        let subTopicId = req.params.subTopicId;
        let subTopicData = req.body;
        if (!subTopicData) {
            logger.error(loggerConstants.NOTES_DATA_NOT_FOUND);
            throw new Error(loggerConstants.INVALID_INPUTS);
        }
        notes.saveNotes(subTopicData, subTopicId,req.decoded).then((successResult) => {
            logger.info(loggerConstants.SUBTOPICS_NOTES_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
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
        let notesData=req.body;
        logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': notesData');
        if(!notesData){
            logger.error(loggerConstants.NOTES_DATA_NOT_FOUND);
            throw new Error(loggerConstants.INVALID_INPUTS);
        }
        notes.updateNotes(notesData, req.decoded).then((successResult) => {
            logger.info(loggerConstants.NOTES_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
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





// Delete notes data 
router.delete('/:notesId/:subTopicId',function(req,res){
    try
    {
     let notesId=req.params.notesId;
     let subTopicId = req.params.subTopicId;
     notes.deleteNotes(notesId,subTopicId,req.decoded).then((successResult)=>{
        logger.info(loggerConstants.DATA_DELETED_FROM_NOTES + ' : ' + successResult.msg);
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