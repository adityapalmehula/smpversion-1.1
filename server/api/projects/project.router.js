const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const projectController = require('./project.controller');
const loggerConstants = require('./../../constants/logger');
const projectsConstants = loggerConstants.PROJECTS;
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');
const path = require('path');
const fileUpload = require('./../fileUpload/upload');
const validation = require('./../../common/validation');
const appConstant = require('./../../constants').app;


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'server/uploads/projects')
    },
    filename: function(req, file, cb) {
        let userId = req.decoded.userId;
        cb(null, userId + '-' + Date.now() + path.extname(file.originalname))
    }
})

//save project data
router.post('/', (req, res) => {
    let projectData = req.body;
    let currentUser = req.decoded;
    let userId = currentUser.userId;
    logger.debug(projectsConstants.GET_OBJECT_AND_STORE_PROJECT);
    try {
        if (!projectData || !currentUser) {
            logger.error(projectsConstants.PROJECT_DATA_NOT_FOUND);
            throw new Error(loggerConstants.INVALID_INPUTS);
        }

        let uploadDetails = {
            userId: userId,
            title: projectData.title,
            fileData: projectData.icon,
            requestType: 'projects'
        }
        fileUpload.uploadfile(uploadDetails).then((successfull) => {
            projectData['icon'] = successfull.filename;
            projectData['iconExtension'] = successfull.extension;
            projectController.saveProject(projectData, currentUser).then((successResult) => {
                logger.info(loggerConstants.projectsConstants + ' : ' + successResult.msg);
                return res.status(201).send(successResult);
            }, (errResult) => {
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
                return res.status(500).send(errResult);
            });
        }, (error) => {
            logger.error(loggerConstants.FILE_UPLOAD_STORAGE_PROBLEM);
            return res.status(500).send(error);
        });
    } catch (err) {
        logger.fatal(err.stack || err);
        res.status(500).send({ success: false, msg: err });
        return;
    }
});

