const User = require('./users.entity');
const logger = require('../../services/app.logger');
const appConstant = require('../../constants').app;
const mailer = require('./../../services/mailer');
const loggerConstants = require('./../../constants/logger').USER;
const School = require('./../schools/school.entity');
const Instructor = require('./../instructors/instructor.entity');
const Teacher = require('./../teachers/teacher.entity');
const Student = require('./../students/student.entity');
const Admin = require('./../admins/admin.entity');
const uniqueId = require('uuid/v4');
const randomstring = require("randomstring");
const CustomError = require('./../../services/custom-error');
const validation = require('./../../common/validation');
const authenticationController = require('./../authentication/auth.controller');
const fs= require('fs');
const path = require('path');

//const MAIL_CONFIG=appConstant.MAIL_CONFIG;

const jwt = require('jsonwebtoken');

//Save new student's details
const registerNewUser = function(userObj, insertType) {
	logger.debug('Get userObj and store into userDetails', userObj);
	var userDetails = {
        // username: "rohitpal051@gmail.com",
        // password: "password@123",
        // role : "Instructor",
        // isVerified: true,
        // status : "Active",
        // name : "Rohit pal",
        username: userObj.username,
        password: userObj.password,
        role: userObj.role,
        userId: userObj.username,
        isVerified: true,
        status: appConstant.USER_DETAILS.USER_STATUS[0], //Status=Active
        lastLoginOn: Date.now(),
        createdOn: Date.now(),
        updatedOn: Date.now()
      };
      let userData = new User(userDetails);

    // insert the data into db using promise
    return new Promise((resolve, reject) => {
    	userData.save(function(err, data) {
    		if (err) {
    			logger.error('userData not added sucessfully' + err);
    			reject(err);
    		} else {
    			resolve({ success: true, msg: ' Successfully Registered' });
    		}
    	});
    });
  };

// Change password of user
let changePassword = (passwordData, userId) => {
	return new Promise((resolve, reject) => {
		let ifError = validation.validationForm(passwordData);
		if (ifError) {
			logger.error({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
			reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
		} else {
			User.findOne({ 'userId': userId }, (err, user) => {
				if (user) {
					if (passwordData.newPassword != passwordData.confirmNewPassword) {
						logger.error({ success: false, msg: loggerConstants.NEW_PASSWORD_AND_CONFIRM_PASSWORD_IS_MISMATCHED });
						reject({ success: false, msg: loggerConstants.NEW_PASSWORD_AND_CONFIRM_PASSWORD_IS_MISMATCHED });
					} else {
						user.comparePassword(passwordData.oldPassword, function(err, isMatch) {
							if (err) {
								logger.error({ success: false, msg: loggerConstants.OLD_PASSWORD_IS_INCORRECT + err });
								reject({ success: false, msg: loggerConstants.OLD_PASSWORD_IS_INCORRECT });
							} else if (isMatch) {
								user.password = passwordData.newPassword;
								user.save(function(err, data) {
									if (err) {
										logger.error({ success: false, msg: loggerConstants.FAIL_TO_UPDATE_PASSWORD + err });
										reject({ success: false, msg: loggerConstants.FAIL_TO_UPDATE_PASSWORD });
									} else {
										logger.info({ success: true, msg: loggerConstants.PASSWORD_IS_SUCCESSFULLY_UPDATED_FOR + userId });
										sendChangePasswordNotificationMail(user.username).then(success=> {
											resolve({ success: true, msg: loggerConstants.PASSWORD_IS_SUCCESSFULLY_UPDATED })
										},err=> {

										})
									}
								});
							} else {
								logger.error({ success: false, msg: loggerConstants.OLD_PASSWORD_IS_INCORRECT + err });
								reject({ success: false, msg: loggerConstants.OLD_PASSWORD_IS_INCORRECT });
							}
						});
					}
				}
			});
		}
	});
}

// send change password successfully mail notification
const sendChangePasswordNotificationMail= email=> {
	return new Promise((resolve,reject)=> {
		let template='cs-change-password-notification.html';
		if(appConstant.APPNAME===appConstant.APPS[0]) {
			template='sp-change-password-notification.html';
		}
		fs.readFile(path.resolve(__dirname, './../../resources/templates', template),'utf8',(err, htmlText)=> {
			if(err) {
				return reject(new CustomError('Mail template not found'));
			}
			let mailConfig = mailer.getMailConfig();
			let mailOptions = {
				from: mailConfig.from,
				to: email,
				subject: `Password Change Successfully`,
				html: htmlText
			}
			mailConfig.transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					logger.error(error.stack || error);
       // reject(error);
       resolve();
     } else {
     	logger.info(loggerConstants.CHANGE_PASSWORD_MAIL_SEND_SUCCESSFULLY+ '=> '+email);
     	resolve();
     }
   });
		});
	});
}

