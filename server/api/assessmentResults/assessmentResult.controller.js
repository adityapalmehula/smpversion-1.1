const _ = require('lodash');
const AssessmentResult = require('./assessmentResult.entity');
const logger = require('./../../services/app.logger');
const Student = require('./../students/student.entity');
const { getAssessmentsById } = require('./../assessments/assessment.controller');
const loggerConstants= require('./../../constants/logger').ASSESSMENT_RESULT;
const releaseCourseController = require('./../releaseCourses/releaseCourse.controller');
const assessmentController = require('./../assessments/assessment.controller');
const appConstants= require('./../../constants/app');
const CustomError = require('./../../services/custom-error');

//calculate percent
const calulatePercentage=(score,maxMarks)=>(Math.round((score*100)/maxMarks));

//get assessment info
const getAssessmentDetails = (assessmnetId,userInfo,query) => {
  return new Promise(async(resolve,reject)=> {
    try {
      let isAttamptLimitExceed=false,fields='insAtStart maxAttempts';
      if(query=="q1") fields='maxAttempts';
      let assessment_info = await assessmentController.getAssessmentInfo(assessmnetId,fields);
      if(!assessment_info) {
        logger.error(loggerConstants.ASSESSMENT_NOT_FOUND);
        return reject({success: false, msg: loggerConstants.ASSESSMENT_NOT_FOUND})
      }
      let userTotalAttampts = await AssessmentResult.find({assessmentId: assessmnetId,studentId: userInfo.userId,assessmentStatus: "Finish"}).count();
      if(assessment_info.maxAttempts != 'Infinite' && assessment_info.maxAttempts <= userTotalAttampts) {
        isAttamptLimitExceed=true;
        return resolve({success:true, msg: loggerConstants.EXCEED_ATTEMPTS_LIMIT, data: {isAttamptLimitExceed: true}});
      }
      assessment_info['isAttamptLimitExceed']=isAttamptLimitExceed;
      resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessment_info});
    }catch(error) {
      reject(error);
    }
  });
}

/*
* submit assessment result
*/
function save(data,userInfo) {
  return new Promise((resolve,reject)=> {
    let filter= {
      assessmentId: data['_id'],
      studentId: userInfo.userId,
      assessmentStatus: "Paused"
    }
    getStudentAssessmentResults(null,null,filter)
    .then(async success=> {
      if(!success['data'].length) {
        try {
          let assessment_info = await assessmentController.getAssessmentInfo(data['_id']);
          if(!assessment_info) {
            logger.error(loggerConstants.ASSESSMENT_NOT_FOUND);
            return reject({success: false, msg: loggerConstants.ASSESSMENT_NOT_FOUND})
          }
          let userTotalAttampts = await AssessmentResult.find({assessmentId: data['_id'],studentId: userInfo.userId}).count();
          if(assessment_info.maxAttempts <= userTotalAttampts) {
            return reject(new CustomError(loggerConstants.EXCEED_ATTEMPTS_LIMIT));
          }
          persistAssessmentResult(assessment_info.toObject(),userInfo)
          .then(success=> {
           updateStudent(success['data'])
           .then(successResult=> {
            resolve({success:true, msg: loggerConstants.SAVE_SUCCESSFULLY, data: success['data']});
          });
         }).catch(error=> {
          reject(error);
        })
       }catch(err) {
        reject(err);
      }
    }else {
      resolve({success:true,msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: success['data'][0] });
    }
  }); 
  });
}

