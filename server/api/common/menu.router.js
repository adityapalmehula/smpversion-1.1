var express = require('express');
const path = require('path');
var router = express.Router();
const logger = require('./../../services/app.logger');
const loggerConstants = require('./../../constants/logger');
const menus = require('../../resources/menus.js');


//send user menu rolewise
router.get('/', (req, res, next) => {
	let role = req.decoded.role;
	if(menus.navMenus[role]) {
		logger.debug({success: true, msg: loggerConstants.USER_MENUS_SUCCESS + ' : ' + req.decoded.username })
		return res.status(200).send({ success: true, data: {
			userRole : role,
			menus : menus.navMenus[role]
		} 
	})
	} else {
		logger.debug({success: false, msg: loggerConstants.USER_MENUS_NOT_FOUND + ' : ' + req.decoded.username })
		return res.status(200).send({ success: false, data: {
			success : false,
			msg : loggerConstants.USER_MENUS_NOT_FOUND
		} 
	})
	}
},(error)=>{
	logger.error({success: false, msg: loggerConstants.USER_MENUS_ERROR + ' : ' + error});
	return res.status(500).send({ success: false, msg: loggerConstants.USER_MENUS_ERROR + ' : ' + error});
});

module.exports = router;