const updateStatus = (userName, status) => {
	return new Promise((resolve, reject) => {
		User.updateOne({ username: userName }, {
			$set: {
				status: status
			}
		}, (err, doc) => {
			if (err) {
				logger.error(err.message)
				reject({ msg: 'Internal error occoured' });
			} else if (doc) {
				resolve({ msg: "User status updated successfully: ", userName });
			} else {
				reject({ msg: 'Failed to update user status' });
			}
		});
	});
}



/* ------------------------------ Refactor code ------------------------------*/


/*
 * verify user based on random generated unique id token
 * once user complete mail verification process 
 * successfully then update the status (isVerified) and 
 * remove user verification token-uniqueId from user collection
 */
 const emailVerification = (uniqeId) => {
 	return new Promise((resolve, reject) => {
 		User.findOne({ 'unqId': uniqeId }, (err, user) => {
 			if (user) {
 				let unqId = uniqueId();
 				User.updateOne({ '_id': user._id }, {
 					$set: {
 						isVerified: true,
 						unqId: unqId,
 					}
 				}, (err, data) => {
 					if (err) {
 						reject(err);
 					} else if (data) {
 						if((user.role== appConstant.USER_DETAILS.USER_ROLES[4] && appConstant.APPNAME===appConstant.APPS[1]) ||
 							(appConstant.APPNAME===appConstant.APPS[0]) ) {
 							sendGreetingMail(user).then(success=> {
 								resolve({ success: true, msg: loggerConstants.MAIL_VERIFICATION_SUCCESSSFULL, status: 'valid', unqId: unqId });
 							},error=> {
 								reject(error);
 							})
 					}else {
 						resolve({ success: true, msg: loggerConstants.MAIL_VERIFICATION_SUCCESSSFULL, status: 'valid', unqId: unqId });
 					}
 				}
 			})
 			} else {
 				resolve({ success: true, msg: loggerConstants.INVALID_MAIL_VERIFICATION_TOKEN, status: 'invalid' });
 			}
 		})
 	})
 }

/*
 * verify user based on unique id token for reset password
 */
 const resetPasswordMailVerification = (uniqeId) => {
 	return new Promise((resolve, reject) => {
 		User.findOne({ 'unqId': uniqeId }, (err, user) => {
 			if (user) {
 				User.updateOne({ '_id': user._id }, {
 					$set: {
 						isVerified: true,
 					}
 				}, (err, data) => {
 					if (err) {
 						reject(err);
 					} else if (data) {
 						resolve({ success: true, msg: loggerConstants.MAIL_VERIFICATION_SUCCESSSFULL, status: 'valid' });
 					}
 				})
 			} else {
 				resolve({ success: true, msg: loggerConstants.INVALID_MAIL_VERIFICATION_TOKEN, status: 'invalid' });
 			}
 		})
 	})
 }

