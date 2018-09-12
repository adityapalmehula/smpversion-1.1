const appConstant = require('../../constants').app;
const logger = require('./../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger').BASICPROFILE;
const User = require('./../users/users.entity');
const userController = require('./../users/users.controller');
const studentsModel = require('./../students/student.entity');
const countryModel = require('./../country/country.entity')




// const getCountry =(state,city) =>{
// 	let stateObj = {};
//   stateObj['state'] = state;
//   stateObj['cities'] = city;
// 	return new Promise((resolve, reject) => {
//     countryModel.findOneAndUpdate({'_id':'5b89029182616f308ee737e7'},
//     	{$push:{
//     		states:stateObj
//     	}},function(err, data) {
//             if (err) {
//                 logger.error('counry not added sucessfully' + err);
//                 reject(err);
//             } else {
//                 resolve({ success: true, msg: ' Successfully added' });
//             }
//         })
//     });
// }

function getCountry() {
    //let UserSchRef = userController.getUserModel(role);
    return new Promise((resolve, reject) => {
        countryModel.find({},(err, data) => {
            if (err) {
                logger.error(err.message)
                reject({ msg: loggerConstants.INTERNAL_ERROR });
            } else if (!data) {
                reject({ success: false, msg: loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + _id })
            } else {
                resolve({ success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: data })
            }
        });
    });
}

