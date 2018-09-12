const Assessment = require('./assessment.entity');
const logger = require('./../../services/app.logger');
const Question = require('./../questions/question.entity');
const questionController = require('./../questions/question.controller');
const loggerConstants= require('./../../constants/logger').ASSESSMENT;
const courseController = require('./../courses/course.controller');
const CustomError = require('./../../services/custom-error');
const constants = require('./../../constants/app');
const Config= require('./../../config/commonConfig');
const AssessmentResult = require('./../assessmentResults/assessmentResult.entity');
const { getQuery }= require('./../../services/filter');

//convert time in sconds
const getTimeInSeconds=(maxTime)=> {
  let seconds=0;
  if(maxTime) {
    let timeArr= maxTime.split(":");
    seconds += timeArr[0] ? parseInt(timeArr[0]*60*60) : 0;
    seconds += timeArr[1] ? parseInt(timeArr[1]*60) : 0;
  }
  return seconds;
}

//persist assessment
const save = (data,userInfo)=> {
  return new Promise(async(resolve,reject)=> {
    try {
      //let courseInfo = await courseController.getCourseInfo(data.courseId,'createdBy')
      //if(!courseInfo) return reject(new CustomError(loggerConstants.BAD_REQUEST));
      let authorizeRoles=constants.USER_DETAILS.USER_ROLES.slice(0,4);
      if(authorizeRoles.indexOf(userInfo['role']) != -1) {
        data['createdBy']= {'id': userInfo.userId, 'role': userInfo.role };
        let total=data.questions.reduce((prvQus,curQus)=>{return { marks:prvQus.marks+curQus.marks }});
        data['totalMarks']=total.marks;
        data['maxTime']= getTimeInSeconds(data['maxTime']);
        if(userInfo['role'] && userInfo['role'] === constants.USER_DETAILS.USER_ROLES[1]) {
          data['createdBy']['name']=constants.DEFAULT_NAME_FOR_BACKEND_USER;
        }else {
          data['createdBy']['name']=userInfo['name'];
        }
        if(userInfo['role'] === constants.USER_DETAILS.USER_ROLES[2]) {
          data['schoolId']=userInfo['userId'];
        }else if(userInfo['role'] === constants.USER_DETAILS.USER_ROLES[3]) {
         let teacher = await Teacher.findOne({_id: userInfo['userId']},'schoolId');
         if(teacher && teacher['schoolId']) {
          data['schoolId']=teacher['schoolId'];
        }else {
          logger.error(loggerConstants.TEACHER_NOT_FOUND+ ' : '+userInfo['userId']);
          reject(new Error(loggerConstants.INTERNAL_ERROR));
        }
      }
      data['status']=constants.CONTENT_STATUS[2];
      //data['visibility']=constants.QUESTION_VISIBILITY[0];
      const assessmentObj = new Assessment(data);
      assessmentObj.save((err, assessment)=> {
       if(err) {
        logger.error(err);
        reject({ msg: loggerConstants.INTERNAL_ERROR});
      }else if(assessment) {
        resolve({success:true, msg: loggerConstants.SAVE_SUCCESSFULLY});
      }else {
        reject({ msg: loggerConstants.FAILED_TO_SAVE});
      }
    });
    } else {
      reject(new CustomError(loggerConstants.NO_RIGHTS));
    }
  }catch(err) {
    return reject(err)
  }
});
}

