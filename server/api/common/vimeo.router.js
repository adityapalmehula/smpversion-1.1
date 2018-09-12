var express = require('express');
const path = require('path');
var router = express.Router();
const logger = require('./../../services/app.logger');
const authTokenCtrl = require('../authenticateToken/authToken.controller');



//send vimeo.html
router.get('/:token/:videoId', (req, res) => {
	const token = req.params.token;
	const videoId = req.params.videoId;
	if (token) {
		authTokenCtrl.verifyToken(token).then((successResult) =>{
		res.render('vimeo', {styles: ['/css/vimeo.css'], scripts: ['/scripts/vimeo-player.js'], message: '', videoId: videoId })
		}, (errResult) =>{
			let message = "Either token is missing or invalid token provided";
			res.render('vimeo', {styles: ['/css/vimeo.css'], scripts: ['/scripts/vimeo-player.js'], message: message, videoId: videoId })
		})
	} else {
		let message = "No token provided";
		res.render('vimeo', { styles: ['/css/vimeo.css'], scripts: ['/scripts/vimeo-player.js'], message: message, videoId: videoId })
	}
 });

module.exports = router;

 
