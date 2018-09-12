const router = require('express').Router();
const logger = require('../../services/app.logger');
const authCtrl = require('./authToken.controller');
const roles = require('../../resources/roles').roles;
const loggerConstants= require('./../../constants/logger');

/*
 *middleware to verify user token for authentication and pass the decoded token to other request
 */
 router.use(function(req, res, next) {
  try {
	  // check header or url parameters or post parameters for token
    logger.debug(loggerConstants.AUTHORIZATION_STARTED);
    const token = req.body.token || req.headers.authorization || req.query.token;
    // decode token
    if(token) {
      authCtrl.verifyToken(token).then((successResult) => {
        logger.debug(loggerConstants.VALID_TOKEN);
        req.decoded = successResult.decoded;
        req.authToken = successResult.authToken;
        let role = req.decoded.role;
        let resource = req.method.toLowerCase()+'_'+req.originalUrl.split("/")[2].toLowerCase();
        if(resource.indexOf("?") >= 0){
          resource= resource.split('?')[0];
        }
        let permit= verifyUserPermission(role, resource);
        if(permit){
        	next();
        } else {
        	logger.error({ msg: loggerConstants.UNAUTHORIZED_ACCESS, success: false });
         return res.status(403).send({
          msg: loggerConstants.UNAUTHORIZED_ACCESS,
          success: false
        });
       }
     }, (errResult) => {
      logger.error({ success : false, data: errResult, msg: loggerConstants.INVALID_TOKEN });
      return res.status(401).send({ success : false, data: errResult, msg: loggerConstants.INVALID_TOKEN });
    });
    } else {
      // if there is no token return an error
      logger.error({msg: loggerConstants.NO_TOKEN, success: false});
      return res.status(401).send({
        msg: loggerConstants.NO_TOKEN,
        success: false
      });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Function to  verify user permission based on role
function verifyUserPermission(role, resource){
	if((roles[role]) &&  (roles[role].resources.indexOf(resource) !== -1)) {
		return true;
	} else {
		return false;
	}
}

module.exports = router;