//persist practice set details
const persistPracticeDetails = (data,userInfo)=> {
  return new Promise((resolve,reject)=> {
    let assessmentId = data['assessmentId'], courseId = data['courseId'], courseVersion = data['courseVersion'];
    let filter= {assessmentId: assessmentId,studentId: userInfo.userId,assessmentStatus: "Paused"};
    getStudentAssessmentResults(null,null,filter).then(response=> {
      if(!response['data'].length) {
        releaseCourseController.findCourseByVersion(courseId,courseVersion).then(course=> {
         if(course) {
          let assessment=findPracticsSet(course,assessmentId);
          if(!assessment) return reject({success: false, msg: loggerConstants.ASSESSMENT_NOT_FOUND_IN_ASSIGN_COURSE});
          persistAssessmentResult(assessment,userInfo).then(success=> {
           updateStudent(success['data'])
           .then(successResult=> {
            resolve({success:true, msg: loggerConstants.SAVE_SUCCESSFULLY, data: success['data']});
          });
         }).catch(error=> {
          reject(error);
        })
       }else {
        return reject({success: false, msg: loggerConstants.NO_ASSIGN_COURSE_FOUND});
      }
    },error=> reject(error));
      }else {
        let data = response['data'][0];
        let assessmentWithoutAns=response['data'][0]
        if(data.questions) {
          assessmentWithoutAns['questions'] = data.questions.map(ele=> {
            let qus=ele.toObject();
            delete qus.answers;
            delete qus.solution;
            return qus;
          })
        }
        resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessmentWithoutAns });
      }
    }); 
  });
}

//find practice set in course object
const findPracticsSet= (course, assessmentId)=> {
 let assessment=null;
 topicLoop: for (let topic of course.topics) {
  for (let subtopic of topic.subtopics) {
    let learningPath = subtopic.learningPaths.find(lp=> {
      if(lp.mainContent && lp.mainContent.contentId && lp.mainContent.contentId._id) {
        return lp.mainContent.contentId._id == assessmentId;
      }
    });
    if(learningPath) {
      assessment=learningPath.mainContent.contentId;
      break topicLoop;
    }
  }
}
return assessment;
} 

/*
* persist assessment result 
*/
const persistAssessmentResult = (data,userInfo)=> {
  return new Promise((resolve,reject)=> {
    data['assessmentId']=data['_id'];
    delete data['_id'];
    data['studentId']=userInfo.userId;
    data['createdBy']= {'id': userInfo.userId, 'role': userInfo.role };
    data['timeTaken']=0;   
    let assessmentResult= new AssessmentResult(data);
    assessmentResult.save((err, assessmentResult)=> {
      if(err) return reject(err);
      resolve({ success:true, msg: loggerConstants.SAVE_SUCCESSFULLY, data: assessmentResult});
    });
  });
}

// find assessment result by  assessment id
const findByAssessmentId=(assessmentId)=> {
 return new Promise((resolve,reject)=>{
  AssessmentResult.find({ 'assessmentId': assessmentId })
  .populate('studentId',['firstName','lastName','class'])
  .sort([['creationDate', -1]])
  .exec((err,assessmentResults)=> {
    if(err) {
      logger.error(err);
      reject({ msg: loggerConstants.INTERNAL_ERROR});
    } else {
      resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessmentResults});
    }
  });
});
};

//find student assessment results
const findById=(_id)=> {
 return new Promise((resolve,reject)=> {
  AssessmentResult.findOne({ '_id': _id })
  .exec((err,assessmentResults)=> {
    if(err) {
     return reject(err);
   }
   resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessmentResults});
 });
});
};

//update assessment id in student collection 
const updateStudent=(assessmentResult)=> {
  return new Promise((resolve,reject)=>{
    if(assessmentResult.studentId && assessmentResult.assessmentId) {
     let assessmentObj={ assessmentId: assessmentResult.assessmentId};
     Student.updateOne({_id: assessmentResult.studentId}, {
      $push:{
        assessments: assessmentObj
      }
    },(err,data)=> {
      if(err) {
       return reject(err);
     }
     resolve({success:true, msg: loggerConstants.SAVE_SUCCESSFULLY});
   })
   }else {
    reject(new Error(loggerConstants.MISSING_EXPECTED_INPUT));
  }
})
}

//get assessment result based on student id and assessment id
const getStudentAssessmentResults=(assessmentId,userInfo,query=null)=> {
  return new Promise((resolve,reject)=> {
    if(!query) {
      query= {
        'studentId': userInfo.userId,
        'assessmentId': assessmentId,
        'assessmentStatus': 'Finish'
      }
    }
    AssessmentResult.find(query,(err,resultDetails)=> {
      if(err) {
        logger.error(err);
        reject({ msg: loggerConstants.INTERNAL_ERROR});
      }else {
        resolve({msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: resultDetails});
      }
    })
  })
}

