const schoolModel = require('./school.entity');
const logger = require('./../../services/app.logger');
const validation = require('./../../common/validation');
const userModel = require('./../users/users.entity');
const userController = require('./../users/users.controller');
const courseController = require('./../courses/course.controller');
const subCategoryCtrl = require('./../subcategories/subcategory.controller');
const appConstant = require('../../constants').app;
const loggerConstants = require('./../../constants/logger').SCHOOLS;
const CustomError = require('./../../services/custom-error');
const { getQuery }= require('./../../services/filter');
const ClassModel = require('./../classes/class.entity');
const subCategory = require('./../subcategories/subcategory.entity');

const register=(schoolDetails,currentUser,platform)=> {
	return new Promise((resolve,reject)=> {
		if(currentUser['role'] && currentUser['role']==appConstant.USER_DETAILS.USER_ROLES[0]) {
			userModel.findOne({"username":schoolDetails.email},(err,data)=> {
				if(err) {
					logger.error(err.message)
					reject({ msg:'Internal error occoured'});
				} else if(data) {
					reject({ success: false, msg: `${schoolDetails.email} already registered` });
				}else {
					schoolDetails['createdBy']= {
						id: currentUser['userId'],
						name: currentUser['name'],
						role: currentUser['role']
					}
					let school= new schoolModel(schoolDetails);
					school.save((err, schoolInfo)=> {
						if(err) {
							logger.error(err.message)
							reject({ msg:'Internal error occoured'});
						}else if(schoolInfo) {
							userController.saveUserDetails(schoolInfo,appConstant.USER_DETAILS.USER_ROLES[2],platform)
							.then(async response=> {
								if(response['success']) {
									let data = await subCategory.find({ status: appConstant.STATUS.ACTIVE },'_id name');
									if(data) {
										let subcategories=data.map(sc=> new ClassModel({subCategoryId:sc._id,name:sc.name,schoolId:schoolInfo._id,createdBy:schoolDetails['createdBy']}));
										ClassModel.insertMany(subcategories,(error, docs)=> {
											logger.info(loggerConstants.ASSIGN_DEFUALT_SUBCATEGORIES_SUCCESSFULLY);
											resolve(response);
										});
									}else {
										resolve(response);
									}
								}
							}).catch(err=> {
								reject(err);
							});
						}
					});
				}
			});
		}else {
			reject(new CustomError(loggerConstants.NO_RIGHTS));
		}
	});
}

//get all schools data
const getSchools = (queryParams = {}) => {
	return new Promise((resolve, reject) => {
		let filterParams = getQuery(queryParams);
		let query = filterParams['$where'] || {};
		let limit = +filterParams['$limit'] || 0;
		let sort = filterParams['$orderby'] || { 'createdBy.date': -1 };
		schoolModel.find(query)
		.limit(limit)
		.sort(sort)
		.exec((err, schools) => {
			if (err) {
				logger.error(err)
				reject({ msg: loggerConstants.INTERNAL_ERROR });
			} else if (schools) {
				resolve({ success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: schools })
			} else {
				resolve({ success: true, msg: loggerConstants.NO_DATA_AVAILABLE });
			}
		});
	});
}

//get all schools for filter

const getSchoolList=() => {
	return new Promise((resolve,reject)=> {
		schoolModel.find({status: appConstant.STATUS.ACTIVE},'_id name',(err,schools)=> {
			if(err) return reject(err);
			resolve({success: true, msg:loggerConstants.DATA_GET_SUCCESSFULLY, data: schools})
		});
	});
}

//get school by id
const getSchoolById = (schId) => {
	return new Promise((resolve, reject) => {
		schoolModel.findOne({ '_id': schId })
		.exec((err, school) => {
			if (err) {
				logger.error(err.message)
				reject({ msg: 'Internal error occoured' });
			} else if (school) {
				resolve({ success: true, msg: "Data get successfully", data: school })
			} else {
				resolve({ success: true, msg: 'No data available' });
			}
		});
	});
};

//get assigned categories 
function getAssignCategories(id) {
	return new Promise((resolve, reject) => {
		schoolModel.findOne({ '_id': id })
		.populate('categories', ['_id', 'name'])
		.exec((err, school) => {
			if (err) {
				logger.error(err)
				reject({ msg: 'Internal error occoured' });
			} else if (school) {
				let schCourseDetails = {};
				if (school.categories) {
					let categories = [],
					categoryPromises = [],
					subCategories = [],
					coursePromises = [],
					courses = [];

					school.categories.map(category => {
						categories.push({ id: category._id, itemName: category.name })
						categoryPromises.push(subCategoryCtrl.getSubCategories(category.id, { status: appConstant.STATUS.ACTIVE }))
						coursePromises.push(courseController.getCourseByCategoryId(category.id, { status: appConstant.STATUS.ACTIVE }))
					})
					schCourseDetails.categories = categories;
					Promise.all(categoryPromises).then(responses => {
						if (responses.length > 0) {
							for (let i = 0; i < responses.length; i++) {
								responses[i].map(subCat => {
									subCategories.push({
										id: subCat._id,
										itemName: subCat.name,
										category: subCat.categoryId,
									})
								})
							}
							schCourseDetails.subcategories = subCategories;
						}
						Promise.all(coursePromises).then(responses => {
							if (responses.length > 0) {
								for (let i = 0; i < responses.length; i++) {
									responses[i].map(course => {
										courses.push({
											id: course._id,
											itemName: course.title,
											category: course.category,
											subcategory: course.subcategory
										})
									});
								}
							}
							schCourseDetails.courses = courses;
							resolve({ success: true, msg: "Data get successfully", data: schCourseDetails })
						}).catch((err) => {
							logger.error(error);
							reject({ msg: 'Internal error occoured' });
							return;
						});
					}).catch((err) => {
						logger.error(error);
						reject({ msg: 'Internal error occoured' });
						return;
					});
				} else {
					resolve({ success: true, msg: "Data get successfully", data: [] })
				}
			}
		});
	});
}

