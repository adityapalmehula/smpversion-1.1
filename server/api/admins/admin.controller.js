const uniqid = require('uniqid');
const admin = require('./admin.entity');
const logger = require('./../../services/app.logger');
const validation=require('./../../common/validation');
const userModel = require('./../users/users.entity');
const userCtrl = require('./../users/users.controller');
const mailer = require('./../../services/mailer');
const appConstant = require('../../constants').app;
const MAIL_CONFIG=appConstant.MAIL_CONFIG;
const uniqueId = require('uuid/v4');
const loggerConstants= require('./../../constants/logger').ADMIN;
const userController = require('./../users/users.controller');
const fileUpload = require('./../fileUpload/upload');
const BasicController = require('./../profiles/profile.controller');
const courseModel = require('./../courses/course.entity');
const topicModel = require('./../topics/topic.entity');
const mediaModel = require('./../contents/media/media.entity');
const TOKEN_PATH = './credentials.json';
const fs = require('fs');

//add admin
function register(req, res,platform) {
	let admins = req.body;
	admins['email']=admins.email.toLowerCase();
	return new Promise((resolve, reject) => {
		let ifError = validation.validationForm(admins);
		if(ifError) {
			resolve({ success: false, msg: 'field blank' });
		}else{

			userModel.findOne({"username":admins.email},function(err,user){
				if(user)
				{
					resolve({ success: false, msg: 'already exist' });
				}else{
          // User id is set to email. So disabling it.
          // let userId=uniqid.process(); //generate 12 byte unique id for admin
          // admins.userId=userId; 
          let adminObj = new admin(admins);
          adminObj.save(function(err, admin) {
          	if (err) {
          		logger.error('Failed to register admin' + err);
          		reject(err);
          	} else if(admin){
          		userController.saveUserDetails(admin,appConstant.USER_DETAILS.USER_ROLES[0],platform)
          		.then(success=> {
          			resolve(success);
          		}).catch(err=> {
          			reject(err);
          		});
          	}
          });
        }
      });
		}
	});
}


const updateProfiles= function(req,res) {
	return new Promise((resolve,reject)=>{
		userModel.find({},function(err,users){
			if(err) reject({success:false, msg:'no data found'});
			else {
        users.map((user)=>{
        	let userId = user.userId;
        	let role =user.role;
        	let usrSchema=userCtrl.getUserModel(role);
          if(usrSchema) {
          	usrSchema.findOne({_id:userId}, function(err,result){
          		if(err) {
                
              }
          		else {
          			if(result.profilePic){
          				let ext=result.extension;
          				base64('profiles',result.profilePic).then((success)=>{
          					let buff= success;
          					let obj = {
          						buff:buff,
          						mime:'image/'+ext.toLowerCase(),
          						requestType:'profiles',
          						index:0,
          						extension:ext,
          					}
          					fileUpload.uploadfile(obj).then((success)=>{
          						BasicController.uploadProfileImage(success.filename,success.extension, result._id,user.role).then((updated)=>{
          							
          						},(error)=>{
          							
          						})
          					}, (error)=>{
          						
          					})
          				}, (error)=>{
          					
          				});
          			}
          		}
          	})
          }
        })
      }
    })
	})
}

const updateCourses = function(req,res){
	return new Promise((resolve,reject)=>{
		courseModel.find({}, function(err,courses){
			if(err) reject('no course found');
			else {
				courses.map((course)=>{
					if(course.icon){
						let ext=course.iconExtension;
						base64('courses',course.icon).then((success)=>{
							let buff= success;
							let obj = {
								buff:buff,
								filename:course.icon,
								mime:'image/'+ext,
								requestType:'courses',
								index:2,
							}
							fileUpload.uploadfile(obj).then((successfully)=>{
								if(successfully.success){
									courseModel.updateOne({_id:course._id},{
										$set : {
											icon:successfully.filename,
											iconExtension:successfully.extension
										}
									},function(err,success){
										if(err) reject(err);
										else {
											resolve(success);
										}
									})
								}
							}, (error)=>{
								
							});
						}, (error)=>{
							
						})

					}
				})
			}
		})
	})
}

const base64 = (folderName, icon)=>{
	return new Promise((resolve,reject)=>{
		var bitmap = fs.readFileSync('server/uploads/'+folderName+'/'+icon);
		let buff= new Buffer(bitmap,'base64');
		if(buff){
			resolve(buff);
		} else {
			reject('file not converted into base64');
		}
	})
}

