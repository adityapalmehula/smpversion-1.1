const express = require('express');
const router = express.Router();
const logger = require('../../services/app.logger');
const controller = require('./releaseProject.controller');
const CustomError = require('./../../services/custom-error');
const authenticate = require('./../authenticateToken/authToken.router');
const CONFIG = require('./releaseProject.config.js');


// For authentication
router.use(authenticate);

// controller handler
const reqHandler = (promise, action, params) => async (req, res, next) => {
  const boundParams = params ? params(req, res, next) : [];
  try {
    // req.decoded={};
    // req.decoded.userId='U1234567';
    logger.debug(`Action={${action}}, User={${req.decoded.userId}}`);
    const result = await promise(...boundParams);
    logger.info(`${result.msg}, Action={${action}}, User={${req.decoded.userId}}`);
    return res.status(result.code || 200).json(result);
  } catch (error) {
   logger.error(error.stack || error);
   if(error instanceof CustomError) {
     logger.info(`Action={${action}}, User={${req.decoded.userId}}`);
     return res.status(error.code || 400).json({ msg: error.message});
   }else {
     logger.info(`${error.message}, Action={${action}}, User={${req.decoded.userId}}`);
     return res.status(500).json({ msg: CONFIG.LOGGER_CONFIG.INTERNAL_ERROR});
   }
 }
}

/*
* get all Project with there latest version
* all Project with group by with version 
*/ 
router.get('/', reqHandler(controller.getProjectsWithLatestVersion, 'Get all release Projects', (req, res, next) => [req.query.q]));

/*
* get release Project details by Project id and it's latest version
*/
router.get('/:projectId', reqHandler(controller.getProjectDetails, 'Get release project details', (req, res, next) => [req.params.projectId,req.query.q]));

module.exports = router;