// update school school
const update = function(schoolObj, schoolId, currentUser) {
	return new Promise((resolve, reject) => {
		if (currentUser['role'] && currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[0]) {
			schoolModel.findOneAndUpdate({ _id: schoolId }, {
				$push: {
					updatedBy: {
						id: currentUser.userId,
						role: currentUser.role,
						name: currentUser.name,
						date: Date.now()
					}
				},
				$set: {
					name: schoolObj.name,
					address: schoolObj.address,
					phoneNo: schoolObj.phoneNo,
					mobile: schoolObj.mobile,
					website: schoolObj.website,
					city: schoolObj.city,
					state: schoolObj.state,
					zipCode: schoolObj.zipCode,
					country: schoolObj.country,
					status: schoolObj.status,
				}
			}, (err, school) => {
				if (err) {
					return reject(err);
				} else {
					if (school.name !== schoolObj.name) {
						userModel.update({ userId: schoolId }, {
							$set: {
								name: schoolObj.name,
								status: schoolObj.status,
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

// Delete school 
const deleteSchool = function(schoolId, currentUser) {
	return new Promise((resolve, reject) => {
		if (currentUser['role'] && currentUser['role'] == appConstant.USER_DETAILS.USER_ROLES[0]) {
			schoolModel.updateOne({ _id: schoolId }, {
				$set: {
					status: appConstant.CONTENT_STATUS[5],
					deletedBy: {
						id: currentUser.userId,
						role: currentUser.role,
						name: currentUser.name,
						date: Date.now()
					}
				}
			}, (err, school) => {
				if (err) {
					return reject(err);
				}else{
                	// Update status in user collection-
                	userModel.updateOne({ userId: schoolId}, {
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

//update category
function updateCategories(data, _id) {
	return new Promise((resolve, reject) => {
		let categories = data.categories;
		if (!_id) {
			reject({ msg: 'School is required' });
		} else if (categories.length <= 0) {
			reject({ msg: 'Categories required' });
		} else {
			schoolModel.updateOne({ _id: _id }, {
				$set: {
					categories: categories,
					updatedOn: Date.now()
				}
			}, (err, school) => {
				if (err) {
					logger.error(err)
					reject({ msg: 'Internal error occoured' });
				} else {
					resolve({ success: true, msg: 'School data updated successfully !' });
				}
			});
		}
	})
}

//check validation
function isValid(school) {
	return new Promise((resolve, reject) => {
		if (!school.name) {
			reject({ msg: 'School name is required' });
		} else if (!validation.isOnlyAlpahabetic(school.name)) {
			reject({ msg: 'Please enter valid school name' });
		} else if (!school.email) {
			reject({ msg: 'Email is required' })
		} else if (!validation.isValidEmail(school.email)) {
			reject({ msg: 'Please enter valid email' });
		} else if (!school.mobile) {
			reject({ msg: 'Mobile number is required' })
		} else if (!validation.isValidMobNo(school.mobile) || school.mobile.length > 10) {
			reject({ msg: 'Please enter valid mobile number' });
		} else if (!school.address) {
			reject({ msg: 'Address is required' });
		} else if (!school.city) {
			reject({ msg: 'City name is required' })
		} else if (!validation.isOnlyAlpahabetic(school.city)) {
			reject({ msg: 'Please enter valid city name' });
		} else if (!school.state) {
			reject({ msg: 'State is required' });
		} else if (!validation.isOnlyAlpahabetic(school.state)) {
			reject({ msg: 'Please enter valid state name' });
		} else if (!school.zipCode) {
			reject({ msg: 'Zip code is required' });
		} else if (!/^\d{6}$/.test(school.zipCode)) {
			reject({ msg: 'Please enter valid zip code' });
		} else if (school.website && !/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(school.website)) {
			reject({ msg: 'Please enter valid web site' });
		} else {
			resolve();
		}
	});
}

module.exports = {
	register: register,
	getSchools: getSchools,
	getSchoolById: getSchoolById,
	update: update,
	deleteSchool: deleteSchool,
	getSchoolList: getSchoolList,
	updateCategories: updateCategories,
	getAssignCategories: getAssignCategories,
}