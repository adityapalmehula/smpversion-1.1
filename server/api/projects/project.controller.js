const fs = require('fs');
const projectModel = require('./project.entity');
const logger = require('../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger');
const projectsConstants = loggerConstants.PROJECTS;
// const appConstants = require('./../../constants/app');
const constants = require('./../../constants/app');
const releaseProjectController = require('./../releaseProjects/releaseProject.controller');
// Save project data
const saveProject = function(projectData, currentUser) {
    return new Promise((resolve, reject) => {
        projectData['price'] = {
            actual: projectData['actualPrice'],
            offered: projectData['offeredPrice'],
            discount: projectData['discount']
        };
        projectData['createdBy'] = {
            id: currentUser['userId'],
            role: currentUser['role'],
            name: currentUser['name']
        }
        if (currentUser['role'] && currentUser['role'] === constants.USER_DETAILS.USER_ROLES[1]) {
            projectData['createdBy']['name'] = constants.DEFAULT_NAME_FOR_BACKEND_USER;
        } else {
            projectData['createdBy']['name'] = currentUser['name'];
        }
        projectData['status'] = constants.CONTENT_STATUS[0];
        logger.debug(projectsConstants.GET_OBJECT_AND_STORE_PROJECT + ' : projects');
        let newProject = new projectModel(projectData);


        let error = newProject.validateSync();
        if (error) {
            let msg = validation.formValidation(error);
            reject(msg);
        } else {
            newProject.save(function(err, data) {
                if (err) {
                    logger.error(loggerConstants.COURSE_NOT_SAVED + ':' + err);
                    reject({ success: false, msg: loggerConstants.PROJECT_NOT_SAVED });
                } else {
                    logger.debug(loggerConstants.PROJECT_SUCCESSFULLY_SAVED);
                    resolve({ success: true, msg: loggerConstants.PROJECT_SUCCESSFULLY_SAVED });
                }
            });
        }
    });
}

// Get all projects
const getProjects = function() {
    return new Promise((resolve, reject) => {
        projectModel.find((err, projects) => {
            if (err) {
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
                reject({ success: false, msg: err });
            } else if (!projects) {
                logger.error(projectsConstants.PROJECT_DATA_NOT_FOUND);
                reject({ success: false, msg: projectsConstants.PROJECT_DATA_NOT_FOUND });
            } else {
                resolve({ success: true, data: projects });
            }
        });
    });
};


// Get all  list projects
const listProjects = function() {
    return new Promise((resolve, reject) => {
        projectModel.find({ status: constants.CONTENT_STATUS[2] }, (err, projects) => {
            if (err) {
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
                reject({ success: false, msg: err });
            } else if (!projects) {
                logger.error(projectsConstants.PROJECT_DATA_NOT_FOUND);
                reject({ success: false, msg: projectsConstants.PROJECT_DATA_NOT_FOUND });
            } else {
                resolve({ success: true, data: projects });
            }
        });
    });
};
//Get single project by project id
const getProjectById = function(projectId) {
    return new Promise((resolve, reject) => {
        projectModel.findById({ _id: projectId }, (err, project) => {
            if (err) {
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
                reject({ success: false, msg: err });
            } else if (!project) {
                logger.error(projectsConstants.PROJECT_DATA_NOT_FOUND);
                reject({ success: false, msg: projectsConstants.PROJECT_DATA_NOT_FOUND });
            } else {
                resolve({ success: true, data: project });
            }
        });
    });
};

//get project details 
const getProjectDetails = (projectId, fields) => {
    return new Promise((resolve, reject) => {
        let projectFind = projectModel.findOne({ '_id': projectId });
        if (fields) {
            projectFind = projectFind.select(fields)
        }
        projectFind.exec(function(err, project) {
            if (err) {
                reject(err);
            } else if (project) {
                resolve({ success: true, data: project });
            } else {
                resolve({ success: true, msg: projectsConstants.PROJECT_DATA_NOT_FOUND });
            }
        });
    });
}
// Update project data
const updateProjectById = function(projectData, _id, userInfo) {
    // let courseObj = courseData
    projectData['price'] = {
        actual: projectData['actualPrice'],
        offered: projectData['offeredPrice'],
        discount: projectData['discount']
    };
    logger.debug(projectsConstants.GET_OBJECT_AND_STORE_PROJECT + ' : projects');
    return new Promise((resolve, reject) => {
        projectModel.findOneAndUpdate({ _id: _id }, {
            $set: {
                code: projectData.code,
                version: projectData.version,
                title: projectData.title,
                level: projectData.level,
                tenure: projectData.tenure,
                description: projectData.description,
                prerequisites: projectData.prerequisites,
                activationMethod: projectData.activationMethod,
                currency: projectData.currency,
                price: projectData.price,
                isPaid: projectData.isPaid,
                tags: projectData.tags,
                icon: projectData.icon,
                updatedBy: {
                    id: userInfo.userId,
                    role: userInfo.role,
                    name: userInfo.name,
                    date: Date.now()
                },
                // duration: projectData.duration,
                status: projectData.status,
            }
        }, (err, data) => {
            if (err) {
                logger.error(projectsConstants.PROJECT_NOT_UPDATED + ':' + err);
                reject({ success: false, msg: projectsConstants.PROJECT_NOT_UPDATED });
            } else {
                logger.debug({ success: true, msg: projectsConstants.PROJECT_SUCCESSFULLY_UPDATED });
                resolve({ success: true, msg: projectsConstants.PROJECT_SUCCESSFULLY_UPDATED });
            }
        });
    });
}