/*
* update assessment results based on user answer
*/
const update= (assessmentResult,id,userInfo)=> {
  return new Promise((resolve,reject)=> {
    findById(id).then(success=> {
      let result=success['data'];
      let qusIndex=result.questions.findIndex(ele=> ele.qusId == assessmentResult.qusId);
      let qusToUpdate={
        'questions.$.userAnswers': assessmentResult['userAnswers'],
        'questions.$.status': assessmentResult['status'],
        'updatedBy': {'id': userInfo.userId, 'role': userInfo.role }
      }
      if(++qusIndex>result.lastSaveQuestion) {
        qusToUpdate['lastSaveQuestion']=qusIndex;
      }
      AssessmentResult.update({'_id':id,'questions.qusId' :assessmentResult.qusId },{ 
        '$set': qusToUpdate
      },(err,doc)=> {
        if(err) {
          return reject(err);
        }
        resolve({success:true, msg: loggerConstants.UPDATE_SUCCESSSFULLY });
      })
    }).catch(err=> {
      reject(err);
    });
  });
}

/*
* validate user answer
*/
const verifyAnswers=(userAnswers,answers)=> {
  let isAnswerMatch=false;
  if(userAnswers.length === answers.length) {
    for(let uAns of userAnswers){
      if(!answers.find(ans=>uAns.id == ans.id)){
        return isAnswerMatch;
      }
    }
    isAnswerMatch=true;
  }else{
    return isAnswerMatch;
  }
  return isAnswerMatch;
}


/*
* on submit and finish assessment 
*/
const submitAndFinishAssessment= (id,assessmentResultInfo,userInfo)=> {
  return new Promise((resolve,reject)=> {
    if(assessmentResultInfo.qusId) {
      updateTimeAndStatus(id,assessmentResultInfo,userInfo).then(response=> {
        calculateMarks(id,userInfo).then(res=> {
          resolve(res);
        }).catch(err=>{
          reject(err);
        });
      });
    }else {
     calculateMarks(id,userInfo).then(res=> {
      resolve(res);
    }).catch(err=>{
      reject(err);
    });
  }
});
}

//finish assessment
const finishAssessment = (id,assessmentResult,userInfo)=> {
  return new Promise((resolve,reject)=> {
    saveUserAnswers(id,assessmentResult,userInfo,true).then(success=> {
      calculateMarks(id,userInfo).then(res=> {
        resolve(res);
      }).catch(err=>{
        reject(err);
      });
    },error=> {
      reject(err);
    });
  });
}

//save user answers
const saveUserAnswers = (id,assessmentResult,userInfo,isFinished)=> {
  return new Promise((resolve,reject)=> {
    let updateQuery = {'questions': assessmentResult.questions,'questionsForReview': assessmentResult.questionsForReview,'updatedBy':{'id':userInfo.userId,'role':userInfo.role}};
    let lastSaveQuestion = assessmentResult.questions.length;
    if(assessmentResult.totalTimeTaken) {
      updateQuery['timeTaken']= assessmentResult.totalTimeTaken;
    }
    if(!isFinished) {
      lastSaveQuestion=0;
      assessmentResult.questions.forEach((qus,i)=> {
        if(qus.userAnswers.length>0) lastSaveQuestion = i;
      })
      if(lastSaveQuestion!=0) ++lastSaveQuestion;
      updateQuery['lastSaveQuestion']= lastSaveQuestion;
    }
    AssessmentResult.update({'_id': id},{'$set': updateQuery},(err,doc)=> {
      if(err) return reject(err);
      resolve({success: true,msg: loggerConstants.UPDATE_SUCCESSSFULLY});
    });
  });
}

