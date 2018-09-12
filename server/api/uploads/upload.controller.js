const userModel = require('../users/users.entity');
const studentModel = require('../students/student.entity');
const studentController= require('./../students/student.controller');
const logger = require('../../services/app.logger');
const appConstant = require('../../constants').app;
const fs = require('fs');
const readLine = require('readline');

//Save new student's details
const saveStudents = function(filename) {
  return new Promise((resolve, reject) => {		
   let isHeader = false;
   const rl = readLine.createInterface({
    input: fs.createReadStream(filename)
  });
   rl.on('line', function(line) {
    if (isHeader) {
      isHeader = true;
    } else {
      let stuInfo = line.toString().split(',');

      let persistObj=createPersistanceObject(stuInfo);

      let userData = new userModel(persistObj.user);
      let studentData = new studentModel(persistObj.student);

      studentController.getAssignCourseByClass(studentData.schoolId,studentData.class).then(resultObj=>{

        if(resultObj){
          studentData.courses=resultObj.courses;
        }

        // insert the data into db using promise
        studentData.save(function(err, stuInfo) {
          if (err) {
            logger.error('student Data not added sucessfully' + err);
            reject(err);
          } else if(stuInfo) {
            let userId=stuInfo._id;
            userData.userId=userId;
            userData.save(function(err, data) {
              if (err) {
                logger.error('userData not added sucessfully' + err);
                reject(err);
              } else {
                resolve({ success: true, msg: ' Successfully Registered' });
              }
            });
          }
        });

      },error=>{
        logger.error('Error' + error);
      });
                
                // logger.debug('Get userObj and store into userDetails', userObj);
               // persistStudent(stuInfo);
             }
           }).on('close', () => {
            resolve({ success: true, msg: ' Successfully Registered' });
          });
         });
};


function persistStudent(stuInfo){

}

//create objects 
function createPersistanceObject(student, createdBy){
  let persistObj={};
  let studentDetails = {
    schoolId: student.schoolId,
    class: student.class,
    name: student.name,
    email: student.email, 
    mobile: student.mobile,
    gender: student.gender,
    status: student.status,
    createdBy : createdBy
  };
  let studentCredentials = {
    username: student.email,
    password: appConstant.USER_DETAILS.DEFAULT_PASSWORD,
    name : student.name,
    role: appConstant.USER_DETAILS.USER_ROLES[4],
    type : student.type,
    status: appConstant.USER_DETAILS.USER_STATUS[0], //Status=Active
    lastLoginOn: Date.now(),
  };
  persistObj.user=studentCredentials;
  persistObj.student=studentDetails;

  return persistObj;
}

module.exports = {
  saveStudents: saveStudents,
  persistStudent: persistStudent,
};
