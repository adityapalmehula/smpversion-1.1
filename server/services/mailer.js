const nodemailer= require('nodemailer');
const APP_CONSTANTS = require('./../constants').app;
const logger = require('./app.logger');
//const MAIL_AUTH=APP_CONSTANTS.MAIL_AUTH;
const MAIL_NOTIFICATION=APP_CONSTANTS.MAIL_NOTIFICATION;

module.exports ={
  getMailConfig: () => {
   let mailConfig = {
    service: APP_CONSTANTS.APPNAME,
    secure : true,
  }
  if(APP_CONSTANTS.APPNAME === APP_CONSTANTS.APP.SMARTPATHSHALA) {
    mailConfig['host'] = APP_CONSTANTS.SMARTPATHSHALA_MAIL_CONFIG.HOST;
    mailConfig['port'] = APP_CONSTANTS.SMARTPATHSHALA_MAIL_CONFIG.PORT;
    mailConfig['auth'] = {
      user: APP_CONSTANTS.SMARTPATHSHALA_MAIL_CONFIG.AUTH.USER,
      pass: APP_CONSTANTS.SMARTPATHSHALA_MAIL_CONFIG.AUTH.PASSWORD
    }
  }else {
    mailConfig['host'] = APP_CONSTANTS.CODESTRIPPERS_MAIL_CONFIG.HOST;
    mailConfig['port'] = APP_CONSTANTS.CODESTRIPPERS_MAIL_CONFIG.PORT;
    mailConfig['auth'] = {
      user: APP_CONSTANTS.CODESTRIPPERS_MAIL_CONFIG.AUTH.USER,
      pass: APP_CONSTANTS.CODESTRIPPERS_MAIL_CONFIG.AUTH.PASSWORD
    }
  }
  let notification = {
    to: MAIL_NOTIFICATION.TO,
    name: MAIL_NOTIFICATION.NAME,
  }
  return {
    'transporter': nodemailer.createTransport(mailConfig),
    'from':  mailConfig['auth'].user,
    'notification' : notification,
  }
}
}

/*service: "Gmail",
      host : 'smtp.gmail.com',
      port : 587,
      secure : false,*/
