const uniqid = require('uniqid');
const Teacher = require('./teacher.entity');
const logger = require('./../../services/app.logger');
const validation = require('./../../common/validation');
const userModel = require('./../users/users.entity');
const userController = require('./../users/users.controller');
const appConstant = require('../../constants').app;
const loggerConstants = require('./../../constants/logger').SCHOOLS;
const CustomError = require('./../../services/custom-error');
const { getQuery } = require('./../../services/filter');

//register teacher
const register = (teacherDetails, currentUser, platform) => {
	return new Promise((resolve, reject) => {
		if (currentUser['role'] && (currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[0] || currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[2])) {
			userModel.findOne({ "username": teacherDetails.email }, (err, data) => {
				if (err) {
					logger.error(err.message)
					reject({ msg: 'Internal error occoured' });
				} else if (data) {
					reject({ success: false, msg: `${teacherDetails.email} already registered` });
				} else {
					if (currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[2]) {
						teacherDetails['schoolId'] = currentUser['userId'];
					}
					teacherDetails['createdBy'] = {
						id: currentUser['userId'],
						name: currentUser['name'],
						role: currentUser['role']
					}
					let teacher = new Teacher(teacherDetails);
					teacher.save((err, teacherInfo) => {
						if (err) {
							logger.error(err.message)
							reject({ msg: 'Internal error occoured' });
						} else if (teacherInfo) {
							userController.saveUserDetails(teacherInfo, appConstant.USER_DETAILS.USER_ROLES[3], platform)
							.then(success => {
								resolve(success);
							}).catch(err => {
								reject(err);
							});
						}
					});
				}
			});
		} else {
			reject(new CustomError(loggerConstants.NO_RIGHTS));
		}
	});
}

//get all teacher
const getTeachers = (queryParams = {},userInfo) => {
	return new Promise(async(resolve, reject) => {
		let filterParams = getQuery(queryParams);
		let query = filterParams['$where'] || {};
		let limit = +filterParams['$limit'] || 0;
		let sort = filterParams['$orderby'] || { 'createdBy.date': -1 };
		if(userInfo['role']==appConstant.USER_DETAILS.USER_ROLES[2]) {
			query['schoolId']=userInfo['userId'];
		}
		if(userInfo['role'] === appConstant.USER_DETAILS.USER_ROLES[3]) {
			let teacher = await Teacher.findOne({_id: userInfo['userId']},'schoolId');
			if(teacher && teacher['schoolId']) {
				query['schoolId']=teacher['schoolId'];
			}else {
				logger.error(loggerConstants.TEACHER_NOT_FOUND+ ' : '+userInfo['userId']);
				reject(new Error(loggerConstants.INTERNAL_ERROR));
			}
		}
		Teacher.find(query)
		.limit(limit)
		.sort(sort)
		.exec((err, teachers) => {
			if (err) reject(err);
			resolve({ success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: teachers })
		});
	});
}

//get teacher by id
const getTeacherById = id => {
	return new Promise((resolve, reject) => {
		Teacher.findOne({ '_id': id }, (err, teacher) => {
			if (err) return reject(err);
			resolve({ success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: teacher })
		});
	});
};

//update teacher
const update = function(teacherObj, teacherId, currentUser) {
	return new Promise((resolve, reject) => {
		if (currentUser['role'] && (currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[0] || currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[2])) {
			Teacher.findOneAndUpdate({ _id: teacherId }, {
				$push: {
					updatedBy: {
						id: currentUser.userId,
						role: currentUser.role,
						name: currentUser.name,
						date: Date.now()
					}
				},
				$set: {
					name: teacherObj.name,
					schoolId: teacherObj.schoolId,
					address: teacherObj.address,
					gender: teacherObj.gender,
					mobile: teacherObj.mobile,
					city: teacherObj.city,
					state: teacherObj.state,
					zipCode: teacherObj.zipCode,
					country: teacherObj.country,
					status: teacherObj.status,
				}
			}, (err, teacher) => {
				if (err) {
					return reject(err);
				} else {
					if (teacher.name !== teacherObj.name) {       	
						userModel.update({ userId: teacherId }, {
							$set: {
								name: teacherObj.name,
							}
						}, (err) => {
							if (err) {
								return reject(err);
							} else {

							}
							resolve({ success: true, msg: loggerConstants.UPDATE_SUCCESSSFULLY });
						});
					}
				}
				resolve({ success: true, msg: loggerConstants.UPDATE_SUCCESSSFULLY });
			});
		} else {
			reject(new CustomError(loggerConstants.NO_RIGHTS));
		}
	});
};

//delete teacher from data base 
const deleteTeacher = (teacherId, currentUser) => {
	return new Promise((resolve, reject) => {
		if (currentUser['role'] && (currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[0] || currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[2])) {
			Teacher.updateOne({ _id: teacherId }, {
				$set: {
					status: appConstant.CONTENT_STATUS[5],
					deletedBy: {
						id: currentUser.userId,
						role: currentUser.role,
						name: currentUser.name,
						date: Date.now()
					}
				}
			}, (err, teacher) => {
				if (err) 
				{
					return reject(err);
				}else{
					userModel.updateOne({ userId: teacherId}, {
						$set: {
							status: appConstant.CONTENT_STATUS[5],
						}
					}, (err) => {
						if (err) return reject(err);                              
						resolve({ success: true, msg: loggerConstants.DELETED_SUCCESSFULLY });
					});
                    // close of update in user collection-
                  }
                  resolve({ success: true, msg: loggerConstants.DELETED_SUCCESSFULLY });
                });
		} else {
			reject(new CustomError(loggerConstants.NO_RIGHTS));
		}
	});
}


//assign Classes  
const assignClasses=(teacherId,data,currentUser)=> {
	return new Promise((resolve,reject)=>{
		Teacher.update({_id: teacherId},  {
			$push: {
				updatedBy: {
					id: currentUser.userId,
					role: currentUser.role,
					name: currentUser.name,
					date: Date.now()
				}
			},
			$set : {
				subCategories: data.classes,
			}
		},(err,teacher)=>{
			if(err) return reject(err);
			resolve({success : true, msg : loggerConstants.UPDATE_SUCCESSSFULLY});
		});
	});
}

//find students by school id
function findBySchoolId(schoolId) {
	return new Promise((resolve, reject) => {
		Teacher.find({ 'schoolCode': schoolId })
		.exec(function(err, students) {
			resolve(students);
		});
	});
}

//get all teachers by school
const getTeachersBySchool= (schoolId)=>{
	return new Promise(async(resolve,reject)=> {
		try{
			let teachers= await Teacher.find({ 'schoolId': schoolId,status: appConstant.STATUS.ACTIVE},'_id name');
			resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY,data: teachers || []});
		}catch(err) {
			reject(err)
		} 
	});
}

module.exports = {
	register : register,
	getTeachers : getTeachers,
	getTeacherById : getTeacherById,
	deleteTeacher : deleteTeacher,
	update : update,
	findBySchoolId : findBySchoolId,
	assignClasses : assignClasses,
	getTeachersBySchool : getTeachersBySchool,
}
