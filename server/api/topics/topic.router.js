var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

var controller = require('./topic.controller');

const logger = require('./../../services/app.logger');
const loggerConstants = require('./../../constants/logger');
const fileUpload = require('./../fileUpload/upload');

// route for post topic
router.post('/', function(req, res) {
  let topicData = req.body;

  logger.debug(loggerConstants.GET_OBJECT_AND_STORE_TOPIC);
  try {
    if (!topicData) {
      logger.error(loggerConstants.TOPIC_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    controller.createTopic(topicData, req.decoded).then((successResult) => {
      logger.info(loggerConstants.TOPIC_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
            // Log the error for internal use
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

/*
 * To update Topic data 
 */
 router.put('/id/:topicId', function(req, res) {
  let topicData = req.body;
  let topicId = req.params.topicId;

  logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ': topicData');
  try {
    if (!topicData) {
      logger.error(loggerConstants.TOPIC_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    controller.updateTopic(topicData, topicId, req.decoded).then((successResult) => {
      logger.info(loggerConstants.TOPIC_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
      console.log(errResult);
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

 /*
 * rearrange subtopics on basis of topic Id
 */
 router.put('/:topicId/subTopics/rearrange', function(req, res) {
  let topicData = req.body;
  let topicId = req.params.topicId;

  logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ': topicData');
  try {
    if (!topicData) {
      logger.error(loggerConstants.TOPIC_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    controller.rearrangeSubtopicByTopicId(topicData, topicId, req.decoded).then((successResult) => {
      logger.info(loggerConstants.TOPIC_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
            // log the error for internal use
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

// Delete Topic routes
router.delete('/delete/:topicId', function(req, res) {
  let topicId = req.params.topicId;
  try {
    controller.deleteTopic(topicId, req.decoded).then((successResult) => {
      logger.info(loggerConstants.DATA_DELETED_FROM_TOPIC);
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
      }
    });

//Get data on basis of topic Id
router.get('/:id', function(req, res) {
  let topicId = req.params.id;
  try {
    controller.topicDetails(topicId).then((successResult) => {
      logger.info(loggerConstants.TOPIC_DETAIL_FOUND);
      return res.status(203).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(403).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//get topic and subtopics details
router.post('/subtopics', function(req, res) {
  try {
    controller.getSubtopicDetails(req.body).then((successResult) => {
      return res.status(203).send(successResult);
    }, (errResult) => {
      return res.status(403).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
  }
});

//get topic wise playlists
router.get('/playlists/:topicId', function(req, res) {
  let topicId = req.params.topicId;
  try {
    controller.getPlaylistsByTopicId(topicId).then((successResult) => {
      return res.status(203).send(successResult);
    }, (errResult) => {
      logger.error('Internal error occurred');
      return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
    });
  } catch (err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete, please check the request and try again..!' });
        return;
      }
    });


//get playlists by topic id 
router.get('/playlists/:topicId', function(req, res) {
  let topicId = req.params.topicId;
  try {
    if(!topicId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      controller.getPlaylistsByTopicId(topicId).then((successResult) => {
        logger.info(successResult.msg+" for playlists by topic id: "+topicId);
        return res.status(200).send(successResult);
      }, (errResult)=> {
        logger.error(errResult.msg || errResult.stack || errResult+" for playlists by topic id: "+topicId);
        return res.status(417).send(errResult);
      });
    }
  } catch(err) {
   logger.error(loggerConstants.INTERNAL_SERVER_ERROR+ " in get for playlists by topic id:: "+topicId+" "+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_SERVER_ERROR });
 }
});


router.post('/fetch', (req, res, next) => {
    // Here we are fetching topic details based on topic id.
    controller.fetchTopic(req, res);
  });


var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'server/uploads/textbooksolutions')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname.slice(0, file.originalname.lastIndexOf('.')) + '-' + Date.now() + path.extname(file.originalname))
  }
})

// File uploaded by multer
var uploadtextBookSolution = multer({ storage: storage }).any();


// router for upload text book solutions
router.post('/:topicId/textBookSolution', function(req, res) {
  let topicId = req.params.topicId;
  try {
    fileUpload.upload(req, res, function(err) {
      req.index=3;
      if (err) {
        return res.status(403).send(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
      } else {
        let extension = req.files[0].originalname.split('.');
        let fileExtension = extension[extension.length - 1].toLowerCase();
        let uploadData= {
         title:req.files[0].fieldname,
         path:req.files[0].key,
         extension: fileExtension
       }
       controller.uploadTextSolutions(uploadData, topicId,req.decoded).then((successResult) => {
        logger.info(loggerConstants.TOPIC_SOLUTION_SAVED + ' : ' + successResult.msg);
        return res.status(201).send(successResult);
      }, (errResult) => {
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
        return res.status(403).send(errResult);
      });
     }
   })
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});



// Delete text book solution
router.delete('/:topicId/textBookSolution/:solutionId', function(req, res) {
  console.log('inside solution');
  try {
    let solutionId = req.params.solutionId;
    let topicId = req.params.topicId;
    controller.deleteSolutions(solutionId, topicId, req.decoded).then((successResult) => {
      logger.info(loggerConstants.DATA_DELETED_FROM_SOLUTIONS+ ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
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