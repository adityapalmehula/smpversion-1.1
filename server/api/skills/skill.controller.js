const skillModel = require('./skill.entity');
const logger = require('../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger');
const skillsConstants = loggerConstants.SKILLS;
const appConstants = require('./../../constants/app');

// Save skill data
const saveSkill = function(skillData, currentUser) {
  skillData['createdBy']= {
    id: currentUser['userId'],
    role: currentUser['role'],
    name: currentUser['name']
  }
  let newSkill = new skillModel(skillData);
  logger.debug(skillsConstants.GET_OBJECT_AND_STORE_SKILL + ' : skills');

  // insert the data into db using promise
  return new Promise((resolve, reject) => {
    let error= newSkill.validateSync();
    if(error){
      let msg= validation.formValidation(error);
      reject(msg)
    } else {
      newSkill.save(function(err, data) {
        if (err) {
          logger.error(skillsConstants.SKILL_NOT_SAVED + ':' + err);
          reject({ success: false, msg: skillsConstants.SKILL_NOT_SAVED });
        } else {
        	logger.debug({ success: true, msg: skillsConstants.SKILL_SUCCESSFULLY_SAVED })
          resolve({ success: true, msg: skillsConstants.SKILL_SUCCESSFULLY_SAVED });
        } 
      });
    }
  });
}

// Get all skills
const getSkills = function() {
  return new Promise((resolve, reject)=> {
    skillModel.find((err, skills) => {
      if (err) {
       logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
       reject({ success: false, msg: err });
     } else if (!skills) {
       logger.error(skillsConstants.SKILL_DATA_NOT_FOUND);
       reject({ success: false, msg: skillsConstants.SKILL_DATA_NOT_FOUND });
     } else {
      resolve({ success: true, data: skills });
    }
  });
  });
};

// Get all active skills only
const listSkills = function() {
  return new Promise((resolve, reject)=> {
    skillModel.find({status: appConstants.STATUS.ACTIVE},(err, skills) => {
      if (err) {
       logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
       reject({ success: false, msg: err });
     } else if (!skills) {
       logger.error(skillsConstants.SKILL_DATA_NOT_FOUND);
       reject({ success: false, msg: skillsConstants.SKILL_DATA_NOT_FOUND });
     } else {
      resolve({ success: true, data: skills });
    }
  });
  });
};

//Get single skill by skill id
const getSkillById = function(skillId) {
  return new Promise((resolve, reject)=> {
    skillModel.find({_id: skillId},(err, skill) => {
      if (err) {
       logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
       reject({ success: false, msg: err });
     } else if (!skill) {
       logger.error(skillsConstants.SKILL_DATA_NOT_FOUND);
       reject({ success: false, msg: skillsConstants.SKILL_DATA_NOT_FOUND });
     } else {
      resolve({ success: true, data: skill });
    }
  });
  });
};

// Update skill data
const updateSkill = function(skillData, currentUser) {
  skillData['updatedBy']= {
    id: currentUser['userId'],
    role: currentUser['role'],
    name: currentUser['name'],
    date: Date.now()
  }
  logger.debug(skillsConstants.GET_OBJECT_AND_STORE_SKILL + ' : skills');

  return new Promise((resolve, reject) => {
    let updatedSkill = {
      title : skillData.title,
      status : skillData.status,
      updatedBy : skillData.updatedBy
    };
    let skillObj = new skillModel(updatedSkill);  
    let error= skillObj.validateSync();
    if(error){
      let msg= validation.formValidation(error);
      reject(msg)
    } else {
      skillModel.findOneAndUpdate({ _id: skillData._id },
      { 
        $set: updatedSkill
      },function(err, data) {
        if (err) {
          logger.error(skillsConstants.SKILL_NOT_SAVED + ':' + err);
          reject({ success: false, msg: skillsConstants.SKILL_NOT_SAVED });
        } else {
          logger.debug({ success: true, msg: skillsConstants.SKILL_SUCCESSFULLY_UPDATED })
          resolve({ success: true, msg: skillsConstants.SKILL_SUCCESSFULLY_UPDATED });
        } 
      });
    }
  });
}

//Get single skill by skill id
const deleteSkillById = function(skillId, currentUser) {
  return new Promise((resolve,reject)=>{
    skillModel.updateOne({'_id': skillId},
    {
      $set : {
        status: appConstants.STATUS.DELETED,
        deletedBy:{
          id: currentUser.userId,
          role: currentUser.role,
          name: currentUser.name,
          date: Date.now()
        }
      }
    },function(err,data){
     if (err) {
      logger.error(skillsConstants.SKILL_DATA_NOT_FOUND + ' : ' + err);
      reject(err);
    } else {
      logger.debug({ success: true, msg: skillsConstants.SKILL_SUCCESSFULLY_DELETED });
      resolve({ success: true, msg: skillsConstants.SKILL_SUCCESSFULLY_DELETED });
    }
  });
  });
};


module.exports = {
  saveSkill : saveSkill,
  getSkills : getSkills,
  getSkillById : getSkillById,
  updateSkill : updateSkill,
  deleteSkillById : deleteSkillById,
  listSkills : listSkills,
}