//Get single project by project id
const deleteProjectById = function(projectId, currentUser) {
    return new Promise((resolve, reject) => {
        projectModel.updateOne({ '_id': projectId }, {
            $set: {
                status: constants.CONTENT_STATUS[5],
                deletedBy: {
                    id: currentUser.userId,
                    role: currentUser.role,
                    name: currentUser.name,
                    date: Date.now()
                }
            }
        }, function(err, data) {
            if (err) {
                logger.error(projectsConstants.PROJECT_DATA_NOT_FOUND + ' : ' + err);
                reject(err);
            } else {
                logger.debug({ success: true, msg: projectsConstants.PROJECT_SUCCESSFULLY_DELETED });
                resolve({ success: true, msg: projectsConstants.PROJECT_SUCCESSFULLY_DELETED });
            }
        });
    });
};


//get course full details
const getFullProjectDetails = (projectId, userInfo) => {
    return new Promise(async(resolve, reject) => {
        try {
            let project = await projectModel.findOne({ '_id': projectId, $or:[{'epics.status': 'Active'}, {'stories.status': 'Active'}]});

            //project.stories.
            // project.stories.tasks=getActiveStatusList();
            project.stories.map((story, e) => {
                    story.tasks =Object.assign([],getActiveStatusList(story.tasks));
                });
            return resolve(project);
        } catch (err) {
            reject(err);
        }
    });
}

//release Product
const releaseProject = (projectId, userInfo) => {
    return new Promise((resolve, reject) => {
        getFullProjectDetails(projectId, userInfo).then(fullProject => {
            releaseProjectController.persistReleaseProject(projectId, fullProject, userInfo)
                .then(success => {
                    resolve(success);
                })
        }).catch(err => {
            reject(err);
        });
    });
}

//update Project status

const updateProjectStatus = (project, statusDetails, userInfo) => {
    return new Promise((resolve, reject) => {
        let statusInfo = {
            id: userInfo.userId,
            role: userInfo.role,
            name: userInfo.name,
            date: Date.now(),
            statusFrom: project.status,
            statusTo: statusDetails.statusTo,
            comment: statusDetails.message
        }
        projectModel.updateOne({ '_id': project._id }, {
            $push: { workFlows: statusInfo },
            $set: { status: statusDetails.statusTo, validationTracking: {} }
        }, (err, data) => {
            if (err) {
                logger.error(loggerConstants.PROJECT_DATA_NOT_FOUND + ' : ' + err);
                reject(err);
            } else {
                logger.debug({ success: true, msg: projectsConstants.PROJECT_STATUS_UPDATED_SUCCESSFULLY });
                resolve({ success: true, msg: projectsConstants.PROJECT_STATUS_UPDATED_SUCCESSFULLY, data: { updatedStatus: statusInfo.statusTo } });
            }
        });
    });
}


/*
 * get lastest version release Project based on Project id
 */
const findLatestProject = (projectId, fields) => {
    return new Promise((resolve, reject) => {
        ReleaseProject.findOne({ projectId: projectId })
            .sort('-releaseversion')
            .select(fields)
            .exec((err, releaseProject) => {
                if (err) return reject(err);
                resolve(releaseProject);
            });
    });
}