/*
 * save register user-info in user collection
 * send verification mail user on register mail id
 */
 const saveUserDetails = (user, role,platform) => {
 	return new Promise((resolve, reject) => {
 		persistUser(user, role,platform)
 		.then(sendVerificationMail)
 		.then(sendNotificationMail)
 		.then(success => {
 			resolve(success)
 		}).catch(err => {
 			reject(err);
 		});
 	})
 }

/*
 *persist user data into user collection 
 */
 const persistUser = (userInfo, role ,platform) => {
 	let password, isPasswordReset;
 	return new Promise((resolve, reject) => {
 		if (userInfo.type === appConstant.STUDENT.TYPE[0]) {
 			password = userInfo.password;
 			isPasswordReset = true;
 		} else {
 			password = randomstring.generate(appConstant.USER_DETAILS.DEFAULT_PASSWORD_LENGTH);
 			isPasswordReset = false;
 		}
 		let userCredentials = {
 			username: userInfo.email,
 			password: password,
 			name: userInfo.name,
 			role: role,
 			isPasswordReset: isPasswordReset,
 			type: userInfo.type,
 			status: appConstant.USER_DETAILS.USER_STATUS[0],
 			lastLoginOn: Date.now(),
 			unqId: uniqueId(),
 			userId: userInfo._id,
 			platform:platform,
 		};

 		let user = new User(userCredentials);
 		user.save((err, userDoc) => {
 			if (err) {
 				deleteUserById(role, userInfo._id).then(successResult => {
 					logger.info(successResult.msg + " for: " + userDoc._id);
 				}, error => {
 					logger.error(error.stack || error);
 				})
 				reject(err);
 			} else {
 				logger.info(loggerConstants.USER_SAVE_SUCCESSFULLY);
 				resolve({
 					userInfo: userInfo,
 					userDetails: userDoc,
 					password: password,
 					userCredentials: userCredentials
 				});
 			}
 		})
 	});
 }

/*
 * send verification mail to register user with login id and password 
 * attach  verification link to verify register mail id 
 * userInfo- user saprate collection data object
 * userDetails- user collection object
 */
 const sendVerificationMail = (user) => {
 	let emailConditionData;
 	return new Promise((resolve, reject) => {
 		let { userInfo, userDetails, password } = user;
 		let mailConfig = mailer.getMailConfig();
    //if(appConstant.STUDENT.TYPE[1]==user.userDetails.type) {
    	if (appConstant.STUDENT.TYPE[0] != user.userDetails.type) {
    		emailConditionData = ` <p> Following is your login credentials. To enable your account, first you need to verify it. </p>
    		<b> Login id </b>: &nbsp; ${userDetails.username}<br/>
    		<b> Password </b>: &nbsp; ${password} <br/>`;
    	} else {
    		emailConditionData = ``;
    	}
    	let mailOptions = {
    		from: mailConfig.from,
    		to: userInfo.email,
    		subject: `Email verification`,
    		html: `<div>
    		Hello<strong>&nbsp;${userInfo.name}</strong>,<br/> ` + emailConditionData + ` <p> Please click on the link below to complete the verification:<br/><br/>
    		<a href="${appConstant.APIHOST}/api/users/confirmation?uId=${userDetails.unqId}">${appConstant.APIHOST}/api/users/confirmation?uId=${userDetails.unqId}</a><br/><br/>
    		If the above link can not click. Please copy the link to the browser's address bar to open it.</p>
    		<p>Regards</p>
    		<p>Team SmartPathshala</p>
    		</div>`
    	}
    	mailConfig.transporter.sendMail(mailOptions, (error, info) => {
    		if (error) {
             /* deleteUserByUserId(userInfo._id, userDetails.role).then(successResult => {
                logger.info(successResult.msg + " for: " + userInfo.userId);
              }, error => {
                logger.error(error.stack || error);
              })*/
              logger.error(error.stack || error);
              reject(new CustomError(loggerConstants.MAIL_SENDING_FAIL));
            } else {
            	return resolve(user)
            }
          });
    });
 }


