const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const controller = require('./country.controller');
const loggerConstants = require('./../../constants/logger').BASICPROFILE;
const authenticate = require('./../authenticateToken/authToken.router');


router.get('/',(req,res)=> {
  let userId = req.decoded.userId;
    let role = req.decoded.role;
  try {
    logger.info(loggerConstants.REQUEST_FOR_USER_DATA + userId);
    controller.getCountry().then(successResult=> {
      logger.info(successResult.msg +" for: "+userId);
      return res.status(200).send(successResult);
    },error=> {
      logger.error(error.msg || error +" for: "+ userId);
      if(error instanceof CustomError) {
        return res.status(417).json({ msg: error.message });
      }else{
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    })
  }catch (err) {
    logger.error(loggerConstants.ERROR_OCCURED_IN_GET_USER_INFO_FOR +userId +err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});


module.exports = router;