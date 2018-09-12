const jwt = require('jsonwebtoken');
const userModel = require('./../users/users.entity');
const userController = require('./../users/users.controller');

// const resourcesModel = require('./../resources/resources.entity');
// const navigation = require('./../resources/navigation');
const appConstant = require('../../constants/').app;
const logger = require('../../services/app.logger');
const navJson = require('../../resources/navigation');
const nodemailer = require('nodemailer');
const mailer = require('./../../services/mailer');
const uniqueId = require('uuid/v4');
const loggerConstants= require('./../../constants/logger').AUTHENTICATION;
const CustomError = require('./../../services/custom-error');

// authenticate the user with its credentials
const authenticateUser = function (req, authObj) {
	var userDetails = {
		username: authObj.username.toLowerCase(),
	};
    // find user
    let promise = new Promise((resolve, reject) => {
    	userModel.findOne(userDetails, function (err, data) {
    		if (err) {
    			logger.error( loggerConstants.INTERNAL_ERROR +' : ' + err);
    			reject({success: false, msg: err});
    		} else if (!data) {
    			logger.debug(loggerConstants.USER_DETAIL_FOUND +' : '+authObj.username);
    			reject({ success:false,
    				msg: loggerConstants.USER_DETAILS_NOT_PROVIDED
    			});
    		} else {
           // Check user status
           if(data.status==appConstant.USER_DETAILS.USER_STATUS[0]) {
                // method to compare to authenticate users
                data.comparePassword(authObj.password, function (err, isMatch) {
                	if (err) {
                		logger.error(loggerConstants.INVALID_CREDENTIAL+' : ' + err);
                		reject({success:false, msg: err});
                	} else if (isMatch) {
                    if(!data.isVerified){
                      reject({ success:false, msg:loggerConstants.PLEASE_VERIFIED_YOUR_EMAIL_ID, type: "NOT VERIFIED"});
                    }
                    //mail verification
                    let userDetails = {
                    	username: data.username,
                    	role: data.role,
                    	userId: data.userId,
                    	name :data.name
                    };
                    if(data.role==appConstant.USER_DETAILS.USER_ROLES[4])
                    {
                    	userDetails['type']=data.type;
                    }
                    let userToken;
                    if(req.headers && req.headers.platform && req.headers.platform.toLowerCase() === appConstant.PLATFORMS.MOB.toLowerCase()) {
                      userToken = jwt.sign(userDetails, appConstant.SECRET, { expiresIn: appConstant.APP_EXPIRETIME });
                    }else if(req.headers && req.headers.platform && req.headers.platform.toLowerCase() === appConstant.PLATFORMS.WEB.toLowerCase()) {
                      userToken = jwt.sign(userDetails, appConstant.SECRET, { expiresIn: appConstant.EXPIRETIME });
                    }else {
                      return reject({ success:false, msg:loggerConstants.BAD_REQUEST});
                    }
                    logger.debug(loggerConstants.USER_DETAIL_FOUND +' : '+authObj.username);
                    let userInfo={
                    	authToken: userToken,
                    	msg: 'User authenticated',
                    	userName: data.username,
                    	name:data.name,
                    	_id:data._id,
                    	userId:data.userId,
                    	role: data.role,
                      isPasswordReset: data.isPasswordReset,
                      isVerified: data.isVerified,
                    }
                    if(data.role===appConstant.USER_DETAILS.USER_ROLES[4]) {
                    	userInfo["type"]=data.type;
                    }
                    userModel.updateOne({userId: userInfo.userId},{
                      $set: {
                        lastLoginOn: Date.now()
                      }
                    },(err,doc)=> {
                      if(err){
                       reject({success:false,msg: loggerConstants.INTERNAL_ERROR});
                     }
                     resolve({success:true, msg:loggerConstants.USER_SAVE_SUCCESSFULLY, data:userInfo });
                   });
                  } else {
                   reject({success:false, msg:loggerConstants.INVALID_CREDENTIAL});
                 }
               });
              }
              else {
                logger.error(loggerConstants.INACTIVE_ACCOUNT);
                reject({success:false, msg: loggerConstants.INACTIVE_ACCOUNT});
              }
            }
          });
    });
    return promise;
  };

  // create token 
  const getToken=(userInfo,isReqFromApp=false)=> {
    if(isReqFromApp) {
      return  jwt.sign(userInfo, appConstant.SECRET, { expiresIn: appConstant.APP_EXPIRETIME });
    }else {
     return  jwt.sign(userInfo, appConstant.SECRET, { expiresIn: appConstant.EXPIRETIME });
   }
 }


// find user is already exists or not
// let checkUser = function (objEmail) {
//     let userDetails = {
//         username: objEmail,
//     };
//     return new Promise((resolve, reject) => {
//         userModel.findOne(userDetails, function (err, data) {
//             if (err) {
//                 logger.info(err);
//                 reject({
//                     err: err,
//                     msg: 'user already exist'
//                 });
//             } else {
//                 resolve(data);
//             }
//         });
//     });
// };