/*
 * Send notification email whenever a user get registered
 */
 const sendNotificationMail = (user) => {
 	let emailConditionData;
 	return new Promise((resolve, reject) => {
 		let { userInfo, userDetails, password } = user;
 		let mailConfig = mailer.getMailConfig();
        // if(appConstant.STUDENT.TYPE[1]==user.userDetails.type) {
        	emailConditionData = ` <p> Following are new ${user.userDetails.role.toLowerCase()} registration details on ${appConstant.APPNAME}. </p>
        	<b> App </b>: &nbsp; ${appConstant.APPNAME}<br/>
        	<b> Name </b>: &nbsp; ${userInfo.name}<br/>
        	<b> Email </b>: &nbsp; ${userInfo.email}<br/>
        	<b> mobile </b>: &nbsp; ${userInfo.mobile}<br/>
        	<b> Role </b>: &nbsp; ${userDetails.role}<br/>
        	<b> Type </b>: &nbsp; ${userInfo.type}<br/>`;

        	let mailOptions = {
        		from: mailConfig.from,
        		to: mailConfig.notification.to,
        		subject: `New ${user.userDetails.role} registration details`,
        		html: `<div>
        		Hello<strong>&nbsp;${mailConfig.notification.name}</strong>,<br/> ` + emailConditionData + ` 
        		<p>Regards</p>
        		<p>Team SmartPathshala</p>
        		</div>`
        	}
        	mailConfig.transporter.sendMail(mailOptions, (error, info) => {
        		if (error) {
             /* deleteUserByUserId(userInfo._id, userDetails.role).then(successResult => {
                logger.info(successResult.msg + " for: " + userInfo.userId);
              }, error => {
                logger.error(error.stack || error);
              })*/
              logger.error(error.stack || error);
              reject(new CustomError(loggerConstants.MAIL_SENDING_FAIL));
            } else {
            	logger.info(userDetails.role + loggerConstants.REGISTER_SUCCESSFULLY);
            	resolve({ success: true, msg: loggerConstants.SEND_VERIFICATION_MAIL_SUCCESS })

              // if (appConstant.STUDENT.TYPE[0] == user.userDetails.type) {
              //   let userObj = {
              //     username: user.userInfo.email,
              //     password: user.userInfo.password
              //   }
              //   authenticationController.authenticateUser(userObj).then(success => {
              //     return resolve({ success: true, msg: loggerConstants.SEND_VERIFICATION_MAIL_SUCCESS, data: success.data })
              //   }, error => {
              //     return reject({ success: false, msg: loggerConstants.VERIFICATION_MAIL_SEND_BUT_TOKEN_NOT_PROVIDED })
              //   })
              // } else {
              //   resolve({ success: true, msg: loggerConstants.SEND_VERIFICATION_MAIL_SUCCESS })

              // }
            }
          });
        });
 }
/*
 * delete user record by userId from user collection
 * delete user details from it's saprate collection based on role 
 */
 const deleteUserByUserId = (userId, role) => {
 	return new Promise((resolve, reject) => {
 		User.deleteOne({ userId: userId }, err => {
 			if (err) {
 				reject(err);
 			} else {
 				logger.info(loggerConstants.DELETED_SUCCESSFULLY + " for: " + userId);
 				let UserSchRef = getUserModel(role);
 				UserSchRef.deleteOne({ _id: userId }, err => {
 					if (err) {
 						reject(err);
 					} else {
 						resolve({ success: true, msg: role + loggerConstants.DELETED_SUCCESSFULLY });
 					}
 				});
 			}
 		});
 	});
 }

/*
 * get user entity reference based on user role
 */
 const getUserModel = (role) => {
 	let UserSchRef;
 	switch (role) {
 		case appConstant.USER_DETAILS.USER_ROLES[0]:
 		UserSchRef = Admin;
 		break;
 		case appConstant.USER_DETAILS.USER_ROLES[1]:
 		UserSchRef = Instructor;
 		break;
 		case appConstant.USER_DETAILS.USER_ROLES[2]:
 		UserSchRef = School;
 		break;
 		case appConstant.USER_DETAILS.USER_ROLES[3]:
 		UserSchRef = Teacher;
 		break;
 		case appConstant.USER_DETAILS.USER_ROLES[4]:
 		UserSchRef = Student;
 		break;
 	}
 	return UserSchRef;
 }

