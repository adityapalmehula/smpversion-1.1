const Question = require('./question.entity');
const subTopics = require('../subtopics/subtopic.entity');
const topic = require("./../topics/topic.entity.js");
const logger = require('../../services/app.logger');
const loggerConstants= require('./../../constants/logger').QUESTION;
const CustomError = require('./../../services/custom-error');
const Config= require('./../../config/commonConfig');
const fileUpload = require('./../fileUpload/upload');
const constants = require('./../../constants/app');
const SubTopicsCtrl = require('./../subtopics/subtopic.controller');
const subTopicsModel = require('./../subtopics/subtopic.entity');
const Teacher = require("./../teachers/teacher.entity");

//persist question
const persistOrMergeQuestion= (question,userInfo,qusId=null)=> {
  return new Promise((resolve,reject)=> {
    let questionPromise=null;
    if(isAnyImageToUpload(question)) {
      uploadImage(question).then(questionWithImg=> {
        if(qusId) {
          questionPromise=updateQuestion(qusId,question,userInfo);
        }else {
         questionPromise=saveQuestion(questionWithImg,userInfo);
       }
       questionPromise.then(success=> {
        resolve(success);
      });
     }).catch(error=> {
      reject(error);
    });
   }else {
    if(qusId) {
      questionPromise=updateQuestion(qusId,question,userInfo);
    }else {
      questionPromise=saveQuestion(question,userInfo);
    }
    questionPromise.then(success=> {
      resolve(success);
    }).catch(error=> {
      reject(error);
    });
  };
});
}

/*
* persist question
*/
const saveQuestion = (questionDetails,userInfo)=> {
  return new Promise((resolve,reject)=> {
    let subTopicId=questionDetails.subTopicId;
    subTopics.findOne({_id: subTopicId},async (err,subTopic)=> {
      if(err) {
        reject(err);
      }else if(subTopic) {
        let authorizeRoles=constants.USER_DETAILS.USER_ROLES.slice(0,4);
        if(authorizeRoles.indexOf(userInfo['role']) != -1) {
          questionDetails['createdBy']= {
           id: userInfo['userId'],
           role: userInfo['role']
         }
         if(userInfo['role'] && userInfo['role'] === constants.USER_DETAILS.USER_ROLES[1]) {
          questionDetails['createdBy']['name']=constants.DEFAULT_NAME_FOR_BACKEND_USER;
        }else {
          questionDetails['createdBy']['name']=userInfo['name'];
        }
        if(userInfo['role'] === constants.USER_DETAILS.USER_ROLES[2]) {
          questionDetails['schoolId']=userInfo['userId'];
        }else if(userInfo['role'] === constants.USER_DETAILS.USER_ROLES[3]) {
         let teacher = await Teacher.findOne({_id: userInfo['userId']},'schoolId');
         if(teacher && teacher['schoolId']) {
          questionDetails['schoolId']=teacher['schoolId'];
        }else {
          logger.error(loggerConstants.TEACHER_NOT_FOUND+ ' : '+userInfo['userId']);
          reject(new Error(loggerConstants.INTERNAL_ERROR));
        }
      }
      questionDetails['status']=constants.CONTENT_STATUS[2];
      questionDetails['visibility']=constants.QUESTION_VISIBILITY[0];
      questionDetails['courseId']=subTopic['courseId'] || '';
      questionDetails['topicId']=subTopic['topicId'] || '';
      const question = new Question(questionDetails);
      question.save((err, question)=> {
        if(err) return reject(err);
        let actionData= SubTopicsCtrl.actionData(userInfo,constants.CONTENTS[6],constants.METHODS[0]);
        actionData.contentId=question._id;
        subTopicsModel.findOneAndUpdate({ '_id': subTopicId }, {
          $push: {
            questions: question._id,
            action: actionData
          }
        },(err, subtopic)=> {
         if(err) return reject(err)
          resolve({success:true, msg: loggerConstants.SAVE_SUCCESSFULLY});
      });
      });
    }else {
      reject(new CustomError(loggerConstants.NO_RIGHTS));
    }
  }else {
    reject(new CustomError(loggerConstants.INTERNAL_ERROR));
  }
});
  });
}

//update question based on update query
const updateQuestionInfo = (id,update)=> Question.findOneAndUpdate({ _id: id },update, {new: true});

