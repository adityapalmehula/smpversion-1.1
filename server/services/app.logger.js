const log4js = require('log4js');

const loggerConfig = require('../config/logger');

//Configure logger service
log4js.configure(loggerConfig);
const logger = log4js.getLogger();
// logger.setLevel('DEBUG');

module.exports = logger;