/*
 * delete user by user id
 */

 const deleteUserById = (role, id) => {
 	return new Promise((resolve, reject) => {
 		let UserSchRef = getUserModel(role)
 		UserSchRef.deleteOne({ _id: id }, err => {
 			if (err) {
 				reject(err);
 			} else {
 				resolve({ success: true, msg: loggerConstants.DELETED_SUCCESSFULLY });
 			}
 		});
 	});
 }

/*
 * update last login date of user
 */
 const updateLastLoginDate = (userId) => {
 	return new Promise((resolve, reject) => {
 		User.updateOne({ userId: userId }, {
 			$set: {
 				lastLoginOn: Date.now()
 			}
 		}, (err, doc) => {
 			if (err) {
 				return reject(err);
 			}
 			resolve({ success: true, msg: loggerConstants.UPDATE_SUCCESSSFULLY });
 		});
 	});
 }

/*
* get user by user id 
*/
const getUserByUserId=(userId)=> {
	return new Promise((resolve,reject)=>{
		User.findOne({userId: userId},(err,user)=> {
			if(err){
				return reject(err);
			}
			resolve({success : true, msg : loggerConstants.GET_DATA_SUCCESSFULLY,data: user});
		});
	});
}

//send greeting mail to user
const sendGreetingMail=(userInfo)=> {
	return new Promise((resolve,reject)=> {
		let mailConfig = mailer.getMailConfig();
		let mailOptions = {
			from: mailConfig.from,
			to: userInfo.username,
			subject: `Welcome To SmartPathshala`,
		}
		let template='smartpathshala.html';
		if(appConstant.APPNAME===appConstant.APPS[1]) {
			template='codestrippers.html';
			mailOptions['subject']=`Welcome To Codestrippers`;
		}
		fs.readFile(path.resolve(__dirname, './../../resources/templates',template),'utf8',(err, htmlText)=> {
			if(err) {
				return reject(new CustomError('Mail template not found'));
			}
			mailOptions['html']=htmlText;
			mailConfig.transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					logger.error(error.stack || error);
					let schema = getUserModel(userInfo.role)
					schema.update({ email: userInfo.username },{$set: { isMailSend: false }},(err,success )=> {
						if(err) return reject(err);
						reject(error);
					})
				} else {
					logger.info(loggerConstants.GREETING_MAIL_SEND_SUCCESSFULLY+ '=> '+userInfo.username);
					let schema = getUserModel(userInfo.role)
					schema.update({ email: userInfo.username },{$set: { isMailSend: true }},(err,success )=> {
						if(err) return reject(err);
						resolve();
					})
				}
			});
		});
	});
}

//resend verification registeration mail
const resendRegistrationVerificationMail = (email)=> {
	return new Promise((resolve,reject)=> {
		findByUserName(email).then(success=> {
			if(!success['data']) {
				return reject(new CustomError(loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + ' '+ email));
			}
			let userDetails=success['data'];
			getUserModel(userDetails.role).findOne({ email: email },(err,userInfo)=> {
				if(err) return reject(err);
				if(!userInfo) {
					return reject(new CustomError(loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + ' '+ email));
				}
				let password;
				if(userInfo.type == appConstant.STUDENT.TYPE[1]) {
					password= randomstring.generate(appConstant.USER_DETAILS.DEFAULT_PASSWORD_LENGTH);
					userDetails.password = password;
					userDetails.isPasswordReset = false;
					userDetails['unqId']=uniqueId();
					new User(userDetails).save((err,data)=> {
						if(err) return reject(err);
						resendRegisterMail({userInfo: userInfo, userDetails: userDetails, password: password }).then(success=> {
							resolve(success);
						},err=>reject(new CustomError(loggerConstants.MAIL_SENDING_FAIL)));
					})
				}else {
					let unqId=uniqueId();
					userDetails['unqId']=unqId;
					User.updateOne({ _id: userDetails._id}, {
						$set: {
							unqId: unqId
						}
					},(err,data)=> {
						if(err) return reject(err);
						resendRegisterMail({userInfo: userInfo, userDetails: userDetails, password: password }).then(success=> {
							resolve(success);
						},err=> reject(new CustomError(loggerConstants.MAIL_SENDING_FAIL)));
					})
				}
			})
		},error=> {
			reject(error);
		})
	});
}

