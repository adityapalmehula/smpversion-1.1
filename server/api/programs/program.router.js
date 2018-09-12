const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const programController = require('./program.controller');
const loggerConstants = require('./../../constants/logger');
const programsConstants = loggerConstants.PROGRAMS;
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');
const path = require('path');
const fileUpload = require('./../fileUpload/upload');
const validation = require('./../../common/validation');
const appConstant = require('./../../constants').app;


//save program data
router.post('/', (req, res) => {
    let programData = req.body;
    let currentUser = req.decoded;
    let userId = currentUser.userId;
    try {

        // let uploadDetails = {
        //     userId: userId,
        //     title: programData.title,
        //     fileData: programData.icon,
        //     requestType: 'programs'
        // }
        // fileUpload.uploadfile(uploadDetails).then((successfull) => {
        //     programData['icon'] = successfull.filename;

            programController.saveProgram(programData, currentUser).then((successResult) => {
                logger.info(loggerConstants.programsConstants + ':' + successResult.msg);
                return res.status(201).send(successResult);
            }, (errResult) => {
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
                return res.status(500).send(errResult);
            });
        // }, (error) => {
        //     logger.error(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
        //     return res.status(500).send(error);

        // });
    } catch (err) {
        logger.fatal(err.stack || err);
        res.status(500).send({ success: false, msg: err });
        return;
    }
});