//update assessment details
const updateAssessmentInfo =(id,assessmentDetails,userInfo) => {
  return new Promise(async(resolve,reject) => {
   try {
    let assessment_info = await getAssessmentInfo(id,'createdBy schoolId');
    if(!assessment_info) return reject(new CustomError(loggerConstants.BAD_REQUEST));
    if(userInfo['userId'] == assessment_info.createdBy.id || userInfo['role'] === constants.USER_DETAILS.USER_ROLES[0] || userInfo['userId'] == assessment_info.schoolId) {
      let total=assessmentDetails.questions.reduce((prvQus,curQus)=>{
        return { marks:prvQus.marks+curQus.marks }
      });
      let assessmentInfo = {
        courseId: assessmentDetails.courseId,
        assessment: assessmentDetails.assessment,
        type: assessmentDetails.type,
        level: assessmentDetails.level,
        passPercentage: assessmentDetails.passPercentage,
        maxTime: getTimeInSeconds(assessmentDetails.maxTime),
        insAtStart: assessmentDetails.insAtStart,
        insAtTheEnd: assessmentDetails.insAtTheEnd,
        maxAttempts: assessmentDetails.maxAttempts,
        tags: assessmentDetails.tags,
        totalQuestion: assessmentDetails.totalQuestion,
        status: assessmentDetails.status,
        totalMarks: total.marks,
        questions: assessmentDetails.questions,
        subTopics: assessmentDetails.subTopics,
        topics: assessmentDetails.topics,
        showScoreAt: assessmentDetails.showScoreAt,
        showFeedbackAt: assessmentDetails.showFeedbackAt,
        shuffleAns: assessmentDetails.shuffleAns,
      }
      if(assessmentDetails['visibility']) {
        assessmentInfo['visibility']=assessmentDetails['visibility'];
      }
      if(assessmentDetails['beginDate']) {
        assessmentInfo['beginDate']=assessmentDetails['beginDate'];
      }
      if(assessmentDetails['expireDate']) {
        assessmentInfo['expireDate']=assessmentDetails['expireDate'];
      }
      Assessment.findOneAndUpdate({_id: id },{
        $push: {
         updatedBy: {
           id: userInfo.userId,
           role: userInfo.role,
           name: userInfo.name,
           date: Date.now()
         }
       },
       $set: assessmentInfo
     },(err,data)=> {
      if(err) return reject(err);
      resolve({ success: true, msg: loggerConstants.UPDATE_SUCCESSSFULLY});
    });
    }else {
      reject(new CustomError(loggerConstants.NO_RIGHTS));
    }
  }catch(err) {
    reject(err);
  }
});
}

//get assessment info
const getAssessmentInfo = (id,fields=null) => Assessment.findOne({_id: id}).select(fields);


// update assessment status deleted by assessment id
const deleteById=(assessmentId,userInfo) => {
  return new Promise(async(resolve,reject) => {
   try {
    let assessmentDetails = await getAssessmentInfo(assessmentId,'createdBy');
    if(!assessmentDetails) {
      return reject(new CustomError(loggerConstants.BAD_REQUEST));
    }
    if(userInfo['userId'] == questionDetails.createdBy.id || userInfo['role'] === constants.USER_DETAILS.USER_ROLES[0] || userInfo['userId']==questionDetails.schoolId) {
      Assessment.updateOne({_id:assessmentId },{
        $set : {
          status: constants.CONTENT_STATUS[5],
          deletedBy:{
            id: userInfo.userId,
            role: userInfo.role,
            name: userInfo.name,
            date: Date.now()
          }
        }
      },(err,data) => {
        if(err) return reject(err);
        resolve({success:true, msg:"Successfully deleted"});
      });
    }else {
      reject(new CustomError(loggerConstants.NO_RIGHTS));
    }
  }catch(err) {
    reject(err);
  }
})
}
//apply role based validation while fetching questions
const getRoleBaseQuery=(query, userInfo)=> {
  let roles=constants.USER_DETAILS.USER_ROLES;
  let modifiedQuery=query;
  if(userInfo['role']) {
    if(userInfo['role']==roles[2]) {
     modifiedQuery={ 
      $and : [{ $or : [{"visibility" : constants.QUESTION_VISIBILITY[0]}, { schoolId : userInfo['userId']} ]  },query ] 
    };
  }

  if(userInfo['role'] === roles[3]) {
   modifiedQuery={ 
    $and : [{ $or : [{"visibility" : constants.QUESTION_VISIBILITY[0]}, { 'createdBy.id' : userInfo['userId']} ]  },query ] 
  };
}
}
return modifiedQuery;
}

// fetch assessments based on topicId
const getAssessments=(queryParams,userInfo)=> {
  return new Promise(async(resolve,reject)=> {
    let roles=constants.USER_DETAILS.USER_ROLES;
    let filterParams=getQuery(queryParams);
    let query= filterParams['$where'] || {};
    let limit= +filterParams['$limit'] || 0;
    let skip= +filterParams['$skip'] || 0;
    let sort= filterParams['$orderby'] || { 'createdBy.date': -1 };
    query['status']={ $ne: constants.CONTENT_STATUS[5] };
    let fields='';
    if(userInfo['role'] == constants.USER_DETAILS.USER_ROLES[4]) {
      fields='assessment type level totalQuestion totalMarks passPercentage';
    }
    let assementStatus=null;
    try {
      if(query.hasOwnProperty('assementStatus')){
        assementStatus=query['assementStatus'];
        delete query['assementStatus'];
      }
      let totalCount = await Assessment.find(getRoleBaseQuery(query, userInfo)).count();
      Assessment.find(getRoleBaseQuery(query, userInfo))
      .select(fields)
      //.skip(skip).limit(limit)
      .sort(sort).exec(async(err,assessments)=> {
       if(err) return reject(err);
       try {
        query['studentId']=userInfo.userId;
        query['assessmentStatus']="Finish";
        let results = await AssessmentResult.find(query,'assessmentId score');
        if(results) {
          let assessmentWithResults=[];
          assessments.forEach(assessment=> {
           let assessmentInfo=assessment.toObject();
           let assessmentResults=results.filter(res=> res.assessmentId.toString()==assessment._id.toString());
           if(assementStatus==1) {
            if(assessmentResults.length) {
              assessmentInfo['results']=assessmentResults;
              assessmentWithResults.push(assessmentInfo);
            }
          }else if(assementStatus==0) {
           if(assessmentResults.length==0) {
            assessmentInfo['results']=assessmentResults;
            assessmentWithResults.push(assessmentInfo);
          }
        }else {
          assessmentInfo['results']=assessmentResults;
          assessmentWithResults.push(assessmentInfo);
        }
      });
          totalCount=assessmentWithResults.length;
          assessments=assessmentWithResults.slice(skip, skip + limit);;
        }
        resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessments, totalCount})
      }catch(err) {
        reject(err);
      }
    })
    }catch(err) {
     reject(err);
   }
 });
}

