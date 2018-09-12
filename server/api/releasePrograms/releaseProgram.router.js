const express = require('express');
const router = express.Router();
const logger = require('../../services/app.logger');
const controller = require('./releaseProgram.controller');
const CustomError = require('./../../services/custom-error');
const authenticate = require('./../authenticateToken/authToken.router');
const CONFIG = require('./releaseProgram.config.js');


// For authentication
router.use(authenticate);


module.exports = router;