//validate project on submission
const validateProjectOnSubmission = (projectId) => {
    return new Promise((resolve, reject) => {
        projectModel.findOne({'_id': projectId, $or:[{'epics':[]},{'stories':[]},{'epics.status': 'Active'}, {'stories.status': 'Active'}] }, ['stories', 'epics', 'title', 'status']).exec((err, project) => {
            if (err) {
                return reject(err);
            }
            if(project!=null){
            project = project==null? {}: project.toObject();
            project['isInvalid']=false;
            if (project.epics.length === 0) {
                project['isInvalid'] = true;
                project['isType'] = 'NO EPICS';
            } else if (project.stories.length === 0) {
                project['isInvalid'] = true;
                project['isType'] = 'NO STORIES';
            }

            if (project['isInvalid'] == false && project.stories.length > 0) {
                project.stories.map((story, e) => {
                    story.tasks =Object.assign([],getActiveStatusList(story.tasks));
                        
                    if (story.tasks.length == 0) {
                        project['isInvalid'] = true;
                        story['isInvalid'] = true;
                        story['isType'] = "NO TASKS";
                        project['isType'] = "NO TASKS";

                    }
                })
            }
        }else{
            project={}
            project['isInvalid']=true;
            project['isType'] = 'NO EPICS';
        }
            if (project['isInvalid']) {
                addProjectValidationTrackingDetails(projectId, project).then(success => {
                    resolve({ isInvalid: true });
                }, err => reject(err));
            } else {
                resolve({ isInvalid: false });
            }
        })
    })
}
const getActiveStatusList = (itemList) => {
    itemList.map((item, k) => {
        if (item.status == 'Deleted' || item.status == 'Drafted') {
            itemList.splice(k, 1)
        }
    });
    return itemList;
}
//add project validation tracking details in project
const addProjectValidationTrackingDetails = (projectId, project) => {
    return new Promise((resolve, reject) => {
        projectModel.updateOne({ '_id': projectId }, {
            $set: { validationTracking: project }
        }, (err, data) => {
            if (err) return reject(err);
            logger.info('Project validation tracking details added successfully in project');
            resolve();
        });
    });
}



/**     Projects **/

//add epic in project
const addEpic = (projectId, epic, currentUser) => {
    return new Promise((resolve, reject) => {
        projectModel.updateOne({ '_id': projectId }, {
            $push: {
                epics: epic
            }
        }, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve({ success: true, msg: projectsConstants.EPICS_ADDED_SUCCESSFULLY });
        });
    });
}

//update epic in project
const updateEpic = (projectId, epicId, epic, currentUser) => {
    return new Promise((resolve, reject) => {
        projectModel.updateOne({ '_id': projectId, "epics._id": epicId }, {
            $set: {
                'epics.$.title': epic.title,
                'epics.$.description': epic.description,
                'epics.$.status': epic.status,
            }
        }, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve({ success: true, msg: projectsConstants.EPICS_SUCCESSFULLY_UPDATED });
        });
    });
}

//delete epic by epic id
const deleteEpic = (projectId, epicId) => {
    return new Promise((resolve, reject) => {
        projectModel.update({ '_id': projectId }, {
            $pull: {
                epics: {
                    _id: epicId
                }
            }
        }, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve({ success: true, msg: projectsConstants.EPICS_SUCCESSFULLY_DELETED });
        });
    });
}

//get epic by epic id 
const getEpicById = (projectId, epicId) => {
    return new Promise((resolve, reject) => {
        projectModel.findOne({ '_id': projectId, "epics._id": epicId }, {
            'epics.$': 1
        }, (err, data) => {
            if (err) {
                return reject(err);
            } else if (data) {
                resolve({ success: true, msg: projectsConstants.GET_EPICS_SUCCESSFULLY, data: data.epics });
            } else {
                resolve({ success: true, msg: projectsConstants.No_EPICS_FOUND, data: [] });
            }
        });
    });
}
//get epic by epic id 
const getEpicList = (projectId) => {
    return new Promise((resolve, reject) => {
        projectModel.find({ '_id': projectId })
            .select('epics')
            .exec((err, data) => {
                if (err) {
                    return reject(err);
                } else if (data) {
                    resolve({ success: true, msg: projectsConstants.GET_EPICS_SUCCESSFULLY, data: data[0].epics });
                } else {
                    resolve({ success: true, msg: projectsConstants.No_EPICS_FOUND, data: [] });
                }
            });
    });
}

//add story in project
const addStory = (projectId, story, currentUser) => {
    return new Promise((resolve, reject) => {
        projectModel.updateOne({ '_id': projectId }, {
            $push: {
                stories: story
            }
        }, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve({ success: true, msg: projectsConstants.STORY_ADDED_SUCCESSFULLY });
        });
    });
}

//update story in project
const updateStory = (projectId, storyId, story, currentUser) => {
    return new Promise((resolve, reject) => {
        projectModel.updateOne({ '_id': projectId, "stories._id": storyId }, {
            $set: {
                'stories.$.title': story.title,
                'stories.$.description': story.description,
                'stories.$.status': story.status,
                'stories.$.epicId': story.epicId
            }
        }, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve({ success: true, msg: projectsConstants.STORY_SUCCESSFULLY_UPDATED });
        });
    });
}