/*
* calculate marks based on user correct answer
*/
const calculateMarks= (id,userInfo)=> {
  return new Promise((resolve,reject)=> {
    AssessmentResult.findOne({'_id': id, assessmentStatus: "Paused"},(err,result)=> {
      if(err) return reject(err);
      if(result && result.type == appConstants.ASSESSMENT_TYPE[0] && userInfo.role== appConstants.USER_DETAILS.USER_ROLES[4]) {
       let calculateQuestions=[];
       result.questions.forEach(question=> {
        let isAnswerMatch= verifyAnswers(question.userAnswers,question.answers);
        if(isAnswerMatch) {
          question['ansStatus']="Correct";
          question['userMarks']=question.marks;
          result['score']+=question.marks;
          result['correctAns']+= 1;
        }else {
          question['ansStatus']="Incorrect";
          question['userMarks']=0;
        }
        question['answers']=question.answers;
        question['solution']=question.solution;
        question['marks']=question.marks;
        calculateQuestions.push(question);
      });
       result['questions']=calculateQuestions;
       result['scorePercentage']=calulatePercentage(result['score'],result.totalMarks);
       result['resultStatus']= (result['scorePercentage']<result['passPercentage'])? "Fail" : "Pass";
       result['assessmentStatus']="Finish";
       result['updatedBy']= {'id': userInfo.userId, 'role': userInfo.role };
       let newresult = new AssessmentResult(result);
       newresult.save((err,data)=> {
        if(err) return reject(err);
        resolve({success:true, msg: loggerConstants.SAVE_SUCCESSFULLY,data: data});
      });
     }else {
      AssessmentResult.findOne({'_id':id})
      .populate('assessmentId')
      .exec((err, assessmentResult)=> {
        if(err) { return reject(err) }
          if(assessmentResult.assessmentId && assessmentResult.assessmentId.questions) {
            let calculateQuestions=[], questionsWithAnswers=assessmentResult.assessmentId.questions;
            assessmentResult.questions.forEach(question=> {
              let questionWithAns=questionsWithAnswers.find(q=>q.qusId.toString()===question.qusId.toString());
              if(questionWithAns) {
                let isAnswerMatch= verifyAnswers(question.userAnswers,questionWithAns.answers);
                if(isAnswerMatch) {
                  question['ansStatus']="Correct";
                  question['userMarks']=questionWithAns.marks;
                  assessmentResult['score']+=questionWithAns.marks;
                  assessmentResult['correctAns']+= 1;
                }else {
                  question['ansStatus']="Incorrect";
                  question['userMarks']=0;
                }
                question['answers']=questionWithAns.answers;
                question['solution']=questionWithAns.solution;
                question['marks']=questionWithAns.marks;
                question['level']=questionWithAns.level;
                calculateQuestions.push(question);
              }else {
                logger.error(loggerConstants.QUESTION_NOT_MATCH+": "+question.qusId )
                return reject(new Error(loggerConstants.INTERNAL_ERROR));
              }
            });
            assessmentResult['assessmentId']=assessmentResult.assessmentId._id;
            assessmentResult['questions']=calculateQuestions;
            assessmentResult['scorePercentage']=calulatePercentage(assessmentResult['score'],assessmentResult.totalMarks);
            assessmentResult['resultStatus']= (assessmentResult['scorePercentage']<assessmentResult['passPercentage'])? "Fail" : "Pass";
            assessmentResult['assessmentStatus']="Finish";
            assessmentResult['updatedBy']= {'id': userInfo.userId, 'role': userInfo.role };
            let newAssessmentResult = new AssessmentResult(assessmentResult);
            newAssessmentResult.save((err,data)=> {
              if(err) return reject(err);
              resolve({success:true, msg: loggerConstants.SAVE_SUCCESSFULLY,data: data});
            });
          }else {
            logger.error(loggerConstants.ASSESSMENT_NOT_FOUND+" for "+id);
            reject(new Error(loggerConstants.INTERNAL_ERROR));
          }
        });
    }
  })
});
}

