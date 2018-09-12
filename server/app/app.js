const path = require('path');
const express = require('express');

const service = require('./app.service');

function welcome(appName) {
  process.stdout.write('\n=======================================================\n');
  process.stdout.write('\n=            '+ appName +'                =\n');
  process.stdout.write('\n=======================================================\n');
}

module.exports = function(appName) {

  welcome(appName);

  let app = service.createApp();

  app.set('views', 'server/views');
  app.set('view engine', 'pug')
  app.use(express.static(path.resolve(__dirname, '../', 'public')));
  app.use(express.static(path.resolve(__dirname, '../', 'uploads')));
  app.use(express.static(path.resolve(__dirname, '../../', 'client/dist')));

  app = service.setupMiddlewares(app);
  service.setupPassportAuthMiddleware();
  app = service.setupRestRoutes(app);
  service.setupMongooseConnections();


  return app;
};
