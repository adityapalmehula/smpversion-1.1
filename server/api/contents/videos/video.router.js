const express = require('express');
const router = express.Router();
const logger = require('./../../../services/app.logger');
const videoCtrl = require('./video.controller');
const loggerConstants = require('./../../../constants/logger');



//save video data
router.post('/', (req, res) => {
    try {
        let subTopicVideoData = req.body;
        if (!subTopicVideoData) {
            logger.error(loggerConstants.REFERENCES_DATA_NOT_FOUND);
            throw new Error(loggerConstants.INVALID_INPUTS);
        }
        videoCtrl.saveVideos(subTopicVideoData, req.decoded).then((successResult) => {
            logger.info(loggerConstants.SUBTOPICS_VIDEO_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
            return res.status(201).send(successResult);
        }, (errResult) => {
            console.log(errResult);
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
            return res.status(500).send(errResult);
        });
    } catch (err) {
        logger.fatal(err.stack || err);
        res.status(500).send({ success: false, msg: err });
        return;
    }
});


// Delete Video data from subtopic 
router.delete('/:topicId/:subTopicId',function(req,res){
try
    {
    	  let topicId=req.params.topicId;
        let subTopicId = req.params.subTopicId;
        videoCtrl.deleteVideos(topicId,subTopicId, req.decoded).then((successResult)=>{
            logger.info(loggerConstants.VIDEO_DELETED_FROM_SUBTOPICS + ' : ' + successResult.msg);
            return res.status(201).send(successResult);
        }, (errResult) => {
             logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
        });
    }
    catch(err) {
         logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
    }
});


// Add table of content to video content
router.post('/:id/addtoc', (req, res) => {
	try {
			let videoId = req.params.id;
	    let videoTOC = req.body;
		if(!videoId && !videoTOC){
       logger.reject(loggerConstants.INPUT_NOT_PASSED);
      return res.status(203).send(loggerConstants.INPUT_NOT_PASSED);
		} else {
			videoCtrl.addVideoTOC(videoId, videoTOC).then((successResult) => {
        logger.info(loggerConstants.VIDEO_TOC_ADDED_SUCCESSFULLY+ ' : ' + successResult.msg);
       return res.status(201).send(successResult);
			}, (errResult) => {
				 logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
            return res.status(403).send(errResult);
			});
		}
	} catch(err){
		  logger.fatal(err.stack || err);
        res.status(500).send({ success: false, msg: err });
        return;
	}
	
});

router.put('/:videoId/toc/:tocId',(req,res)=>{
try{
          let tocData=req.body;
          let videoId=req.params.videoId;
          let tocId = req.params.tocId;
        videoCtrl.updateToc(videoId,tocId,tocData).then((successResult)=>{
            logger.info(loggerConstants.TOC_UPDATED_FROM_VIDEO + ' : ' + successResult.msg);
            return res.status(201).send(successResult);
        }, (errResult) => {
             logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
        });
    }
    catch(err) {
         logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
    }
});

// Delete Toc from video 
router.delete('/:videoId/toc/:tocId',function(req,res){
try
    {
          let videoId=req.params.videoId;
        let tocId = req.params.tocId;
        videoCtrl.deleteToc(videoId,tocId).then((successResult)=>{
            logger.info(loggerConstants.TOC_DELETED_FROM_VIDEO + ' : ' + successResult.msg);
            return res.status(201).send(successResult);
        }, (errResult) => {
             logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
        });
    }
    catch(err) {
         logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
    }
});



// // route for delete video by videoId
// router.delete('/:videoId',function(req,res){
// let videoId=req.params.videoId;
// try
// 	{
// 		videoCtrl.deleteVideoByVideoId(videoId).then((successResult)=>{
// 			logger.info('video deleted');
// 			return res.status(203).send(successResult);
// 		}, (errResult) => {
// 			//log the error for internal use
// 			logger.error('Internal error occurred');
//             return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
// 		});
// 	}
// 	catch(err) {
// 		// Log the Error for internal use
//         logger.fatal('Exception occurred' + err);
//         res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
//         return;
// 	}
// });

// route to get video by videoId
router.get('/:videoId',function(req,res){
let videoId=req.params.videoId;
try	{
	videoCtrl.getVideoByVideoId(videoId).then((successResult)=>{
		logger.debug('Video found with id : ', videoId);
		return res.status(201).send(successResult);
	}, (errResult) => {
		logger.error('Internal error occurred : ',errResult);
    return res.status(201).send({ error: 'Internal error occurred, please try later..!' });
	});
}	catch(err) {
		logger.fatal('Exception occurred' + err);
    res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
    return;
	}
});

router.put('/like',function(req,res){
	let videoId=req.body.videoId;
 	let owner = req.decoded.username;
	try	{
	videoCtrl.likeVideoByVideoId(videoId,owner).then((successResult)=>{
		logger.debug('Video liked by : ', videoId);
		return res.status(201).send(successResult);
	}, (errResult) => {
		logger.error('Internal error occurred : ',errResult);
    return res.status(201).send({ error: errResult });
	});
}	catch(err) {
		logger.fatal('Exception occurred' + err);
    res.send({ error: err });
    return;
	}
})

router.put('/unLike',function(req,res){
	let videoId=req.body.videoId;
 	let owner = req.decoded.username;
 	console.log(owner);
	try	{
	videoCtrl.unLikeVideoByVideoId(videoId,owner).then((successResult)=>{
		logger.debug('Video Unliked by : ', videoId);
		return res.status(201).send(successResult);
	}, (errResult) => {
		logger.error('Internal error occurred : ',errResult);
    return res.status(201).send({ error: errResult });
	});
}	catch(err) {
		logger.fatal('Exception occurred' + err);
    res.send({ error: err });
    return;
	}
})


module.exports = router;