//delete story in project
const deleteStory = (projectId, storyId) => {
    return new Promise((resolve, reject) => {
        projectModel.update({ '_id': projectId }, {
            $pull: {
                stories: {
                    _id: storyId
                }
            }
        }, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve({ success: true, msg: projectsConstants.STORY_SUCCESSFULLY_DELETED });
        });
    });
}

//get story by id
const getStoryById = (projectId, storyId) => {
    return new Promise((resolve, reject) => {
        projectModel.findOne({ '_id': projectId, "stories._id": storyId }, {
            'stories.$': 1
        }, (err, data) => {
            if (err) {
                return reject(err);
            } else if (data) {
                resolve({ success: true, msg: projectsConstants.GET_STORY_SUCCESSFULLY, data: data.stories });
            } else {
                resolve({ success: true, msg: projectsConstants.STORY_DATA_NOT_FOUND, data: [] });
            }
        });
    });
}

//get story by id
const getTaskById = (projectId, storyId, taskId) => {
    return new Promise((resolve, reject) => {
        getStoryById(projectId, storyId).then(result => {
            if (result) {
                let task = result.data[0].tasks.filter((task) => task._id == taskId);
                if (task) {
                    logger.debug({ success: true, msg: projectsConstants.GET_TASK_SUCCESSFULLY });
                    resolve({ success: true, msg: projectsConstants.GET_TASK_SUCCESSFULLY, data: task });
                } else {
                    logger.error({ success: false, msg: projectsConstants.TASK_DATA_NOT_FOUND })
                    reject({ success: false, msg: projectsConstants.TASK_DATA_NOT_FOUND, data: [] })
                }
            } else {
                logger.error({ success: false, msg: projectsConstants.STORY_DATA_NOT_FOUND })
                reject({ success: false, msg: projectsConstants.STORY_DATA_NOT_FOUND, data: [] })
            }
        }).catch(err => {
            reject(err);
        });
    });
}