/*// fetch assessments based on topicId
const getAssessmentsByTopicId=(topicId)=> {
  return new Promise((resolve,reject)=> {
    Assessment.find({ 'topicId':topicId,status: { $ne: constants.CONTENT_STATUS[5]} },(err,assessments)=> {
     if(err) {
      logger.error(err);
      reject({ msg: loggerConstants.INTERNAL_ERROR});
    }else {
      resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessments})
    }
  })
  });
}*/


//get assessment by assessment id
const getAssessmentsById=(id)=> {
  return new Promise((resolve,reject)=>{
    Assessment.findOne({ '_id': id,status: { $ne: constants.CONTENT_STATUS[5]}},(err,assessment)=> {
     if(err) return reject({ msg: loggerConstants.INTERNAL_ERROR});
     resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessment})
   });
  });
}

//get assessment by id -without answers
const getAssessmentsWithoutAns=(id)=> {
 return new Promise((resolve,reject)=> {
  Assessment.findOne({_id: id,status: { $ne: constants.CONTENT_STATUS[5]}},(err,assessment)=> {
    if(err) {
      return reject(err);
    }else if(assessment && assessment.questions) {
      let qusWithOutAns = assessment.questions.map(ele=> {
        let qus = {};
        qus['qusId'] = ele['qusId'];
        qus['question'] = ele['question'];
        qus['qusType'] = ele['qusType'];
        qus['options'] = ele['options'];
        return qus;
      });
      assessment['questions']= qusWithOutAns;
      resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessment})
    }
  });
});
}

/*const findAssessment=function(id){
 return new Promise((resolve,reject)=>{
  Assessment.findOne({ '_id': id,status: { $ne: constants.CONTENT_STATUS[5]} },function(err,assessment){
    if (err) {
      logger.error('Error' + err);
      reject(err);
    } else {
     logger.info('Get quiz data successfully and return back to router');
     resolve(assessment);
   }
 });
});
}*/

/*const quizSubmit=function(quizObj){
	return new Promise((resolve,reject)=>{
   student.updateOne({studentId:'123456'},
   {
    $push:{quizes:quizObj}
  },

  function(err,data){
   if (err) {
    logger.error('Student Not Get any data' + err);
  } else {
   resolve({success:'ok', message:'quiz successfully saved'});
 }
});
 });
};*/

const quizResult=(studentId)=> {
	let correctAnswer=0;
	let attempedQuestion=0;
	let incorrectAnswer=0;
	let unattempedQuestion=0;
	let quizOutput={};

	return new Promise((resolve,reject)=>{
   student.findOne({studentId:studentId},
     function(err,data){
       if (err) {
        logger.error('Student Not Get any data' + err);
      } else {
        let quizRes=[];
        data.quizes.map((quizData,i)=>{
          let quizObj=data.quizes[i];
          Assessment.find({_id:quizObj.quizId},function(err,data){
            if(data)
            {
              data.map((currentElement,index)=>{
               if(data[index]._id==quizObj.answers[index]._id)
               {
                 let userAnswer=quizObj.answers[index].userAnswer;
                 let answer=data[index].basicLevelQuestion;
                 let finalAnswer=userAnswer.length==answer.length && userAnswer.every(function(element,index3){
                   return element===answer[index3];
                 });
                 if(finalAnswer)
                 {
                  correctAnswer++;
                }
                if(quizObj.answers[index].attemped=='attemped') {
                  attempedQuestion++
                } else {
                  unattempedQuestion++;
                }
                incorrectAnswer=attempedQuestion-correctAnswer;
              }
            });
              quizOutput={totalQuestion:attempedQuestion+unattempedQuestion,correctAnswer:correctAnswer,incorrectAnswer:incorrectAnswer,attempedQuestion:attempedQuestion,unattempedQuestion:unattempedQuestion};
              quizRes.push(quizOutput);
              attempedQuestion='';
              unattempedQuestion='';
              correctAnswer='';
              incorrectAnswer='';
            }
            resolve(quizRes);
          });
        });
      }
    });
 });
}


