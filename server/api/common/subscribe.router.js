var express = require('express');
const path = require('path');
var router = express.Router();
const logger = require('./../../services/app.logger');
const authTokenCtrl = require('../authenticateToken/authToken.controller');



//send subscribe.html
router.get('/', (req, res) => {
	res.render('subscribe', {styles: ['/css/subscribe.css'], scripts: [], message: 'You have successfully subscribed to our youtube channel. Please close this window to go back to app.'})
});

module.exports = router;
 
