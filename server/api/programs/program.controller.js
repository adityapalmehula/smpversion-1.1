const fs = require('fs');
const programModel = require('./program.entity');
const logger = require('../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger');
const programsConstants = loggerConstants.PROGRAMS;
const appConstants = require('./../../constants/app');
const constants = require('./../../constants/app');
const projectsConstants = loggerConstants.PROJECTS;
const releaseProgramController = require('./../releasePrograms/releaseProgram.controller');

// save Program data to db
const saveProgram = function(programData, currentUser) {
    return new Promise((resolve, reject) => {
        programData['price'] = {
            actual: programData['actualPrice'],
            offered: programData['offeredPrice'],
            discount: programData['discount']
        };
        programData['createdBy'] = {
            id: currentUser['userId'],
            role: currentUser['role'],
            name: currentUser['name']
        }
        if (currentUser['role'] === appConstants.USER_DETAILS.USER_ROLES[1]) {
            programData['createdBy']['name'] = appConstants.DEFAULT_NAME_FOR_BACKEND_USER;
        } else {
            programData['createdBy']['name'] = currentUser['name'];
        }
        programData['status'] = appConstants.CONTENT_STATUS[0];
        logger.debug(programsConstants.GET_OBJECT_AND_STORE_PROGRAM + ' : programs');

        let newProgram = new programModel(programData);
        let error = newProgram.validateSync();
        if (error) {
            let msg = validation.formValidation(error);
            reject(msg);
        } else {
            newProgram.save(function(err, data) {
                if (err) {
                    logger.error(programsConstants.PROGRAM_NOT_SAVED + ':' + err);
                    reject({ success: false, msg: programsConstants.PROGRAM_NOT_SAVED });
                } else {
                    logger.debug(programsConstants.PROGRAM_SUCCESSFULLY_SAVED);
                    resolve({ success: true, msg: programsConstants.PROGRAM_SUCCESSFULLY_SAVED });
                }
            });
        }
    });
}

// get projects data from program details page
const getProjectData = function(programId) {
    return new Promise((resolve, reject) => {
        programModel.find({ '_id': programId })
            .populate({ path: 'projectData.contentId', select: 'description', model: 'projects'})
            .populate({ path: 'courseData.contentId', select: 'shortDescription', model: 'courses'})
            .exec((err, data) => {
                if (err) {
                    logger.error(loggerConstants.NO_COURSE_FOUND_NO_PROJECT_FOUND + ' : ' + err);
                    reject({ success: false, msg: err });
                } else if (!data) {
                    logger.error(loggerConstants.NO_COURSE_FOUND_NO_PROJECT_FOUND);
                    reject({ success: false, msg: loggerConstants.NO_COURSE_FOUND_NO_PROJECT_FOUND });
                } else {
                    logger.debug(loggerConstants.GET_ALL_DATA_OF_PROJECT_COURSES);
                    resolve({ success: true, data: data });
                }
            });
    });
};



//release Product
const releaseProgram = (programId, userInfo) => {
    return new Promise((resolve, reject) => {
        getFullProgramDetails(programId, userInfo).then(fullProgram => {
            releaseProgramController.persistReleaseProgram(programId, fullProgram, userInfo)
                .then(success => {
                    resolve(success);
                })
        }).catch(err => {
            reject(err);
        });
    });
}
//get course full details
const getFullProgramDetails = (programId, userInfo) => {
    return new Promise(async(resolve, reject) => {
        try {
            let program = await programModel.findOne({ '_id': programId });
            return resolve(program);
        } catch (err) {
            reject(err);
        }
    });
}

//delete single program by program id
const deleteProgramById = function(programId, currentUser) {
    return new Promise((resolve, reject) => {
        programModel.updateOne({ '_id': programId }, {
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
                logger.error(programsConstants.PROGRAM_DATA_NOT_FOUND + ' : ' + err);
                reject(err);
            } else {
                logger.debug({ success: true, msg: programsConstants.PROGRAM_SUCCESSFULLY_DELETED });
                resolve({ success: true, msg: programsConstants.PROGRAM_SUCCESSFULLY_DELETED });
            }
        });
    });
};

