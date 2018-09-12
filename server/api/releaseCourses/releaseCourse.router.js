const express = require('express');
const router = express.Router();
const logger = require('../../services/app.logger');
const controller = require('./releaseCourse.controller');
const CustomError = require('./../../services/custom-error');
const authenticate = require('./../authenticateToken/authToken.router');
const CONFIG = require('./releaseCourse.config');


// For authentication
router.use(authenticate);

// controller handler
const reqHandler = (promise, action, params) => async (req, res, next) => {
  const boundParams = params ? params(req, res, next) : [];
  try {
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
* get all release courses with there latest version
* all courses with group by with version 
*/ 
router.get('/', reqHandler(controller.getCoursesWithLatestVersion, 'Get all release courses', (req, res, next) => [req.query.q]));

/*
* get release courses details for filters
*/
router.get('/filterInfo', reqHandler(controller.getCoursesForFilter, 'Get release courses details for filters', (req, res, next) => [req.decoded,'filterInfo']));

/*
* get release courses details for filters
*/
router.get('/filters', reqHandler(controller.getCoursesForFilter, 'Get release courses details for filters', (req, res, next) => [req.decoded,req.query.q]));

/*
* get release course details by course id and it's latest version
*/
router.get('/:courseId', reqHandler(controller.getCourseDetails, 'Get relase course details', (req, res, next) => [req.params.courseId,req.query.q]));


module.exports = router;
