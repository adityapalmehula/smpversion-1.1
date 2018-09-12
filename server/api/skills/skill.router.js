const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const skillController = require('./skill.controller');
const loggerConstants = require('./../../constants/logger');
const skillsConstants = loggerConstants.SKILLS;


//save skill data
router.post('/', (req, res) => {
	let skillData = req.body;
  let currentUser = req.decoded;
	logger.debug(skillsConstants.GET_OBJECT_AND_STORE_SKILL);
  try {
    if (!skillData) {
      logger.error(skillsConstants.SKILL_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    skillController.saveSkill(skillData, currentUser).then((successResult) => {
      logger.info(skillsConstants.SKILL_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
      console.log(errResult);
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//Get all skills
router.get('/', (req, res) => {
  logger.info(skillsConstants.GET_SKILL_STARTED);
  try {
    skillController.getSkills().then((successResult) => {
    logger.info(skillsConstants.GET_SKILL_COMPLETED);
      return res.status(201).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(403).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//Get all active skills only 
router.get('/list', (req, res) => {
  logger.info(skillsConstants.GET_SKILL_STARTED);
  try {
    skillController.listSkills().then((successResult) => {
    logger.info(skillsConstants.GET_SKILL_COMPLETED);
      return res.status(201).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(403).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//Get single skill by skill id
router.get('/:skillId', (req, res) => {
  let skillId=req.params.skillId;
  logger.info(skillsConstants.GET_SKILL_STARTED);
  try {
    skillController.getSkillById(skillId).then((successResult) => {
    logger.info(skillsConstants.GET_SKILL_COMPLETED);
      return res.status(201).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(403).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//Update skill data
router.put('/', (req, res) => {
  let skillData = req.body;
  let currentUser = req.decoded;
  logger.debug(skillsConstants.GET_OBJECT_AND_STORE_SKILL);
  try {
    if (!skillData) {
      logger.error(skillsConstants.SKILL_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    skillController.updateSkill(skillData, currentUser).then((successResult) => {
      logger.info(skillsConstants.SKILL_SUCCESSFULLY_UPDATED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

//Delete single skill by skill id
router.delete('/:skillId', (req, res) => {
  let skillId=req.params.skillId;
  let currentUser = req.decoded;
  logger.info(skillsConstants.DELETE_SKILL_STARTED);
  try {
    if(!skillId){
      logger.error(loggerConstants.INVALID_INPUTS);
      throw new Error(loggerConstants.INVALID_INPUTS);
    } else {
      skillController.deleteSkillById(skillId, currentUser).then((successResult) => {
      logger.info(skillsConstants.DELETE_SKILL_COMPLETED);
        return res.status(201).send(successResult);
      }, (errResult) => {
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
        return res.status(403).send(errResult);
      });
    }
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success: false, msg: err });
    return;
  }
});

module.exports = router;