// update program data update here
const updateProgramById = function(programData, _id, userInfo) {
    // let courseObj = courseData
    programData['price'] = {
        actual: programData['actualPrice'],
        offered: programData['offeredPrice'],
        discount: programData['discount']
    };

    logger.debug(projectsConstants.GET_OBJECT_AND_STORE_PROJECT + ' : programs');
    return new Promise((resolve, reject) => {
        programModel.findOneAndUpdate({ _id: _id }, {
            $set: {
                code: programData.code,
                version: programData.version,
                title: programData.title,
                duration: programData.duration,
                effort: programData.effort,
                programNeed: programData.programNeed,
                description: programData.description,
                activationMethod: programData.activationMethod,
                currency: programData.currency,
                price: programData.price,
                isPaid: programData.isPaid,
                tags: programData.tags,
                icon: programData.icon,
                projectData: programData.projectData,
                courseData: programData.courseData,
                updatedBy: {
                    id: userInfo.userId,
                    role: userInfo.role,
                    name: userInfo.name,
                    date: Date.now()
                },
                // duration: projectData.duration,
                status: programData.status,
            }
        }, { runValidators: true }, (err, data) => {
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
// close update program data

// Get all Prohrams
const getPrograms = function() {
    return new Promise((resolve, reject) => {
        programModel.find((err, programs) => {
            if (err) {
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
                reject({ success: false, msg: err });
            } else if (!programs) {
                logger.error(programsConstants.PROGRAM_DATA_NOT_FOUND);
                reject({ success: false, msg: programsConstants.PROGRAM_DATA_NOT_FOUND });
            } else {
                resolve({ success: true, data: programs });
            }
        });
    });
};

//Get single program by program id
const getProgramById = function(programId) {
    return new Promise((resolve, reject) => {
        programModel.findById({ _id: programId }, (err, program) => {
            if (err) {
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
                reject({ success: false, msg: err });
            } else if (!program) {
                logger.error(programsConstants.PROGRAM_DATA_NOT_FOUND);
                reject({ success: false, msg: programsConstants.PROGRAM_DATA_NOT_FOUND });
            } else {
                resolve({ success: true, data: program });
            }
        });
    });
};

//update Program status

const updateProgramStatus = (program, statusDetails, userInfo) => {
    return new Promise((resolve, reject) => {
        let statusInfo = {
            id: userInfo.userId,
            role: userInfo.role,
            name: userInfo.name,
            date: Date.now(),
            statusFrom: program.status,
            statusTo: statusDetails.statusTo,
            comment: statusDetails.message
        }
        programModel.updateOne({ '_id': program._id }, {
            $push: { workFlows: statusInfo },
            $set: { status: statusDetails.statusTo, validationTracking: {} }
        }, (err, data) => {
            if (err) {
                logger.error(programsConstants.PROGRAM_DATA_NOT_FOUND + ' : ' + err);
                reject(err);
            } else {
                logger.debug({ success: true, msg: programsConstants.PROGRAM_STATUS_UPDATED_SUCCESSFULLY });
                resolve({ success: true, msg: programsConstants.PROGRAM_STATUS_UPDATED_SUCCESSFULLY, data: { updatedStatus: statusInfo.statusTo } });
            }
        });
    });
}

//validate program on submission
const validateProgramOnSubmission = (programId) => {
    return new Promise((resolve, reject) => {
        programModel.findOne({ '_id': programId }, function(err, program) {
            if (err) {
                return reject(err);

            }
            if (program != null) {

                resolve({ isInvalid: false });
                program = program == null ? {} : program.toObject();
                program['isInvalid'] = false;

            } else {

                program = {}
                resolve({ isInvalid: true });

                program['isInvalid'] = true;
            }

        })
    })
}

module.exports = {
    saveProgram: saveProgram,
    getPrograms: getPrograms,
    getProgramById: getProgramById,
    updateProgramStatus: updateProgramStatus,
    deleteProgramById: deleteProgramById,
    updateProgramById: updateProgramById,
    releaseProgram: releaseProgram,
    getFullProgramDetails: getFullProgramDetails,
    validateProgramOnSubmission: validateProgramOnSubmission,
    getProjectData : getProjectData,
}