/*const insertStudent=function(assessmentData){

	var student123={
		studentId:assessmentData.studentId
	}
  let stud=new student(student123);
  return new Promise((resolve,reject)=>{

    stud.save(function(err,data){
     if(data)
     {
     // console.log('successfully saved');
   }
   else
   {
     // console.log(err);
   }
 })
  });
};
*/

//get all quizzes
const getQuizzes=function(){
  return new Promise((resolve,reject)=>{
    Assessment.find({status: { $ne: constants.CONTENT_STATUS[5]}},function(err,quizzes){
      if (err) {
        logger.error('No quiz data available !' + err);
        reject(err);
      } else {
        logger.info('Get quizzes successfully and return back to router');
        resolve(quizzes);
      }
    });
  });
}

// get assessment by subtopic id
const getAssessmentsBySubTopicId=(subTopicId)=> {
  return new Promise((resolve,reject)=> {
    Assessment.find({ 'subTopics': { $in: [subTopicId ]},type : "Practice",status: { $ne: constants.CONTENT_STATUS[5]}},(err,assessments)=> {
      if(err) {
        return reject(err);
      }
      resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessments})
    })
  });
}

//generate practice test
const generatePracticeTest= (data,queryParams,userInfo) => {
  return new Promise((resolve,reject)=> {
    questionController.getQuestions(queryParams,true,userInfo).then(success=> {
      if(success && success.data && success.data.length>0) {
        let questions=success.data;
        questions.forEach(q=> {
          if(q.level== Config.QUESTION_LEVELS[0]) {
            q['marks']=Config.QUESTION_LEVELS_MARKS[0];
          }else if(q.level== Config.QUESTION_LEVELS[1]) {
            q['marks']=Config.QUESTION_LEVELS_MARKS[1];
          }else if(q.level== Config.QUESTION_LEVELS[2]) {
           q['marks']=Config.QUESTION_LEVELS_MARKS[2];
         }
         q['qusId']=q._id;
       });
        let total=questions.reduce((prvQus,curQus)=>({ marks:prvQus.marks+curQus.marks}));
        let assessmentDetails= {
          questions: questions,
          assessment: constants.ASSESSMENT_TYPE[2],
          type: constants.ASSESSMENT_TYPE[2],
          totalMarks: total.marks,
          courseId: data['courseId'],
          level : data['level'],
          status: constants.STATUS.ACTIVE,
          shuffleAns: Config.SHUFFLE_ANSWERS[1],
          insAtStart: Config.INSTRUCTIONS_AT_START,
          insAtTheEnd: Config.INSTRUCTIONS_AT_THE_END,
          passPercentage: Config.DEFAULT_PASS_PERCENTAGE,
          showFeedbackAt: Config.SHOW_FEEDBACK_AT[0],
          showScoreAt: Config.SHOW_SCORE_AT[0],
          maxAttempts: Config.MAX_ATTEMPTS[1],
          totalQuestion: questions.length, 
          createdBy: {'id': userInfo.userId, 'role': userInfo.role }
        }
        assessmentDetails['topics']= questions.map(q=> q.topicId);
        assessmentDetails['subTopics']= questions.map(q=> q.subTopicId);
        const assessmentObj = new Assessment(assessmentDetails);
        assessmentObj.save((err, assessment)=> {
         if(err) return reject(err);
         resolve({success:true, msg: loggerConstants.SAVE_SUCCESSFULLY, data: {assessmentId: assessment._id}})
       });
      }else {
        return reject(new CustomError(loggerConstants.NO_QUESTION_FOUND));
      }
    }).catch(error=> {
      reject(error);
    })
  });
}


module.exports = {
  save : save,
  getAssessmentsBySubTopicId: getAssessmentsBySubTopicId,
  getAssessmentsWithoutAns: getAssessmentsWithoutAns,
  getQuizzes : getQuizzes,
  getAssessmentsById: getAssessmentsById,
 // getAssessmentsByTopicId: getAssessmentsByTopicId,
 getAssessments: getAssessments,
 updateAssessmentInfo: updateAssessmentInfo,
 deleteById: deleteById,
 getAssessmentInfo: getAssessmentInfo,
 generatePracticeTest: generatePracticeTest,
}