// get project data from program detail page
router.get('/projects/:programId', (req, res) => {
    let programId = req.params.programId;
    logger.info(programsConstants.GET_PROGRAM_AND_COURSES_STARTED);
    try {
        programController.getProjectData(programId).then((successResult) => {
           logger.info(loggerConstants.GET_ALL_DATA_OF_PROJECT_COURSES);
            return res.status(201).send(successResult);
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


//Get all Programs.
router.get('/', (req, res) => {
    logger.info(programsConstants.GET_PROGRAM_STARTED);
    try {
        programController.getPrograms().then((successResult) => {
            logger.info(programsConstants.GET_PROGRAM_COMPLETED);
            return res.status(201).send(successResult);
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

//Get single program by program id
router.get('/:programId', (req, res) => {
    let programId = req.params.programId;
    logger.info(programsConstants.GET_PROGRAM_STARTED);
    try {
        programController.getProgramById(programId).then((successResult) => {
            logger.info(programsConstants.GET_PROGRAM_COMPLETED);
            return res.status(201).send(successResult);
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

//Delete single program by program id
router.delete('/:programId', (req, res) => {
    let programId = req.params.programId;
    let currentUser = req.decoded;
    logger.info(programsConstants.DELETE_PROGRAM_STARTED);
    try {
        if (!programId) {
            logger.error(loggerConstants.INVALID_INPUTS);
            throw new Error(loggerConstants.INVALID_INPUTS);
        } else {
            programController.getProgramById(programId).then(successResult => {
                if (successResult['data'] && successResult['data'].createdBy) {
                    let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[0], programsConstants.DRAFTED_REJECTED_UPDATED);
                    if (permissionRes.status) {
                        programController.deleteProgramById(programId, currentUser).then((successResult) => {
                            logger.info(programsConstants.DELETE_PROGRAM_COMPLETED);
                            return res.status(201).send(successResult);

                        }, (errResult) => {
                            logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
                            return res.status(403).send(errResult);
                        });
                    } else {
                        return res.status(403).json({ success: false, msg: programsConstants.NO_RIGHTS_TO_UPDATE });
                    }
                } else {
                    return res.status(500).json({ success: false, msg: successResult.msg });
                }
            });
        }
    } catch (err) {
        logger.fatal(err.stack || err);
        res.status(500).send({ success: false, msg: err });
        return;
    }
});
//update program status
router.put('/status/:programId', (req, res) => {
    let userId = req.decoded.userId;
    try {
        let statusDetails = req.body;
        let userInfo = req.decoded;
        let programId = req.params.programId;
        if (!programId || !statusDetails.statusTo || !statusDetails.message) {
            logger.error(programsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ success: false, msg: programsConstants.MISSING_EXPECTED_INPUT });
        }

        programController.getProgramById(programId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let program = successResult.data;
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[0], programsConstants.DRAFTED_REJECTED_UPDATED);
                if (permissionRes.status) {
                    if (statusDetails.statusTo === appConstant.CONTENT_STATUS[2]) {
                        programController.updateProgramStatus(program, statusDetails, userInfo)
                            .then(successResponse => {
                                    programController.releaseProgram(programId, userInfo).then(releaseSuccess => {
                                        successResponse['msg'] = releaseSuccess.msg;
                                        logger.info(successResponse.msg); // Return release message
                                        return res.status(200).send(successResponse); // Return release message
                                    }, error => {
                                        logger.fatal(error.stack || error);
                                        return res.status(500).json({ success: false, msg: error });
                                    });
                                },
                                error => {
                                    logger.fatal(error.stack || error);
                                    return res.status(500).json({ success: false, msg: error });
                                });

                    } else if (statusDetails.statusTo === appConstant.CONTENT_STATUS[1]) {
                        programController.validateProgramOnSubmission(programId).then(programStatus => {
                        	
                            if (programStatus['isInvalid']) {
                                return res.status(200).json({ success: true, msg: 'Validation Fail', isInvalid: true });
                            } else {
                            	
                                programController.updateProgramStatus(program, statusDetails, userInfo)
                                    .then(successResponse => {
                                            logger.info(successResponse.msg);
                                            return res.status(200).send(successResponse);
                                        },
                                        error => {
                                            logger.fatal(error.stack || error);
                                            return res.status(500).json({ success: false, msg: error });
                                        });
                            }
                        })

                    } else {
                        programController.updateProgramStatus(program, statusDetails, userInfo)
                            .then(successResponse => {
                                    logger.info(successResponse.msg);
                                    return res.status(200).send(successResponse);
                                },
                                error => {
                                    logger.fatal(error.stack || error);
                                    return res.status(500).json({ success: false, msg: error });
                                });
                    }

                } else {
                    return res.status(403).json({ success: false, msg: (permissionRes.message == '' ? programsConstants.NO_RIGHTS_TO_UPDATE : permissionRes.message) });
                }
            } else {
                return res.status(500).json({ success: false, msg: successResult.msg });
            }
        }, error => {

            logger.fatal(error.stack || error);
            return res.status(500).json({ success: false, msg: error });
        })

    } catch (err) {
        logger.error(err.stack || err);
        logger.error('requested by: ' + userId);
        return res.status(500).send({ msg: programsConstants.INTERNAL_ERROR });
    }
});


// update Program by id
router.put('/:id', function(req, res) {
    try {
        let programData = req.body;
        let _id = req.params.id;
        let currentUser = req.decoded;
        let userId = currentUser.userId;
        let deleteImg = false;
        if (!programData) {
            logger.error(loggerConstants.COURSE_DATA_NOT_FOUND);
            throw new Error(loggerConstants.INVALID_INPUTS);
        }
        programController.getProgramById(_id).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], programsConstants.DRAFTED_REJECTED_UPDATED);
                if (permissionRes.status) {
                    // if (programData.icon) {
                    // let uploadDetails = {
                    //     userId: userId,
                    //     title: programData.title,
                    //     fileData: programData.icon,
                    //     requestType: 'programs'
                    // }
                    // fileUpload.uploadfile(uploadDetails).then((successfull) => {
                    //     programData['icon'] = successfull.filename;
                    //     programData['iconExtension'] = successfull.extension;

                    programController.updateProgramById(programData, _id, req.decoded).then(successResult => {
                        logger.info(programsConstants.PROGRAM_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
                        return res.status(201).send(successResult);
                    }, (errResult) => {
                        logger.error(programsConstants.PROBLEM_OCCURED + ' : ' + errResult.stack || errResult);
                        return res.status(500).send(errResult);
                    });

                    // }, (error) => {
                    //     logger.error(projectsConstants.FILE_UPLOAD_STORAGE_PROBLEM);
                    //     return res.status(500).send(projectsConstants.FILE_UPLOAD_STORAGE_PROBLEM);
                    // })
                    // } else {
                    //     programController.updateProgramById(programData, _id, req.decoded, deleteImg).then(successResult => {
                    //         logger.info(projectsConstants.PROJECT_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
                    //         return res.status(201).send(successResult);
                    //     }, (errResult) => {
                    //         logger.error(projectsConstants.PROBLEM_OCCURED + ' : ' + errResult.stack || errResult);
                    //         return res.status(500).send(errResult);
                    //     });
                    // }
                } else {
                    return res.status(403).json({ success: false, msg: (permissionRes.message == '' ? projectsConstants.NO_RIGHTS_TO_UPDATE : permissionRes.message) });
                }
            } else {
                return res.status(500).json({ success: false, msg: successResult.msg });
            }
        }, error => {
            logger.fatal(error.stack || error);
            return res.status(500).json({ success: false, msg: error });
        })
    } catch (err) {
        logger.fatal(err.stack || err);
        res.status(500).send({ success: false, msg: err });
    }
});
module.exports = router;