// check for image upload
const isAnyImageToUpload = question=> {
  let isImageToUpload=false;
  if(question['qusIcon'] && question['isQuestionIconChange']) {
    isImageToUpload=true;
  } else if(question['solutionIcon'] && question['isSolutionIconChange']) {
    isImageToUpload=true;
  } else if(question['hint'] && question['hint']['icon'] && question['isHintIconChange']) {
    isImageToUpload=true;
  } else if(question.options) {
    optionLoop: for (let opt of question.options) {
      if(opt['icon'] && opt['isOpIconChange']) {
        isImageToUpload=true
        break optionLoop;
      }
    }
  }
  return isImageToUpload;
}

//upload Image
const uploadImage = question => {
  return new Promise((resolve,reject)=> {
    let images=[], imgUploadInfo=[];
    let uploadDetails = {
      requestType: 'questions'
    }
    if(question['qusIcon'] && question['isQuestionIconChange']) {
      uploadDetails['fileData']= question.qusIcon;
      images.push(fileUpload.uploadfile(uploadDetails));
      imgUploadInfo.push('qusIcon');
    }
    if(question['solutionIcon'] && question['isSolutionIconChange']){
      uploadDetails['fileData']= question.solutionIcon;
      images.push(fileUpload.uploadfile(uploadDetails));
      imgUploadInfo.push('solutionIcon');
    } 
    if(question['hint'] && question['hint']['icon'] && question['isHintIconChange']) {
      uploadDetails['fileData']= question['hint']['icon'];
      images.push(fileUpload.uploadfile(uploadDetails));
      imgUploadInfo.push('hint');
    }
    if(question.options) {
     question.options.forEach((opt,idx)=> {
      if(opt['icon'] && opt['isOpIconChange']) {
       uploadDetails['fileData'] = opt.icon;
       images.push(fileUpload.uploadfile(uploadDetails));
       imgUploadInfo.push(idx);
     }
   });
   }
   Promise.all(images).then(results=> {
    if(results && results.length) {
      imgUploadInfo.forEach((ele,idx)=> {
        let fileName=results[idx].filename;
        if(typeof ele== "number") {
          question['options'][+ele].icon=fileName;
        }else if(ele==='hint'){ 
          question['hint']['icon']=fileName;
        }else {
          question[ele]=fileName;
        }
      })
      resolve(question);
    }else {
      reject({success: false, msg: loggerConstants.IMAGE_UPLOAD_FAILED})
    }
  }).catch(error=> {
    reject({success: false, msg: loggerConstants.IMAGE_UPLOAD_FAILED})
  })
});
}

