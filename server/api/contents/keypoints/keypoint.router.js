const express = require('express');
const router = express.Router();
const logger = require('./../../../services/app.logger');
const keyPoint = require('./keypoint.controller');
const loggerConstants = require('./../../../constants/logger');



//save keypoints data
router.post('/:subTopicId', (req, res) => {
    try {
        let subTopicId = req.params.subTopicId;
        let subTopicData = req.body;
        if (!subTopicData) {
            logger.error(loggerConstants.KEYPOINTS_DATA_NOT_FOUND);
            throw new Error(loggerConstants.INVALID_INPUTS);
        }
        keyPoint.saveKeyPoints(subTopicData, subTopicId,req.decoded).then((successResult) => {
            logger.info(loggerConstants.SUBTOPICS_KEYPOINTS_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
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
 * To update keyPoints data 
 */
router.put('/', function(req, res) {

    try {
        let keyPointsData = req.body;
        logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ':keyPointsData');
        if (!keyPointsData) {
            logger.error(loggerConstants.KEYPOINTS_DATA_NOT_FOUND);
            throw new Error(loggerConstants.INVALID_INPUTS);
        }
        keyPoint.updatekeyPoints(keyPointsData, req.decoded).then((successResult) => {
            logger.info(loggerConstants.KEYPOINTS_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
            return res.status(201).send(successResult);
        }, (errResult) => {
            // log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
            return res.status(500).send(errResult);
        });
    } catch (err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success: false, msg: err });
        return;
    }
});



// Delete keyPoints data 
router.delete('/:keyPointsId/:subTopicId', function(req, res) {
    try {
        let keyPointsId = req.params.keyPointsId;
        let subTopicId = req.params.subTopicId;
        keyPoint.deleteKeyPoints(keyPointsId, subTopicId, req.decoded).then((successResult) => {
            logger.info(loggerConstants.DATA_DELETED_FROM_KEYPOINTS + ' : ' + successResult.msg);
            return res.status(201).send(successResult);
        }, (errResult) => {
            //log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
            return res.status(403).send(errResult);
        });
    } catch (err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success: false, msg: err });
        return;
    }
});


module.exports = router;