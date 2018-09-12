const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const compression = require('compression');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
var request = require('request');
var session = require('express-session')

const appRoutes = require('./app.router');
const logger = require('../services/app.logger');
const config = require('../config');
const constants = require('../constants');

const resMessages = constants.resMessages;
const loggerConfig = constants.logger;
const appConstants = constants.app;
const env = config.env;
const db = config.db;


// Create express app
function createApp() {
  const app = express();
  app.use(cors());
  app.io = require('socket.io')();
  setSockets(app);
  return app;
}

// Set sockets
function setSockets(app){
  app.io.on('connection', function(socket){
  socket.on('start-subscription', function(data){
    logger.info('Request received from platform : ',data.platform);
    if (data && data.platform.toLowerCase() === 'Mobile'.toLowerCase()) {
      logger.info('Joining room');
      socket.join(data.socketId)
      app.io.to(data.socketId).emit('get-socket', {'socketId':data.socketId});
    } else {
      logger.info('Disconnecting socket')
      socket.disconnect(true);
    }
  });
  socket.on('close-socket', function(data){
    logger.info('Disconnecting socket')
    socket.disconnect(true);
  })
});
}

//  Use application routes
function setupRestRoutes(app) {

  appRoutes.useRoutes(app);

  app.use(function(req, res) {
    let err = new Error(resMessages.RESOURCE_NOT_FOUND);
    err.status = 404;
    logger.error(err);
    return res.status(err.status).json({
      msg: err.message
    });
  });

  app.use(function(err, req, res) {
    logger.error(loggerConfig.INTERNAL_SERVER_ERROR+': ', err);
    return res.status(err.status || 500).json({
      msg: err.message
    });
  });

  return app;
}

//passport based routes
function setPassportRoutes() {
  /*app.get('/auth/facebook', passport.authenticate('facebook'),(req, res) =>{});
  
  app.get('/api/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
    (req, res)=> {
      res.redirect('http://localhost:4200/student/courses');
    });*/

  }
//setup passport authentication middleware
function setupPassportAuthMiddleware() {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(new FacebookStrategy({
    clientID: appConstants.FACEBOOK_AUTH.CLIENT_ID,
    clientSecret: appConstants.FACEBOOK_AUTH.CLIENT_SECRET,
    callbackURL: appConstants.FACEBOOK_AUTH.CALLBACK_URL
  },(accessToken, refreshToken, profile, done)=> {
    process.nextTick(()=> {
      // console.log('profile');
      console.log(profile);
  //     request.post('https://graph.facebook.com/'+profile.id+'/feed?message=Welcome Amoeba&access_token='+accessToken)
  //   .on('response', function(response) {
  //     return done(null, profile);
  // })
  return done(null, profile);
});
  })
  );
}

//  Use application middlewares
function setupMiddlewares(app) {
  app.use(morgan('dev'));
  app.use(bodyParser.json({limit: '5mb',}));
  app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: false
  }))
  app.use(compression());
  // app.use(session({
  //   secret: 'somesecret',
  //  }))
  app.use(passport.initialize());
  app.use(passport.session());
  app.use((err, req, res, next)=> {
    errorHandler(err);
  })
  process.on('uncaughtException',(err)=> {
    errorHandler(err);
  });
  process.on('unhandledRejection', err => {
    errorHandler(err);
  });
  return app;
}

// Initialize MongoDB database connection
function setupMongooseConnections() {

  mongoose.connect(db.MONGO.URL);

  mongoose.connection.on('connected', function() {
    logger.debug(loggerConfig.MONGODB_CONNECTED);
  });

  mongoose.connection.on('error', function(err) {
    logger.error(loggerConfig.MONGODB_CONNECTION_ERROR +' : ', err);
  });

  mongoose.connection.on('disconnected', function() {
    logger.debug(loggerConfig.MONGODB_DISCONNECTED);
  });

  process.on('SIGINT', function() {
    mongoose.connection.close(function() {
      logger.info(loggerConfig.MONGODB_DISCONNECTED_ON_PROCESS_TERMINATION);
      process.exit(0);
    });
  });
}
/*
* global error handler
*/
function errorHandler(error) {
  logger.error(error.stack || error.message);
}
module.exports = {
  createApp : createApp,
  setupRestRoutes : setupRestRoutes,
  setupMiddlewares : setupMiddlewares,
  setupMongooseConnections : setupMongooseConnections,
  setupPassportAuthMiddleware : setupPassportAuthMiddleware
};