/*
* find questions
*/
const findQuestions = (query,limit,sort,skip=0,userInfo)=> {
  return new Promise(async(resolve, reject)=> {
    query['status'] = { $ne: constants.CONTENT_STATUS[5]};
    try {
     let count = await Question.find(getRoleBaseQuery(query, userInfo)).count();
     Question.find(getRoleBaseQuery(query, userInfo))
     .skip(skip)
     .limit(limit)
     .sort(sort)
     .exec((err,questions)=> {
      if(err) return reject(err);
      resolve({success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY,data: questions || [], totalCount: count})
    });
   }catch(err) {
    return reject(err);
  }
});
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
/*
* fetch questions based on filter query
*/
const getQuestions= (queryParams,isRandomQus,userInfo)=> {
  return new Promise(async (resolve,reject)=> {
    let levels=Config.QUESTION_LEVELS,roles=constants.USER_DETAILS.USER_ROLES;
    let filterParams=getFilterQuery(queryParams);
    let query= filterParams['$where'] || {};
    let limit= +filterParams['$limit'] || 0;
    let skip= +filterParams['$skip'] || 0;
    let sort= filterParams['$orderby'] || { 'createdBy.date': -1 };
   /* if(userInfo['role']) {
      if(userInfo['role']!=roles[0]) {
        query['visibility']=constants.QUESTION_VISIBILITY[0];
      }
      if(userInfo['role']==roles[2]) {
        query['schoolId']=userInfo['userId'];
      }
      if(userInfo['role'] === roles[3]) {
        query['createdBy.id']=userInfo['userId'];
        }
      }*/
      if(filterParams['$counter'] && filterParams['$counter'].level) {
        if(isRandomQus) {
          let totalQuestion=filterParams['$limit'];
          try {
            let randomQuestions=  await getLevelBasedRandomQuestions(query,totalQuestion,sort);
            if(randomQuestions.length != totalQuestion) {
              return reject(new CustomError(loggerConstants.NO_SUFFICIENT_QUESTION));
            }else {
              return resolve({success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: randomQuestions});
            }
          }catch(err) {
            reject(err);
          }
        }else {
          let promises= [],questions=[];
          filterParams['$counter'].level.forEach((val,i)=> { 
            query['level']=levels[i]
            limit= +val;
            if(limit!=0) {
              if(isRandomQus) {
                promises.push(getRandomQuestions(Object.assign({},query),limit,Object.assign({}, sort)));
              }else {
                promises.push(findQuestions(Object.assign({},query),limit,Object.assign({}, sort),skip,userInfo));
              }
            }
          });
          Promise.all(promises).then(results=> {
            results.forEach(result=> {
              if(result.data) {
                questions= questions.concat(result.data);
              }
            });
            resolve({success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: questions});
          },error=>{
            reject(error);
          })
        }
      }else{
        let getQuestions={};
        if(isRandomQus) {
          getQuestions=getRandomQuestions(query,limit,sort);
        }else {
          getQuestions=findQuestions(query,limit,sort,skip,userInfo);
        }
        getQuestions.then(success=> {
          if(isRandomQus) {
            if(success['data'].length !=limit) {
              return reject(new CustomError(loggerConstants.NO_SUFFICIENT_QUESTION));
            }
          }
          resolve({success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: success.data || [],totalCount: success['totalCount']});
        },error=>{
         reject(err);
       });
      }
    });
}

//get level based random questions
const getLevelBasedRandomQuestions= async (filterQuery,totalQuestion,sort)=> {
  let levels=Config.QUESTION_LEVELS,roles=constants.USER_DETAILS.USER_ROLES;
  let randomQuestions=[],qusLeft=0;
  let {x,y,z}=getRandom();
  let limit=x, status=[1,1,1];
  filterQuery['level']=levels[0];
  let randQusDetails= await getRandomQuestions(filterQuery,limit,Object.assign({}, sort));
  if(randQusDetails['data'].length != limit) {
    limit= y+(limit-randQusDetails['data'].length);
    status[0]=0;
  }else {
    limit=y;
  }
  randomQuestions= randomQuestions.concat(randQusDetails['data']);
  filterQuery['level']=levels[1];
  randQusDetails= await getRandomQuestions(filterQuery,limit,Object.assign({}, sort));
  if(randQusDetails['data'].length != limit) {
    limit= z+(limit-randQusDetails['data'].length);
    status[1]=0;
  }else {
    limit=z;
  }
  randomQuestions= randomQuestions.concat(randQusDetails['data']);
  filterQuery['level']=levels[2];
  randQusDetails= await getRandomQuestions(filterQuery,limit,Object.assign({}, sort));
  randomQuestions= randomQuestions.concat(randQusDetails['data']);
  if(randQusDetails['data'].length != limit) {
    if(status[0]==1) {
      limit= x+(limit-randQusDetails['data'].length);
      randomQuestions.splice(0, x);
      filterQuery['level']=levels[0];
      randQusDetails= await getRandomQuestions(filterQuery,limit,Object.assign({}, sort));
      randomQuestions= randomQuestions.concat(randQusDetails['data']);
      if(randQusDetails['data'].length != limit) { 
       limit= y+(limit-randQusDetails['data'].length);
       randomQuestions.splice(0, y);
       filterQuery['level']=levels[1];
       randQusDetails= await getRandomQuestions(filterQuery,limit,Object.assign({}, sort));
       randomQuestions= randomQuestions.concat(randQusDetails['data']);
     }
   }else if(status[1]==1) {
    limit= y+(limit-randQusDetails['data'].length);
    randomQuestions.splice(0, y);
    filterQuery['level']=levels[1];
    randQusDetails= await getRandomQuestions(filterQuery,limit,Object.assign({}, sort));
    randomQuestions= randomQuestions.concat(randQusDetails['data']);
  }
}
if(randomQuestions.length != totalQuestion) {
  limit=+totalQuestion;
  delete filterQuery['level'];
  randQusDetails= await getRandomQuestions(filterQuery,limit,Object.assign({}, sort));
  randomQuestions=randQusDetails['data'];
}
return randomQuestions;
}

//get random numbers
function getRandom() {
  let x=0, y=0, z=0;
  x = Math.floor((Math.random() * 10) + 1);
  if(x<10){
    y = Math.floor((Math.random() * (10-x)));
  }
  z=  10 - parseInt(x+y)
  return{x,y,z}
}

//get random questions
const getRandomQuestions = (query,limit,sort)=> {
  return new Promise((resolve, reject)=> {
    query['status'] = { $ne: constants.CONTENT_STATUS[5]}
    let aggregatePipe=[{$match: query},{$sample: {size: limit}}];
    Question.aggregate(aggregatePipe).exec((err,questions)=> {
      if(err) return reject(err);
      resolve({success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY,data: questions || []})
    });
  });
}

/*
* get filter query from query params
*/
const getFilterQuery=(queryParams)=> {
  let $where={},filters={};
  for(let key in queryParams) {
    if(queryParams.hasOwnProperty(key)) {
      let value= queryParams[key];
      if(Array.isArray(value)) {
       if(key.startsWith('counter_')) {
        let prop=key.substring(8,key.length);
        if(!filters['$counter']) {
          filters['$counter']={};
        }
        filters['$counter'][prop]=value;
       //filters['$counter'][prop].push(value);
     }else {
       let $orArr=[];
       value.forEach(val=> {
        let obj={};
        obj[key]=val;
        $orArr.push(obj)
      })
       $where['$or']=$orArr;
     }
   }else if(key==="startDate" || key==="endDate") {
    if(!$where['createdBy.date']) {
      $where['createdBy.date']={};
    }
    if(key==="startDate"){
      $where['createdBy.date']['$gte']=value;
    }else if(key==="endDate") {
      $where['createdBy.date']['$lte']=value;
    }
  }else if(key==="date") {
    $where['createdBy']={};
    $where['createdBy.date']={};
    $where['createdBy.date']['$lte']=value;
  }else if(key==="limit") {
    filters['$limit']=value;
  }else if(key==="skip") {
    filters['$skip']=value;
  }else if(key.startsWith('orderby_')) {
    let prop=key.substring(8,key.length);
    if(!filters['$orderby']) {
      filters['$orderby']={};
    }
    filters['$orderby'][prop]= value;
  }else {
    $where[key]=value;
  }
}
}
if(Object.getOwnPropertyNames($where).length>0) {
  filters['$where']=$where;
};
return filters;
}

/*
* get question by question id
*/
const getQuestionById= (questionId)=> {
  return new Promise((resolve,reject)=> {
    Question.findOne({_id: questionId, status: { $ne: constants.CONTENT_STATUS[5]}},(err,question)=> {
      if(err) {
       return reject(err);
     }
     resolve({success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: question})
   });
  });
}

//get active or inactive question details based on question id 
const getQuestion = qusId => Question.findOne({_id: qusId, status: {$ne: constants.CONTENT_STATUS[5]}});

/*
* upadte question by question id
*/
const updateQuestion=(qusId,questionData,userInfo)=> {
  return new Promise(async(resolve, reject) => {
    try {
      let isUpdateSubtopic=false;
      let questionDetails = await getQuestion(qusId);
      if(!questionDetails) return reject(new CustomError(loggerConstants.NO_DATA_FOUND));
      if(userInfo['userId'] == questionDetails.createdBy.id || userInfo['role'] === constants.USER_DETAILS.USER_ROLES[0] || userInfo['userId']==questionDetails.schoolId) {
       let qusDetails={
        question: questionData.question,
        options: questionData.options,
        answers: questionData.answers,
        level: questionData.level,
        solution: questionData.solution,
        status:questionData.status,
        qusCategories: questionData.qusCategories,
        qusType: questionData.qusType,
        hint: questionData.hint,
      };
      if(questionData['subTopicId'] && !questionDetails['subTopicId'].includes(questionData['subTopicId'][0])) {
        qusDetails['courseId']=questionData['courseId'];
        qusDetails['topicId']=questionData['topicId'];
        qusDetails['subTopicId']=questionData['subTopicId'];
        isUpdateSubtopic=true;
      }
      if(questionData['creditTo']) {
        qusDetails['creditTo']=questionData['creditTo'];
      }
      if(questionData['visibility']) {
        qusDetails['visibility']=questionData['visibility'];
      }
      if(questionData['qusIcon']) {
        qusDetails['qusIcon']=questionData['qusIcon'];
      }
      if(questionData['solutionIcon']) {
        qusDetails['solutionIcon']=questionData['solutionIcon'];
      }
      Question.findOneAndUpdate({'_id': qusId},{
       $push: {
         updatedBy: {
           id: userInfo.userId,
           role: userInfo.role,
           name: userInfo.name,
           date: Date.now()
         }
       },
       $set: qusDetails,
     },(err, data) => {
       if(err) return reject(err);
       if(!isUpdateSubtopic) {
         return resolve({success: true, msg: loggerConstants.UPDATE_SUCCESSSFULLY})
       }
       let actionData= SubTopicsCtrl.actionData(userInfo,constants.CONTENTS[6],constants.METHODS[0]);
       actionData.contentId=qusId;
       subTopicsModel.update({ '_id': qusDetails['subTopicId'] }, {
        $push: {
          questions: qusId,
          action: actionData
        }
      },(err, subtopic)=> {
       if(err) return reject(err)
        subTopicsModel.update({ '_id': questionDetails['subTopicId'] }, {
         $pull: {
          questions: qusId,
        },
        $push: {
          action: actionData
        }
      },(err, subtopic)=> {
       if(err) return reject(err)
         return resolve({success: true, msg: loggerConstants.UPDATE_SUCCESSSFULLY})
     });
    });
     });
    }else {
      reject(new CustomError(loggerConstants.NO_RIGHTS));
    }
  }catch(err) {
    reject(err);
  }
});
}

// function fetchQuestionBySubTopicId(req, res) {
//   const subtopicId = req.body.subTopicId;
//   question.find({ subTopicId: subtopicId })
//     .then((result) => {
//       res.json({
//         success: 'ok',
//         questions: result,
//       });
//     });
// }

// function fetchQuestionByTopicId(req, res) {
//   const topicId = req.body.topicID;
//   topic.find({_id: topicId})
//     .then((result) => {
//       let subTopics=result[0].subtopics;
//       subTopics.map((elem,i)=>{
//         question.findOne({subTopicId:elem}).then((data)=>{
//       	res.json({
//         success: 'ok',
//         questions: result,
//       });
//      });
//     })
//       ;
//    });
// }


// const fetchQuestionByTopicId = function(topicId) {
//     return new Promise((resolve, reject) => {
//         topic.findOne({ _id: topicId }, function(err, data) {
//             if (err) {
//                 logger.error('TopicID Not Get any data' + err);
//                 reject(err);
//             } else {
//                 let question = [];
//                 let subTopics = data.subtopics;
//                 subTopics.map((elem, i) => {
//                     question.find({ subTopicId: elem }, function(err, data1) {
//                         if (err) {
//                             logger.error('Not Get any question' + err);
//                             reject(err);
//                         } else {
//                         		let data=data1;
//                         		question.push(data);
//                         		resolve(question);
//                         }
//                     });
//                 });    
//             }
//         });
//     });
// };

const fetchQuestionBySubTopicId=function(subTopicId) {
  return new Promise((resolve,reject)=>{
    Question.find({subTopicId:subTopicId,status: { $ne: constants.CONTENT_STATUS[5]}},function(err,data){
      resolve(data);
    });
  })
}

// update question status deleted by question id
const deleteById=(questionId,userInfo)=> {
  return new Promise(async(resolve,reject)=> {
   try {
    let questionDetails = await getQuestion(questionId);
    if(!questionDetails) {
      return reject(new CustomError(loggerConstants.NO_DATA_FOUND));
    }
    if(userInfo['userId'] == questionDetails.createdBy.id || userInfo['role'] === constants.USER_DETAILS.USER_ROLES[0] || userInfo['userId']==questionDetails.schoolId) {
      Question.updateOne({_id:questionId },{
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

/*
* question report an issue
*/
const submitQuestionIssue=(qusId,issueDetails,userInfo)=> {
  return new Promise((resolve,reject)=> {
    let userIssueDetails={
      'description': issueDetails['description'],
      'userId': userInfo.userId,
    }
    Question.update({'_id': qusId},{
      $push: {
        issues: userIssueDetails
      }
    },(err, data)=> {
      if(err) {
       return reject(err);
     }
     resolve({success: true, msg: loggerConstants.UPDATE_SUCCESSSFULLY})
   });
  });
}   

module.exports = {
 // saveQuestion: saveQuestion,
 persistOrMergeQuestion: persistOrMergeQuestion,
 getQuestions: getQuestions,
 getQuestionById: getQuestionById,
 updateQuestion: updateQuestion,
 fetchQuestionBySubTopicId: fetchQuestionBySubTopicId,
 deleteById: deleteById,
 submitQuestionIssue: submitQuestionIssue,
}