// update User data
const updateBasicProfile = (userObj, _id, role) => {
    let UserSchRef = userController.getUserModel(role);
    let userUpdatedObj = getUserObject(role, userObj, _id);
    return new Promise((resolve, reject) => {
        let ifError = validation.validationForm(userObj);
        if (ifError) {
            logger.error({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
            reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });

        } else {
            UserSchRef.findOneAndUpdate({ _id: _id }, {
                $set: userObj
            }, (err, student) => {
                if (err) {
                    logger.error(err);
                    reject({ msg: loggerConstants.INTERNAL_ERROR });
                } else if (student) {
                    let username = {};
                    username = { name: userObj.name };
                    User.updateOne({ userId: _id }, {
                        $set: username
                    }, (error, data) => {
                        if (error) {
                            logger.error(error.msg);
                            reject({ success: false, error: error.msg });
                        } else {
                            logger.info(loggerConstants.PROFILE_IS_SUCCESSFULLY_UPDATED)
                            resolve({ success: true, msg: loggerConstants.PROFILE_IS_SUCCESSFULLY_UPDATED });
                        }
                    })
                }
            });
        }
    });
}
// update user address here
const updateProfileAddress = (addressObj, _id, role) => {
    let UserSchRef = userController.getUserModel(role);
    let userUpdatedObj = getUserObject(role, addressObj, _id);
    return new Promise((resolve, reject) => {
        let studentsData = new studentsModel(addressObj);
        let ifError = validation.addressvalidationForm(addressObj);
        if (ifError) {
            return reject(msg)
        } else {
            UserSchRef.findOneAndUpdate({ _id: _id }, {
                $set: {
                    'address': addressObj
                }
            }, { runValidators: true }, (err, addressinfo) => {
                if (err) {
                    let ifError = validation.formValidation(err);
                    if (ifError) {
                        reject({ msg: ifError.msg });
                    }
                    logger.error(err);
                    reject({ msg: message });
                } else {
                    logger.info(loggerConstants.ADDRESS_IS_SUCCESSFULLY_UPDATED)
                    resolve({ success: true, msg: loggerConstants.ADDRESS_IS_SUCCESSFULLY_UPDATED });
                }
            });
        }
    });
}
//{runValidators:true}
// update user acadmic information
const updateProfileAcademic = (academicObj, _id, role) => {
    let UserSchRef = userController.getUserModel(role);
    let userUpdatedObj = getUserObject(role, academicObj, _id);
    return new Promise((resolve, reject) => {
        let getError = validation.validationForm(academicObj);
        if (getError) {
            logger.error({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
            reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
        } else {
            UserSchRef.findOneAndUpdate({ _id: _id }, {
                $set: {
                    'academicDetails': academicObj,
                }
            },{ runValidators: true },(err, academicinfo) => {
                if (err) {
                  let ifError = validation.formValidation(err);
                    if (ifError) {
                        reject({ msg: ifError.msg });
                    }
                    logger.error(err);
                    reject({ msg: loggerConstants.INTERNAL_ERROR });
                } else {
                    logger.info(loggerConstants.ACADEMIC_IS_SUCCESSFULLY_UPDATED)
                    resolve({ success: true, msg: loggerConstants.ACADEMIC_IS_SUCCESSFULLY_UPDATED });
                }
            });
        }
    });
}


// update user socail profile  information .
const updateSocailProfile = (socailObj, _id, role) => {
    let UserSchRef = userController.getUserModel(role);
    let userUpdatedObj = getUserObject(role, socailObj, _id);
    return new Promise((resolve, reject) => {
        let ifError = validation.validationForm(socailObj);
        var opts = { runValidators: true };
        if (ifError) {
            logger.error({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
            reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
        } else {
            UserSchRef.findOneAndUpdate({ _id: _id }, {
                $push: {
                    profileUrls: socailObj
                }
            }, opts ,(err, gitinfo) => {
                if (err) {
                    logger.error(err);
                    reject({ msg: loggerConstants.INTERNAL_ERROR });
                } else {
                    logger.info(loggerConstants.SOCAILPROFILE_IS_SUCCESSFULLY_UPDATED)
                    resolve({ success: true, msg: loggerConstants.SOCAILPROFILE_IS_SUCCESSFULLY_UPDATED });
                }
            });
        }
    });
}

// Edit selected urls of Socail Profile-
const updateSelecteUrls = (UrlseditObj, _id, role) => {
    let UserSchRef = userController.getUserModel(role);
    let id = UrlseditObj._id;
    return new Promise((resolve, reject) => {
        let ifError = validation.validationForm(UrlseditObj);
        if (ifError) {
            logger.error({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
            reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
        } else {
            UserSchRef.updateOne({ _id: _id, "profileUrls._id": id }, {
                $set: {
                    "profileUrls.$.socialUrl": UrlseditObj.socialUrl
                }
            }, (err, gitinfo) => {
                if (err) {
                    logger.error(err);
                    reject({ msg: loggerConstants.INTERNAL_ERROR });
                } else {
                    logger.info(loggerConstants.SOCAILPROFILEURL_IS_SUCCESSFULLY_UPDATED)
                    resolve({ success: true, msg: loggerConstants.SOCAILPROFILEURL_IS_SUCCESSFULLY_UPDATED });
                }
            });
        }
    });
}


// router for delete url of Social URl 
const deleteProfileUrls = function(socialurlId, userInfo) {
    let UserSchRef = userController.getUserModel(userInfo.role);
    return new Promise((resolve, reject) => {
        UserSchRef.updateOne({ '_id': userInfo.userId }, {
                $pull: {
                    profileUrls: {
                        '_id': socialurlId
                    }
                }
            },
            function(err, data) {
                if (err) {
                    logger.error(loggerConstants.COURSE_DATA_NOT_FOUND + ' : ' + err);
                    reject(err);
                } else {
                    logger.debug({ success: true, msg: loggerConstants.SOCAILPROFILEURL_IS_SUCCESSFULLY_DELETED });
                    resolve({ success: true, msg: loggerConstants.SOCAILPROFILEURL_IS_SUCCESSFULLY_DELETED });
                }
            });
    });
}

// Upload profile image for user 
const uploadProfileImage = (imagePath, extension, userId, role) => {
    let UserSchRef = userController.getUserModel(role);
    return new Promise((resolve, reject) => {
        UserSchRef.findOneAndUpdate({ _id: userId }, {
            $set: {
                profilePic: imagePath,
                extension: extension
            }
        }, (error, users) => {
            if (error) {
                logger.error(error.msg);
                reject({ success: false, error: error.msg });
            } else {
                logger.info(loggerConstants.PROFILE_PICTURE_SUCCESSFULLY_UPDATED);
                resolve({ success: true, msg: loggerConstants.PROFILE_PICTURE_SUCCESSFULLY_UPDATED, imgName: users.profilePic });
            }
        });
    });
}

//get student data based in role
function getUserDetail(_id, role) {
    let UserSchRef = userController.getUserModel(role);
    return new Promise((resolve, reject) => {
        UserSchRef.findOne({ '_id': _id }, 'name email mobile profilePic gender', (err, data) => {
            if (err) {
                logger.error(err.message)
                reject({ msg: loggerConstants.INTERNAL_ERROR });
            } else if (!data) {
                reject({ success: false, msg: loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + _id })
            } else {
                resolve({ success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: data })
            }
        });
    });
}


/*
 * To get an object call userObject function based on user role
 */
const getUserObject = (role, userObject, _id) => {
    let userUpdatedObj;
    switch (role) {
        case appConstant.USER_DETAILS.USER_ROLES[0]:
            userUpdatedObj = getObj(userObject, _id);
            break;
        case appConstant.USER_DETAILS.USER_ROLES[1]:
            userUpdatedObj = getObj(userObject, _id);
            break;
        case appConstant.USER_DETAILS.USER_ROLES[2]:
            userUpdatedObj = getSchoolObj(userObject, _id);
            break;
        case appConstant.USER_DETAILS.USER_ROLES[3]:
            userUpdatedObj = getTeacherObj(userObject, _id);
            break;
        case appConstant.USER_DETAILS.USER_ROLES[4]:
            userUpdatedObj = getObj(userObject, _id);
            break;
    }
    return userUpdatedObj;
}

/*
 * create object for student
 */

const getObj = (userObj, _id) => {
    return {
        name: userObj.name,
        mobile: userObj.mobile,
        gender: userObj.gender,
        updatedBy: _id,
        updationDate: Date.now()
    }
}


module.exports = {
    updateBasicProfile: updateBasicProfile,
    updateProfileAddress: updateProfileAddress,
    updateSocailProfile: updateSocailProfile,
    updateProfileAcademic: updateProfileAcademic,
    uploadProfileImage: uploadProfileImage,
    deleteProfileUrls: deleteProfileUrls,
    updateSelecteUrls: updateSelecteUrls,
    getUserObject: getUserObject,
    getObj: getObj,
    getUserDetail: getUserDetail,
    getCountry:getCountry,
}