//Get all projects
router.get('/', (req, res) => {
    logger.info(projectsConstants.GET_PROJECT_STARTED);
    try {
        projectController.getProjects().then((successResult) => {
            logger.info(projectsConstants.GET_PROJECT_COMPLETED);
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


//Get list projects
router.get('/list', (req, res) => {
    logger.info(projectsConstants.GET_PROJECT_STARTED);
    try {
        projectController.listProjects().then((successResult) => {
            logger.info(projectsConstants.GET_PROJECT_COMPLETED);
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

//Get single project by project id
router.get('/:projectId', (req, res) => {
    let projectId = req.params.projectId;
    logger.info(projectsConstants.GET_PROJECT_STARTED);
    try {
        projectController.getProjectById(projectId).then((successResult) => {
            logger.info(projectsConstants.GET_PROJECT_COMPLETED);
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


// update Project by id
router.put('/:id', function(req, res) {
    try {
        let projectData = req.body;
        let _id = req.params.id;
        let currentUser = req.decoded;
        let userId = currentUser.userId;
        let deleteImg = false;
        if (!projectData) {
            logger.error(loggerConstants.COURSE_DATA_NOT_FOUND);
            throw new Error(loggerConstants.INVALID_INPUTS);
        }
        projectController.getProjectById(_id).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);

                if (permissionRes.status) {
                    // if(successResult['data'].createdBy.id==req.decoded.userId || req.decoded.role===appConstant.USER_DETAILS.USER_ROLES[0]) {
                    if (projectData.icon) {
                        let uploadDetails = {
                            userId: userId,
                            title: projectData.title,
                            fileData: projectData.icon,
                            requestType: 'projects'
                        }
                        fileUpload.uploadfile(uploadDetails).then((successfull) => {
                            projectData['icon'] = successfull.filename;
                            projectData['iconExtension'] = successfull.extension;
                            projectController.updateProjectById(projectData, _id, req.decoded).then(successResult => {
                                logger.info(projectsConstants.PROJECT_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
                                return res.status(201).send(successResult);
                            }, (errResult) => {
                                logger.error(projectsConstants.PROBLEM_OCCURED + ' : ' + errResult.stack || errResult);
                                return res.status(500).send(errResult);
                            });
                        }, (error) => {
                            logger.error(projectsConstants.FILE_UPLOAD_STORAGE_PROBLEM);
                            return res.status(500).send(projectsConstants.FILE_UPLOAD_STORAGE_PROBLEM);
                        })
                    } else {
                        projectController.updateProjectById(projectData, _id, req.decoded, deleteImg).then(successResult => {
                            logger.info(projectsConstants.PROJECT_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
                            return res.status(201).send(successResult);
                        }, (errResult) => {
                            logger.error(projectsConstants.PROBLEM_OCCURED + ' : ' + errResult.stack || errResult);
                            return res.status(500).send(errResult);
                        });
                    }
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


//Delete single project by project id
router.delete('/:projectId', (req, res) => {
    let projectId = req.params.projectId;
    let currentUser = req.decoded;
    logger.info(projectsConstants.DELETE_PROJECT_STARTED);
    try {
        if (!projectId) {
            logger.error(loggerConstants.INVALID_INPUTS);
            throw new Error(loggerConstants.INVALID_INPUTS);
        } else {
            projectController.getProjectById(projectId).then(successResult => {
                if (successResult['data'] && successResult['data'].createdBy) {
                    let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);
                    if (permissionRes.status) {
                        projectController.deleteProjectById(projectId, currentUser).then((successResult) => {
                            logger.info(projectsConstants.DELETE_PROJECT_COMPLETED);
                            return res.status(201).send(successResult);

                        }, (errResult) => {
                            logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
                            return res.status(403).send(errResult);
                        });
                    } else {
                        return res.status(403).json({ success: false, msg: projectsConstants.NO_RIGHTS_TO_UPDATE });
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


//update project status
router.put('/status/:projectId', (req, res) => {
    let userId = req.decoded.userId;
    try {
        let statusDetails = req.body;
        let userInfo = req.decoded;
        let projectId = req.params.projectId;
        if (!projectId || !statusDetails.statusTo || !statusDetails.message) {
            logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT });
        }

        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let project = successResult.data;
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[0], projectsConstants.DRAFTED_REJECTED_UPDATED);
                if (permissionRes.status) {
                    if (statusDetails.statusTo === appConstant.CONTENT_STATUS[1]) {
                        projectController.validateProjectOnSubmission(projectId).then(projectStatus => {
                            if (projectStatus['isInvalid']) {
                                return res.status(200).json({ success: true, msg: 'Validation Fail', isInvalid: true });
                            } else {
                                projectController.updateProjectStatus(project, statusDetails, userInfo)
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
                    } else if (statusDetails.statusTo === appConstant.CONTENT_STATUS[2]) {
                        projectController.updateProjectStatus(project, statusDetails, userInfo)
                            .then(successResponse => {
                                    projectController.releaseProject(projectId, userInfo).then(releaseSuccess => {
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
                    } else {
                        projectController.updateProjectStatus(project, statusDetails, userInfo)
                            .then(successResponse => {
                                    logger.info(successResponse.msg);
                                    return res.status(200).send(successResponse);
                                },
                                error => {
                                    logger.fatal(error.stack || error);
                                    return res.status(500).json({ success: false, msg: error });
                                });
                    }
                }
            } else {
                return res.status(403).json({ success: false, msg: (permissionRes.message == '' ? projectsConstants.NO_RIGHTS_TO_UPDATE : permissionRes.message) });
            }
        }, error => {
            logger.fatal(error.stack || error);
            return res.status(500).json({ success: false, msg: error });
        });

    } catch (err) {
        logger.error(err.stack || err);
        logger.error('requested by: ' + userId);
        return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
    }
});

//=================================== routes for epics =========================

//add epic in project
router.put('/:projectId/epics', (req, res) => {
    try {
        let epicData = req.body;
        let currentUser = req.decoded;
        let projectId = req.params.projectId;
        if (!projectId || !epicData.title || !epicData.description || !currentUser) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }

        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);
                if (permissionRes.status) {
                    projectController.addEpic(projectId, epicData, currentUser).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(201).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });
                } else {
                    return res.status(403).json({ success: false, msg: (permissionRes.message == '' ? projectsConstants.NO_RIGHTS_TO_UPDATE : permissionRes.message) });
                }
            } else {
                return res.status(500).json({ success: false, msg: successResult.msg });
            }
        }, error => {
            logger.fatal(error.stack || error);
            return res.status(500).json({ success: false, msg: error });
        });

    } catch (err) {
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//get epic by projectid and epic id
router.get('/:projectId/epics/:epicId', (req, res) => {
    try {
        let projectId = req.params.projectId;
        let epicId = req.params.epicId;
        if (!projectId || !epicId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getEpicById(projectId, epicId).then((successResult) => {
            logger.info(successResult.msg);
            res.status(200).send(successResult);
        }, (error) => {
            logger.error(error.stack || error);
            res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
        });
    } catch (err) {
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});
//get epiclist by projectid and
router.get('/:projectId/epics', (req, res) => {
    try {
        let projectId = req.params.projectId;
        //let epicId = req.params.epicId;
        if (!projectId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getEpicList(projectId).then((successResult) => {
            logger.info(successResult.msg);
            res.status(200).send(successResult);
        }, (error) => {
            logger.error(error.stack || error);
            res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
        });
    } catch (err) {
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//update epic by epic id
router.put('/:projectId/epics/:epicId', (req, res) => {
    try {
        let epicData = req.body;
        let currentUser = req.decoded;
        let projectId = req.params.projectId;
        let epicId = req.params.epicId;
        if (!projectId || !epicData || !currentUser || !epicId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }

        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);
                if (permissionRes.status) {
                    projectController.updateEpic(projectId, epicId, epicData, currentUser).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(201).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });
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
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//delete epic by projectid and epic id
router.delete('/:projectId/epics/:epicId', (req, res) => {
    try {
        let projectId = req.params.projectId;
        let epicId = req.params.epicId;
        if (!projectId || !epicId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);

                if (permissionRes.status) {
                    projectController.deleteEpic(projectId, epicId).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(200).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });
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
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//=================================== routes for stories =========================


//add story in project
router.put('/:projectId/stories', (req, res) => {
    try {
        let story = req.body;
        let currentUser = req.decoded;
        let projectId = req.params.projectId;
        if (!projectId || !story.title || !story.description || !currentUser) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);

                if (permissionRes.status) {
                    projectController.addStory(projectId, story, currentUser).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(201).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });
                } else {
                    return res.status(403).json({ success: false, msg: (permissionRes.message == '' ? projectsConstants.NO_RIGHTS_TO_UPDATE : permissionRes.message) });
                }
            } else {
                return res.status(500).json({ success: false, msg: successResult.msg });
            }
        }, error => {
            logger.fatal(error.stack || error);
            return res.status(500).json({ success: false, msg: error });
        });
    } catch (err) {
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//get story by projectid and story id
router.get('/:projectId/stories/:storyId', (req, res) => {
    try {
        let projectId = req.params.projectId;
        let storyId = req.params.storyId;
        if (!projectId || !storyId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getStoryById(projectId, storyId).then((successResult) => {
            logger.info(successResult.msg);
            res.status(200).send(successResult);
        }, (error) => {
            logger.error(error.stack || error);
            res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
        });
    } catch (err) {
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//update story by story id
router.put('/:projectId/stories/:storyId', (req, res) => {
    try {
        let story = req.body;
        let currentUser = req.decoded;
        let projectId = req.params.projectId;
        let storyId = req.params.storyId;
        if (!projectId || !story || !currentUser || !storyId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }

        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);

                if (permissionRes.status) {
                    projectController.updateStory(projectId, storyId, story, currentUser).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(201).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });
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
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//delete story by projectid and story id
router.delete('/:projectId/stories/:storyId', (req, res) => {
    try {
        let projectId = req.params.projectId;
        let storyId = req.params.storyId;
        if (!projectId || !storyId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);

                if (permissionRes.status) {
                    projectController.deleteStory(projectId, storyId).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(200).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });

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
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//=================================== routes for tasks =========================

//get story by projectid and story id
router.get('/:projectId/stories/:storyId/tasks/:taskId', (req, res) => {
    try {
        let projectId = req.params.projectId;
        let storyId = req.params.storyId;
        let taskId = req.params.taskId;
        if (!projectId || !storyId || !taskId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getTaskById(projectId, storyId, taskId).then((successResult) => {
            logger.info(successResult.msg);
            res.status(200).send(successResult);
        }, (error) => {
            logger.error(error.stack || error);
            res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
        });
    } catch (err) {
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//add tasks in project
router.put('/:projectId/stories/:storyId/tasks', (req, res) => {
    try {
        let task = req.body;
        let currentUser = req.decoded;
        let projectId = req.params.projectId;
        let storyId = req.params.storyId;
        let actions = req.body.actions;
        if (!projectId || !storyId || !task.title || !task.description || !currentUser || !task.actions) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }

        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);

                if (permissionRes.status) {
                    projectController.addTask(projectId, storyId, task, currentUser).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(201).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });
                } else {
                    return res.status(403).json({ success: false, msg: (permissionRes.message == '' ? projectsConstants.NO_RIGHTS_TO_UPDATE : permissionRes.message) });
                }
            } else {
                return res.status(500).json({ success: false, msg: successResult.msg });
            }
        }, error => {
            logger.fatal(error.stack || error);
            return res.status(500).json({ success: false, msg: error });
        });


    } catch (err) {
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//delete task by taskId 
router.delete('/:projectId/stories/:storyId/tasks/:taskId', (req, res) => {
    try {
        let projectId = req.params.projectId;
        let storyId = req.params.storyId;
        let taskId = req.params.taskId;
        if (!projectId || !storyId || !taskId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);

                if (permissionRes.status) {
                    projectController.deleteTask(projectId, storyId, taskId).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(200).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });
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
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//update Task by story id
router.put('/:projectId/stories/:storyId/tasks/:taskId', (req, res) => {
    try {
        let task = req.body;
        let currentUser = req.decoded;
        let projectId = req.params.projectId;
        let storyId = req.params.storyId;
        let taskId = req.params.taskId
        if (!projectId || !currentUser || !storyId || !taskId) {
            logger.error(projectsConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ msg: projectsConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getProjectById(projectId).then(successResult => {
            if (successResult['data'] && successResult['data'].createdBy) {
                let permissionRes = validation.isAuthorized(successResult['data'].createdBy, req.decoded.userId, req.decoded.role, successResult['data'].status, appConstant.reqTypes[1], projectsConstants.DRAFTED_REJECTED_UPDATED);

                if (permissionRes.status) {
                    projectController.updateTask(projectId, storyId, taskId, task, currentUser).then((successResult) => {
                        logger.info(successResult.msg);
                        res.status(201).send(successResult);
                    }, (error) => {
                        logger.error(error.stack || error);
                        res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
                    });
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
        logger.error(err.stack || err);
        res.status(500).send({ success: false, msg: projectsConstants.INTERNAL_ERROR });
    }
});

//get project validation-tracking details
router.get('/validation-tracking/:projectId', (req, res) => {
    let userId = req.decoded.userId;
    try {
        let projectId = req.params.projectId;
        if (!projectId) {
            logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
            return res.status(400).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT });
        }
        projectController.getProjectDetails(projectId, '_id validationTracking').then((successResult) => {
            logger.info(successResult.msg + " for: " + userId);
            return res.status(200).send(successResult);
        }, error => {
            logger.error("Requested by: " + userId);
            logger.error(error.stack || error);
            if (error instanceof CustomError) {
                return res.status(403).json({ msg: error.message });
            } else {
                return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
            }
        });
    } catch (err) {
        logger.error(err.stack || err);
        logger.error('requested by: ' + userId);
        return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
    }
});


module.exports = router;