//add task  in story
const addTask = (projectId, storyId, task, currentUser) => {
    return new Promise((resolve, reject) => {
        projectModel.updateOne({ '_id': projectId, "stories._id": storyId }, {
            $push: {
                'stories.$.tasks': task
            }
        }, { upsert: true }, (err, data) => {
            if (err) {
                return reject(err);
            } else {
                storyDuration(projectId, storyId).then(storyDurationSuccess => {
                    courseDuration(projectId).then(courseDurationSuccess => {
                        logger.debug({ success: true, msg: projectsConstants.TASK_ADDED_SUCCESSFULLY });
                        resolve({ success: true, msg: projectsConstants.TASK_ADDED_SUCCESSFULLY, data: data });
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            }
        });
    });
}

/* update task from story */
const updateTask = (projectId, storyId, taskId, task, currentUser) => {
    return new Promise((resolve, reject) => {
        projectModel.findOne({ _id: projectId }, (err, data) => {
            if (err) {
                return reject(err);
            } else {
                let index = getIndex(data, storyId, taskId);
                let storyIndex = index.storyIndex;
                let taskIndex = index.taskIndex;
                let query = { $set: {} };
                query.$set['stories.' + storyIndex + '.tasks.' + taskIndex + '.title'] = task.title;
                query.$set['stories.' + storyIndex + '.tasks.' + taskIndex + '.description'] = task.description;
                query.$set['stories.' + storyIndex + '.tasks.' + taskIndex + '.doneCriteria'] = task.doneCriteria;
                query.$set['stories.' + storyIndex + '.tasks.' + taskIndex + '.actions'] = task.actions;
                query.$set['stories.' + storyIndex + '.tasks.' + taskIndex + '.duration'] = task.duration;
                query.$set['stories.' + storyIndex + '.tasks.' + taskIndex + '.status'] = task.status;
                projectModel.findOneAndUpdate({ _id: projectId }, query, { new: true }, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    storyDuration(projectId, storyId).then(storyDurationSuccess => {
                        courseDuration(projectId).then(courseDurationSuccess => {
                            logger.debug({ success: true, msg: projectsConstants.TASK_SUCCESSFULLY_UPDATED });
                            resolve({ success: true, msg: projectsConstants.TASK_SUCCESSFULLY_UPDATED, data: data });
                        }).catch(err => {
                            reject(err);
                        });
                    }).catch(err => {
                        reject(err);
                    });
                });
            }
        });
    });
}

/* delete task from story */
const deleteTask = (projectId, storyId, taskId, currentUser) => {
    return new Promise((resolve, reject) => {
        projectModel.findOne({ _id: projectId }, (err, data) => {
            if (err) {
                return reject(err);
            } else {
                let index = getIndex(data, storyId, taskId);
                let storyIndex = index.storyIndex;
                let taskIndex = index.taskIndex;
                let query = { $set: {} };
                query.$set['stories.' + storyIndex + '.tasks.' + taskIndex + '.status'] = constants.CONTENT_STATUS[5]
                projectModel.findOneAndUpdate({ _id: projectId }, query, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    storyDuration(projectId, storyId).then(storyDurationSuccess => {
                        courseDuration(projectId).then(courseDurationSuccess => {
                            logger.debug({ success: true, msg: projectsConstants.TASK_SUCCESSFULLY_DELETED });
                            resolve({ success: true, msg: projectsConstants.TASK_SUCCESSFULLY_DELETED });
                        }).catch(err => {
                            reject(err);
                        });
                    }).catch(err => {
                        reject(err);
                    });
                });
            }
        });
    });
}

/* get index of story and task */

const getIndex = (projectData, storyId, taskId) => {
    let storyIndex = projectData.stories.findIndex(story => story._id == storyId);
    let stories = projectData.stories.filter((story) => story._id == storyId);
    let taskIndex = stories[0].tasks.findIndex(task => task._id == taskId);
    let index = { storyIndex: storyIndex, taskIndex: taskIndex }
    return index;
}


/* story duration updation*/
const storyDuration = (projectId, storyId) => {
    return new Promise((resolve, reject) => {
        projectModel.findOne({ '_id': projectId }, function(err, result) {
            if (err) reject(err);
            else {
                let stories = result.stories.filter((story) => story._id == storyId && story.status == constants.CONTENT_STATUS[2]);
                let tasks = stories[0].tasks.filter((task) => task.status == constants.CONTENT_STATUS[2]);
                let storyDuration = tasks.map(item => item.duration).reduce((prev, next) => prev + next);
                projectModel.updateOne({ '_id': projectId, "stories._id": storyId }, {
                    $set: {
                        'stories.$.duration': storyDuration
                    }
                }, (err, data) => {
                    if (err) {
                        logger.error({ success: true, msg: projectsConstants.STORY_DURATION_NOT_UPDATED });
                        reject({ status: false, msg: projectsConstants.STORY_DURATION_NOT_UPDATED })
                    } else {
                        logger.debug({ success: true, msg: projectsConstants.STORY_DURATION_UPDATED });
                        resolve({ status: false, msg: projectsConstants.STORY_DURATION_UPDATED });
                    }
                })
            }
        });
    });
}


/*course duration updation*/
const courseDuration = (projectId) => {
    return new Promise((resolve, reject) => {
        projectModel.findOne({ '_id': projectId }, function(err, result) {
            if (err) reject(err);
            else {
                let stories = result.stories.filter((story) => story.status == constants.CONTENT_STATUS[2])
                let courseDuration = stories.map(item => item.duration).reduce((prev, next) => prev + next);
                projectModel.updateOne({ '_id': projectId }, {
                    $set: {
                        'duration': courseDuration
                    }
                }, (err, data) => {
                    if (err) {
                        logger.debug({ success: true, msg: projectsConstants.COURSE_DURATION_NOT_UPDATED });
                        resolve({ status: false, msg: projectsConstants.COURSE_DURATION_NOT_UPDATED });
                    } else {
                        logger.debug({ success: true, msg: projectsConstants.COURSE_DURATION_UPDATED });
                        resolve({ status: false, msg: projectsConstants.COURSE_DURATION_UPDATED });
                    }
                });
            }
        });
    });
}



module.exports = {
    saveProject: saveProject,
    getProjects: getProjects,
    getProjectById: getProjectById,
    getProjectDetails: getProjectDetails,
    updateProjectById: updateProjectById,
    deleteProjectById: deleteProjectById,
    updateProjectStatus: updateProjectStatus,
    validateProjectOnSubmission: validateProjectOnSubmission,
    getFullProjectDetails: getFullProjectDetails,
    releaseProject: releaseProject,
    addEpic: addEpic,
    updateEpic: updateEpic,
    getEpicById: getEpicById,
    getEpicList: getEpicList,
    deleteEpic: deleteEpic,
    listProjects: listProjects,
    addStory: addStory,
    updateStory: updateStory,
    deleteStory: deleteStory,
    getStoryById: getStoryById,
    getTaskById: getTaskById,
    addTask: addTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
}