/*
* update time and status- on next question
*/ 
const updateTimeAndStatus=(id,assessmentResultInfo,userInfo)=> {
  return new Promise((resolve,reject)=> {
    let  assessmentResult= {
      'updatedBy': { 'id': userInfo.userId, 'role': userInfo.role }
    };
    if(assessmentResultInfo['timeTaken']) {
      assessmentResult['questions.$.timeTaken']=assessmentResultInfo['timeTaken'];
    }
    if(assessmentResultInfo['assessmentTimeTaken'] && assessmentResultInfo['maxTime']) {
      assessmentResult['timeTaken']=assessmentResultInfo['maxTime']-assessmentResultInfo['assessmentTimeTaken'];
    }
    if(assessmentResultInfo['status']) {
      assessmentResult['questions.$.status']=assessmentResultInfo['status'];
    }
    AssessmentResult.update({'_id': id,'questions.qusId': assessmentResultInfo.qusId },{ 
      '$set': assessmentResult
    },(err,doc)=> {
      if(err) {
        return reject(err);
      }
      resolve({success:true, msg: loggerConstants.UPDATE_SUCCESSSFULLY });
    });
  })
}

/*
* update questions for review
*/ 
const updateQuestionsForReview=(id,questionForReview,userInfo)=> {
  return new Promise((resolve,reject)=> {
    AssessmentResult.update({'_id': id },{ 
      '$set': questionForReview
    },(err,doc)=> {
      if(err) {
        return reject(err);
      }
      resolve({success:true, msg: loggerConstants.UPDATE_SUCCESSSFULLY });
    });
  })
}

/*
* get latest assessment result for student 
*/
const getStudentAssessmentWiseResult=(stuId)=> {
  return new Promise((resolve,reject)=> {
    let query= {
      studentId: stuId,
      //assessmentStatus: 'Finish'
    }
    let stuAggregatedResults=[];
    AssessmentResult.find(query)
    .sort({ 'creationDate': -1 })
    .populate({ path: 'assessmentId', select: '_id courseId'})
    .select('assessment assessmentId')
    .exec((err,results)=> {
      if(err) {
        return reject(err);
      }
      const aggregateResults=_.groupBy(results, 'assessmentId');
      let keys=Object.keys(aggregateResults);
      keys=keys.slice(0,3);
      keys.forEach((key,index)=> {
        if(aggregateResults[key][0]) {
         let resultDetails=aggregateResults[key][0]
         resultDetails=resultDetails.toObject();
         resultDetails['totalAttempt']= aggregateResults[key].length;
         stuAggregatedResults.push(resultDetails);
       }
     });
      resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: stuAggregatedResults });
    });
  });
}

//get user assessment status
const getUserAssessmentStatus = (assessmentId,userInfo)=> {
  return new Promise((resolve,reject)=> {
    AssessmentResult.findOne({assessmentId: assessmentId, studentId: userInfo.userId, assessmentStatus: "Paused"},
      (err,assessmentResult)=> {
        if(err) return reject(err);
        let assessmentStatus={isIncomplete: false };
        if(assessmentResult) {
          assessmentStatus['isIncomplete']=true;
        }
        resolve({success:true, msg: loggerConstants.GET_DATA_SUCCESSFULLY, data: assessmentStatus});
      });
  })
}

//get student assessment results
const getResultsByStudentId = studentId=> AssessmentResult.find({studentId: studentId,assessmentStatus: "Finish"});

//get assessment results
const getAssessmentResults = (query,fields)=> AssessmentResult.find(query,fields);


module.exports = {
  save: save,
  update: update,
  findById: findById,
  updateStudent: updateStudent,
  getStudentAssessmentResults: getStudentAssessmentResults,
  findByAssessmentId: findByAssessmentId,
  updateTimeAndStatus: updateTimeAndStatus,
  updateQuestionsForReview: updateQuestionsForReview,
  submitAndFinishAssessment: submitAndFinishAssessment,
  getStudentAssessmentWiseResult: getStudentAssessmentWiseResult,
  persistPracticeDetails: persistPracticeDetails,
  getUserAssessmentStatus: getUserAssessmentStatus,
  finishAssessment: finishAssessment,
  saveUserAnswers: saveUserAnswers,
  getAssessmentDetails: getAssessmentDetails,
  getResultsByStudentId: getResultsByStudentId,
  getAssessmentResults: getAssessmentResults,
}
