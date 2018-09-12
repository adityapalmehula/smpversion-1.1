var express = require('express');
const path = require('path');
var router = express.Router();
const logger = require('./../../services/app.logger');
const loggerConstants = require('./../../constants/logger');
const menus = require('../../resources/menus.js');


//send user role after token verification
router.get('/', (req, res, next) => {
	if(req.decoded) {
		let role = req.decoded.role;
		logger.debug({success: true, msg: loggerConstants.USER_ROLE + ' : ' + req.decoded.username })
		return res.status(200).send({ success: true, data: {
			userRole : role,
		} 
	})
	} 		
},(error)=>{
	logger.error({success: false, msg: loggerConstants.USER_ROLE_NOT_FOUND + ' : ' + error});
	return res.status(500).send({ success: false, msg: loggerConstants.USER_ROLE_NOT_FOUND + ' : ' + error});
});

module.exports = router;