// register mail
const resendRegisterMail= user=> {
	return new Promise((resolve, reject) => {
		sendVerificationMail(user)
		.then(success => {
			resolve({ success: true, msg: loggerConstants.SEND_VERIFICATION_MAIL_SUCCESS })
		}).catch(err => {
			reject(err);
		});
	})
}

//find by user name
const findByUserName= (username)=> {
	return new Promise((resolve,reject)=> {
		User.findOne({username: username},(err,user)=> {
			if(err) {
				return reject(err);
			}
			resolve({success: true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: user})
		});
	});
}

//find by user name
const SendWelcomeMail= (userDetails)=> {
	return new Promise((resolve,reject)=> {
		let schema = getUserModel(userDetails.role)
		schema.findOne({_id: userDetails.id},(err,userInfo)=> {
			if(err) return reject(err);
			if(!userInfo || !userInfo.email) {
				return reject(new CustomError(loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + `${userDetails.id}  Role: ${userDetails.role}`));
			}
			sendGreetingMail({username: userInfo.email,role: userDetails.role}).then(success=> {
				resolve({ success: true, msg: loggerConstants.GREETING_MAIL_SEND_SUCCESSFULLY+ ' to: '+userInfo.email });
			},error=> {
				reject(new CustomError(loggerConstants.MAIL_SENDING_FAIL));
			})
		});
	});
}

//update user status
const updateUserStatus= (data, currentUser)=> {
	return new Promise((resolve,reject)=>{
		let {updateDetails,users,role} = data;
		let schema = getUserModel(role);
		schema.update({ _id: { $in: users} },{
			$set: updateDetails
		},{multi: true},(err,response)=>{
			if(err){ 
				reject(err);
			} else {
				User.update({userId: { $in : users}},{
					$set: updateDetails
				}, {multi : true},(err,response)=>{
					if(err) {
						reject(err);
					} else{
						resolve({success: true, msg: loggerConstants.USER_STATUS_SUCCESSFULLY_UPDATED});
					} 
				})
			}
		});
	});
}

const updateUserInfo=(username,userInfo,currentUser)=> {
	return new Promise((resolve,reject)=>{
		User.update({username: username},{
			$set: userInfo
		},(err,response)=>{
			if(err) {
				reject(err);
			} else{
				resolve({success: true, msg: loggerConstants.USER_NAME_SUCCESSFULLY_UPDATED});
			} 
		})
	});
}

module.exports = {
	registerNewUser: registerNewUser,
	emailVerification: emailVerification,
	changePassword : changePassword,
	resetPasswordMailVerification : resetPasswordMailVerification,
	updateStatus: updateStatus,
	saveUserDetails: saveUserDetails,
	sendVerificationMail: sendVerificationMail,
	getUserModel: getUserModel,
	deleteUserByUserId: deleteUserByUserId,
	updateLastLoginDate: updateLastLoginDate,
	getUserByUserId: getUserByUserId,
	sendGreetingMail: sendGreetingMail,
	resendRegistrationVerificationMail: resendRegistrationVerificationMail,
	SendWelcomeMail: SendWelcomeMail,
	updateUserStatus: updateUserStatus,
	updateUserInfo: updateUserInfo,
};