// validate if email expired  or not
// let verifyEmailLink = function (objVerify) {
//     let userToken = objVerify.token;
//     return new Promise((resolve, reject) => {
//         jwt.verify(userToken, appConstant.emailDetails.emailTokenSecret, function (err, decoded) {
//             if (err) {
//                 logger.error('Updated password data is not found');
//                 reject(err);
//             } else {
//                 logger.debug('Updated password data found and resolved');
//                 resolve({
//                     msg: 'Email Verified',
//                     data: decoded
//                 });
//             }
//         });
//     });
// };

// const checkOldPassword = function (resetObj) {
//     let userDetails = {
//         username: resetObj.username,
//     };
//     return new Promise((resolve, reject) => {

//         userModel.findOne(userDetails,
//             function (err, data) {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     // method to compare to authenticate users
//                     data.comparePassword(resetObj.oldPassword, function (err, isMatch) {
//                         if (err) {
//                             logger.error('Invalid Password' + err);
//                             reject({ msg: 'wrong old password', success: false });
//                         } else if (isMatch) {
//                             resolve({
//                                 msg: 'Password matched',
//                                 success: true
//                             });
//                         } else {
//                             reject({
//                                 msg: 'wrong old password',
//                                 success: false
//                             });
//                         }
//                     });
//                 }
//             });
//     });
// }

// password reset updation in database
// const resetPassword = function (resetObj) {
//     let userDetails = {
//         username: resetObj.username,
//     };
//     logger.debug('Username stored into userDetails');
//     return new Promise((resolve, reject) => {

//         userModel.findOneAndUpdate(userDetails, {
//             password: resetObj.password,
//             updatedOn: Date.now()
//         },
//             function (err, data) {
//                 if (err) {
//                     reject({success:false,error:err});
//                 } else {
//                     resolve({
//                         success:true,
//                         msg: 'Successfully Updated'
//                     });
//                 }
//             });
//     });
// };

// get nav-menus from the resource collection based on roles
let getMenus = function (role) {
	return new Promise((resolve, reject) => {
		return resolve(navJson[role]);
	});
};

/*
* verify user email id and send reset password link 
*/
let verifyEmail=(email)=> {
	return new Promise((resolve,reject)=>{
		userModel.findOne({username:email},(err,data)=>{
			if(err){
				reject(err);
			}else if(!data){
				reject(new CustomError(loggerConstants.INVALID_USER_ID +email));
			}else{
				let unqId=uniqueId();
				userModel.updateOne({username: email},{
					$set:{
						unqId: unqId
					}
				},(err,doc)=>{
					if(err){
						reject(err);
					}else if(doc){
						let mailConfig=mailer.getMailConfig();
						let mailOptions = {
							from: mailConfig.from,
							to: data.username,
							subject: `Here's the link to reset your password`,
							html:`<strong>Hi &nbsp;${data.name}</strong>,<br/><br/>
							To change your password, click the link below:<br/><br/>
							<strong><a href="${appConstant.APIHOST}/api/users/reset-password/mail-verification?uId=${unqId}">${appConstant.APIHOST}/api/users/reset-password/mail-verification?uId=${unqId}</a></strong><br/><br/>
							If the above link can not click. Please copy the link to the browser's address bar to open it.</p>
							<p>Regards<br/><br/>
							Team SmartPathshala</p>`
						}
						mailConfig.transporter.sendMail(mailOptions,(error, info)=> {
							if(error){
								logger.error(error.stack || error);
								reject(err);
							}else if(info){
								resolve({success:true, msg: loggerConstants.RESET_PASSWORD_LINK_SEND_SUCCESSFULLY})
							}
						});
					}
				})
			}
		});
	});
}

//reset password
const resetPassword= (req,userInfo)=> {
	return new Promise((resolve,reject)=> {
		let { password,confirmPassword,uId}=req.body;
		let query={'unqId': uId };
    if(userInfo){
     query={'userId': req.decoded.userId };
   }
   if(password.length<appConstant.USER_DETAILS.DEFAULT_PASSWORD_LENGTH){
     reject(new CustomError(loggerConstants.INVALID_PASSWORD_LENGTH));
   }else if(password!==confirmPassword) {
     reject(new CustomError(loggerConstants.PASSWORD_NOT_MATCHED));
   }else {
     userModel.findOne(query,(err,data)=> {
      if(err) {
       reject(err);
     }else if(!data) {
       reject(new CustomError(loggerConstants.INVALID_REQUEST));
     }else {
       data.password= password;
       data.isPasswordReset= true;
       data.unqId= "";
       let user= new userModel(data);
       user.save((err,data)=> {
        if(err){
         reject(err);
       }else if(data){
         resolve({success:true, msg: loggerConstants.PASSWORD_RESET_SUCCESSFULLY})
       }
     });
     }
   });
   }
 });
}

module.exports = {
	authenticateUser: authenticateUser,
	getMenus: getMenus,
	verifyEmail: verifyEmail,
	resetPassword: resetPassword,
	getToken: getToken
};