const updateMedia = function(req,res){
	return new Promise((resolve,reject)=>{
		mediaModel.find({}, function(err,media){
			if(err) reject('no Media found');
			else {
				media.map((data)=>{
					if(data.path){
						let ext=data.extension;
						let mime;
						if(ext=='pdf') {
							mime='application/pdf'
						} else {
							mime = 'image/'+ext
						}

						base64('media',data.path).then((success)=>{
							let buff= success;
							let obj = {
								buff:buff,
								mime:mime,
								requestType:'media',
								index:1,
								extension:ext,
							}

							fileUpload.uploadfile(obj).then((successfully)=>{
								if(successfully.success){
									mediaModel.updateOne({_id:data._id},{
										$set : {
											path:successfully.filename,
											extension:successfully.extension
										}
									},function(err,success){
										if(err) reject(err);
										else {
											resolve(success);
										}
									})
								}
							}, (error)=>{
								
							});
						}, (error)=>{
							
						})
					}
				})
			}
		})
	})
}


const textBook = function(req,res){
	return new Promise((resolve,reject)=>{
		topicModel.find({}, function(err,solution){
			if(err) reject('no Solution found');
			else {
				solution.slice(200,300).map((data, index)=>{
					if(data.solutions[0]) {
						let filewithExt=data.solutions[0].path.split('.')[1];
						if(!filewithExt) {
							if(data.solutions.length>0){
								let ext=data.solutions[0].extension;
								let	mime='application/pdf'
								base64('textbooksolutions',data.solutions[0].path).then((success)=>{
									let buff= success;
									let obj = {
										buff: buff,
										mime:mime,
										requestType:'textbooksolutions',
										index:3,
										extension:ext,
									}
									fileUpload.uploadfile(obj).then((successfully)=>{
										if(successfully.success){
											topicModel.update({'solutions._id': data.solutions[0]._id}, {
												'$set': {
													'solutions.$.path':successfully.filename,
													'solutions.$.extension':successfully.extension
												}
											},function(err,success){
												if(err) reject(err);
												else {
													resolve(success);
												}
											})
										}
									}, (error)=>{

									});
								}, (error)=>{
									
								});
							}
						}
					}
				})
			}
		})
	})
}

const getFiles=()=>{

	return new Promise((resolve,reject)=>{
		mediaModel.findOne({}, function(err,data){
			if(err) reject('no Media found');
			else {
				fileUpload.upload(data).then((success)=>{
					
				},(error)=>{
					
				})
			}
		})
	})
}
// //get all instructor data
// const findAll=function(){
//   return new Promise((resolve,reject)=>{
//     instructor.find({},function(err,instructorData){
//       if (err) {
//         logger.error('No instructor data available !' + err);
//         reject(err);
//       } else {
//         resolve(instructorData);
//       }
//     });
//   });

// };

//get admin data based on mongo id
function findById(_id){
  return new Promise((resolve,reject)=>{
    admin.findOne({'_id': _id },'name email mobile profilePic gender address profileUrls academicDetails',(err,data)=>{
      if(err){
       logger.error(err.message)
       reject({ msg:loggerConstants.INTERNAL_ERROR_OCCURED});
     }else if(!data){
      logger.error({ success:false, msg: loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + _id})
      reject({ success:false, msg: loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + _id})
    }else{
      logger.info({success:true, msg: loggerConstants.DATA_GET_SUCCESSFULLY})
      resolve({success:true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: data})
    }
  });
  });
}


// // update instructor data
// const update=function(instructorObj,_id){
//   return new Promise((resolve,reject)=>{
//    let ifError = validation.validationForm(instructorObj);
//    if(ifError) {
//     resolve({ success: false, msg: 'field blank' });
//   }else{

//     instructor.updateOne({_id:_id},
//     {
//       $set:{
//         name:instructorObj.name,
//         email:instructorObj.email,
//         phoneNo:instructorObj.phoneNo,
//         gender:instructorObj.gender,
//         updatedOn:Date.now()
//       }
//     },function(err,instructorData) {
//       if(err) {
//         logger.error('instructor data not updated !' + err);
//         reject(err);
//       } else {
//         resolve({success : true, msg : 'instructor data updated successfully !'});
//       } 
//     });
//   }
// });
// };

// // Delete  instructor data 
// const deleteRecord =function(_id){
//   return new Promise((resolve,reject)=>{
//     instructor.deleteOne({_id:_id},function(err,instructorData){
//       if (err) {
//         logger.error('No instructor data available for this id ' + err);
//         reject(err);
//       } else {
//         resolve({success : true, msg : 'instructor data deleted successfully'});
//       }
//     });
//   });
// }
module.exports = {
	register: register,
	updateProfiles: updateProfiles,
	updateCourses: updateCourses,
	updateMedia: updateMedia,
	textBook : textBook,
	getFiles: getFiles,
	base64: base64,
  findById:findById
  // findAll:findAll,
  
  // update:update,
  // deleteRecord:deleteRecord
}
