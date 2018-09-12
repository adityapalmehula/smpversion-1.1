const express = require('express');
const router = express.Router();
const uploadMedia = require('./media.controller');
const logger = require('./../../../services/app.logger');
const loggerConstants = require('./../../../constants/logger');
const fileUpload = require('./../../fileUpload/upload');

// router for upload file
router.post('/:subTopicId', function(req, res) {
	let subTopicId = req.params.subTopicId;
	req.index=1;
	try {
		fileUpload.upload(req, res, function(err) {
			if (err) {
				return res.status(403).send(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
			} else {
				let extension = req.files[0].originalname.split('.');
				let fileExtension = extension[extension.length - 1].toLowerCase();
				let obj = {
					title:req.files[0].fieldname,
					path:req.files[0].key,
					extension: fileExtension
				}
				uploadMedia.uploadMediaFile(obj, subTopicId,req.decoded).then((successResult) => {
					logger.info(loggerConstants.SUBTOPICS_MEDIAFILES_SAVED + ' : ' + successResult.msg);
					return res.status(201).send(successResult);
				}, (errResult) => {
					logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
					return res.status(500).send(errResult);
				});
			}
		})
	} catch (err) {
		logger.fatal(err.stack || err);
		res.status(500).send({ success: false, msg: err });
		return;
	}
});

// Delete media data 
router.delete('/:mediaId/:subTopicId', function(req, res) {
	try {
		let mediaId = req.params.mediaId;
		let subTopicId = req.params.subTopicId;
		uploadMedia.deleteMedia(mediaId, subTopicId, req.decoded).then((successResult) => {
			logger.info(loggerConstants.DATA_DELETED_FROM_MEDIA + ' : ' + successResult.msg);
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