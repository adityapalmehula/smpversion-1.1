const ClassModal = require('./class.entity');
const constant = require('../../constants').app;
const logger = require('./../../services/app.logger');
const { getQuery }= require('./../../services/filter');
const CustomError = require('./../../services/custom-error');
const loggerConstants= require('./../../constants/logger').CLASSES;
const Teacher = require("./../teachers/teacher.entity");
const _ = require('lodash');

//get all classess based on school id
const getClassesBySchoolId=  (schoolId)=> {
  return new Promise(async(resolve,reject)=> {
    try {
      let classes = await ClassModal.find({schoolId: schoolId})
      resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY,data: classes || []});
    } catch(err) {
      reject(err)
    }
  });
}

//assign courses to class
const assignCourses=  (classId,data,currentUser)=> {
  return new Promise((resolve,reject)=> {
    let update={subjects: data.courses};

   /* if(data.sections) {
      update: data.sections,
    }*/
    if(data.teachers) {
      update['teachers']=data.teachers;
    }
    ClassModal.update({_id: classId}, {
      $push: {
       updatedBy: {
         id: currentUser.userId,
         role: currentUser.role,
         name: currentUser.name,
         date: Date.now()
       }
     },
     $set : update
   },(err,teacher)=>{
    if(err) return reject(err);
    resolve({success : true, msg : loggerConstants.UPDATE_SUCCESSSFULLY});
  });
  });
}

module.exports = {
  getClassesBySchoolId: getClassesBySchoolId,
  assignCourses: assignCourses,
}