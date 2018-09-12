const router = require('express').Router();
const logger = require('../../services/app.logger');
const usrCtrl = require('./users.controller');
const appConfig = require('../../constants').app;
const loggerConstants= require('./../../constants/logger').USER;
const CustomError = require('./../../services/custom-error');
const authenticate = require('./../authenticateToken/authToken.router');

/*
 * Actual URI will be HTTP POST /users/
 */
// Disabled intentionaly. Do not enable

 // router.post('/', function(req, res) {
 //  let userData = req.body;
 //  logger.debug('Get object and store into userData');
 //  try {
 //    if (!userData) {
 //      logger.error('userData not found');
 //      throw new Error('Invalid inputs passed...!');
 //    }

 //    usrCtrl.registerNewUser(userData, 'appConstant.INSERT_TYPE.PROFILES').then((successResult) => {
 //      logger.info('Get successResult successfully and return back');
 //      return res.status(201).send(successResult);
 //    }, (errResult) => {
 //            // Log the error for internal use
 //            logger.error('Internal error occurred');
 //            return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
 //          });
 //  } catch (err) {
 //        // Log the Error for internal use
 //        logger.fatal('Exception occurred' + err);
 //        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
 //        return;
 //      }
 //    });

 /*
 * user registration mail verification 
 */
 router.get('/confirmation',(req,res)=> {
   let unqId=req.query.uId;
   try{
    if(!unqId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    logger.info(loggerConstants.GET_MAIL_VERIFICATION_REQUEST+" for "+unqId);

    usrCtrl.emailVerification(unqId).then(successResult=> {
     if(!successResult['unqId']) {
      return res.status(410).redirect(appConfig.CLIENT_APIHOST+'/#/link-expired');
    }
    logger.info(successResult.msg +" for: "+unqId);
    res.status(301).redirect(appConfig.CLIENT_APIHOST+'/#/login/'+successResult['unqId']+'/'+successResult.status);
  },error=> {
   logger.error(loggerConstants.GET_MAIL_VERIFICATION_REQUEST+" for: "+unqId+"\n"+ error.stack || error);
   if(error instanceof CustomError) {
    return res.status(417).json({ msg: error.message });
  }else{
    return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
  }
})
  }catch(err) {
   logger.error(loggerConstants.INTERNAL_ERROR +' requested for: '+unqId+' '+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
 }
});

/*
* mail verification request for reset password
*/
router.get('/reset-password/mail-verification',(req,res)=>{
  let unqId=req.query.uId;
  try {
    if(!unqId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    usrCtrl.resetPasswordMailVerification(unqId).then(successResult=> {
      logger.info(successResult.msg +" for: "+unqId);
      res.status(301).redirect(appConfig.CLIENT_APIHOST+`/#/reset-password/${unqId}/`+successResult.status);
    },error=> {
      logger.error(loggerConstants.GET_MAIL_VERIFICATION_REQUEST+" for: "+unqId+"\n"+ error.stack || error);
      if(error instanceof CustomError) {
        return res.status(417).json({ msg: error.message });
      }else{
        return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
      }
    })
  }catch (err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested for: '+unqId+' '+err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

//re-send verification mail
router.post('/resend-verification-mail',(req,res)=>{
  try {
    let email= req.body.email;
    if(!req.body) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    usrCtrl.resendRegistrationVerificationMail(email).then(successResult=> {
     return res.status(200).send(successResult);
   },error=> {
    logger.error(error.stack || error);
    if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else{
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
  }catch (err) {
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

router.use(authenticate);

 //Change Password
 router.put('/change-password',function(req,res){
  try{

    let passwordData=req.body;
    let userId = req.decoded.userId;

    logger.info(loggerConstants.NEW_PASSWORD_FOR_USER,userId);
    usrCtrl.changePassword(passwordData,userId).then(success=>{
      logger.info(success);
      return res.status(201).send(success);
    },error=>{
     logger.error(error);
     return res.status(403).send(error);  
   })
  }catch(err){
    logger.fatal(err.stack || err);
    res.status(500).send({ success:false, msg: err });
  }
});

//update user  lastLoginOn date
router.put('/lastLoginOn', (req,res)=> {
  let userId=req.decoded.userId;
  try {
    if(!userId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    usrCtrl.updateLastLoginDate(userId).then((successResult)=> {
      logger.info(successResult.msg+" for: "+userId);
      return res.status(200).send(successResult);
    }, (errResult)=>{
      logger.error(errResult.msg || errResult+" for: "+userId);
      return res.status(417).send(errResult);
    });
  }catch(err) {
    logger.error(loggerConstants.INTERNAL_ERROR +' requested by: '+userId);
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

//re-send verification mail
router.post('/send-welcome-mail',(req,res)=>{
  try {
    let role = req.decoded.role;
    if(role !== appConfig.USER_DETAILS.USER_ROLES[0]) {
      return res.status(417).send({ success: false, msg: loggerConstants.PERMISSION_DENIED});
    }
    if(!req.body.id || !req.body.role) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }
    usrCtrl.SendWelcomeMail(req.body).then(successResult=> {
     return res.status(200).send(successResult);
   },error=> {
    logger.error(error.stack || error);
    if(error instanceof CustomError) {
      return res.status(417).json({ msg: error.message });
    }else{
      return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
    }
  })
  }catch (err) {
    logger.error(err.stack || err);
    return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
  }
});

/* start change status 3 May Rohit*/
router.put('/status',(req,res)=>{
 let userId=req.decoded.userId;
 try {
  let data=req.body;
  if(!data.updateDetails || !data.users || !data.role) {
    logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
    return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
  }
  if(req.decoded.role !== appConfig.USER_DETAILS.USER_ROLES[0]) {
    return res.status(417).send({ success: false, msg: loggerConstants.PERMISSION_DENIED});
  }
  usrCtrl.updateUserStatus(data,req.decoded).then(successResult=>{
    logger.info(successResult.msg +" requested by: "+userId);
    return res.status(200).send(successResult);
  },error=> {
    logger.error(error.stack || error);
    return res.status(500).json({ success: false, msg: loggerConstants.INTERNAL_ERROR });
  })
}catch (err) {
  logger.error(err.stack || err);
  return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR });
}
});

module.exports = router;