const router = require('express').Router();
var request = require('request');
const passport = require('passport');
const {google} = require('googleapis');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const url = require('url');
//const opn = require('opn');

const authCtrl = require('./auth.controller');
const authTokenCtrl = require('../authenticateToken/authToken.controller');
// const emailCtrl = require('./../emailUtil/emailUtil.controller');
const logger = require('../../services/app.logger');
const authenticate = require('./../authenticateToken/authToken.router');
const loggerConstants= require('./../../constants/logger').AUTHENTICATION;
const appConstant= require('./../../constants/app');
const CustomError = require('./../../services/custom-error');
const studentCtrl = require('./../students/student.controller');

const apps = appConstant.APPS;
const app = appConstant.APPNAME;

/*
 * Authenticate the user
 */
module.exports = function(io){
// Facebook OAuth Start

router.get('/facebook', passport.authenticate('facebook',{ scope: ['email','public_profile','user_friends','publish_actions'] }),(req, res) =>{});

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
	(req, res)=> {
		// request.post('https://graph.facebook.com/1796669960406172/feed?message=Welcome Yogendra&access_token='+req.query.code)
		// .on('response', function(response) {
			res.redirect(appConstant.FB_SUCCESS_REDIRECT_URL);
// })
});
// Facebook OAuth End

// Vimeo OAuth Start
// User authentication from Vimeo. This authentication is required to get private videos from vimeo
router.get('/vimeo', (req, res) =>{

	/*	Start of Vimeo Implicit Grant Workflow	*/

	res.redirect(appConstant.VIMEO.AUTHTOKEN_API_URL+appConstant.VIMEO.CLIENT_ID+'&response_type=token&redirect_uri='+appConstant.VIMEO.CALLBACK_URL+'&state=teststate321');
	
	/*	End of Vimeo Implicit Grant Workflow	*/
	
	/* Start of Vimeo Authorization Grant Workflow */

	// res.redirect(appConstant.VIMEO.AUTHTOKEN_API_URL+appConstant.VIMEO.CLIENT_ID+'&response_type=code&redirect_uri='+appConstant.VIMEO.CALLBACK_URL+'&state=teststate321');
	
	/* End of Vimeo Authorization Grant Workflow */

});

router.get('/vimeo/callback', (req, res)=> {

	/*	Start of Vimeo Implicit Grant Workflow	*/

	res.redirect(appConstant.VIMEO.REDIRECT_URL);

	/*	End of Vimeo Implicit Grant Workflow	*/

	/* Start of Vimeo Authorization Grant Workflow */
	
	// let state = req.query.state;
	// let code = req.query.code;

 	// Set post method options
	// var options = {
	//   url: 'https://api.vimeo.com/oauth/access_token',
	//   json:{
	//   	'grant_type':'authorization_code',
	//   	'code' : code,
	//   	 'redirect_uri' : appConstant.VIMEO.CALLBACK_URL
	//   	},
	//    headers: {
	//     'Authorization': 'basic ' +appConstant.VIMEO.UNAUTHTOKEN_AUTHORIZATION_HEADER
	//   }
	// };
	
	// Callback function to be called for post request
	// function callback(error, response, body) {
	//   if (!error && response.statusCode == 200) {
	//   }
	//   res.redirect(appConstant.VIMEO.REDIRECT_URL);
	// }
	
	// Post request to get user authentication token from vimeo 
	// request.post(options, callback);

	/* End of Vimeo Authorization Grant Workflow */

});

// Vimeo OAuth End

router.post('/', function (req, res, next) {
	let authData = req.body;
  let platform=req.headers.platform;
	logger.debug(loggerConstants.USER_AUTHENTICATION_STARTED + ' : ' +authData.username);
	try {
		if (!authData) {
			logger.error(loggerConstants.USER_DETAILS_NOT_PROVIDED);
			throw new Error(loggerConstants.USER_DETAILS_NOT_PROVIDED);
		}
		authCtrl.authenticateUser(req,authData).then((successResult) => {
			logger.info(loggerConstants.USER_DETAIL_FOUND + ' : '+authData.username);
			return res.status(201).send(successResult);
		}, (errResult) => {
			logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+errResult.msg);
			return res.status(403).send(errResult);
		});
	} catch (err) {
		logger.fatal(err.stack || err);
		res.status(500).send({ success:false, msg: err });
		return;
	}
});

/*  Youtube authentication  start*/

// Youtube authentication start route
router.get('/youtube', function(req, res) {
	const scopes = [
  	'https://www.googleapis.com/auth/youtube'
	];
 	const keyPath = path.join(__dirname, 'client_secret.js');
	let keys = { redirect_uris: [''] };
	if (fs.existsSync(keyPath)) {
	  keys = require(keyPath).web;
	}
	// create an oAuth client to authorize the API call
  this.oAuth2Client = new google.auth.OAuth2(
    keys.client_id,
    keys.client_secret,
    keys.redirect_uris[0]
  );
  // grab the url that will be used for authorization
  this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes.join(' ')
  });
  res.redirect(this.authorizeUrl);
 })

// Youtube authentication callback route
router.get('/youtube/callback', async function(req, res) {
	const qs = querystring.parse(url.parse(req.url).query);
  const {tokens} = await this.oAuth2Client.getToken(qs.code);
  this.oAuth2Client.credentials = tokens;
	subscribeChannel(res);
})

// Subscribe to a youtube channel
async function subscribeChannel (res) {
	let channelId;
	if(app === apps[0]){ // For smartpathshala
	  channelId = appConstant.YOUTUBE.SMARTPATHSHALA.CHANNEL_ID;
	} else if(app === apps[1]){ // For codestrippers
	  channelId = appConstant.YOUTUBE.CODESTRIPPERS.CHANNEL_ID;
	} else if(app === apps[2]){ // For localhost
	  channelId = appConstant.YOUTUBE.LOCALHOST.CHANNEL_ID;
	}
	// initialize the Youtube API library
	const youtube = google.youtube({
	  version: 'v3',
	  auth: this.oAuth2Client
	});

  const result = await youtube.subscriptions.insert({
    part: 'snippet',
    requestBody: {
      snippet:{
        resourceId:{
          kind: "youtube#channel",
          channelId: channelId
        }
      }
      
    }
  });
	
  if (result) {
		io.emit('end-subscription', {success:true, youtubeToken:this.oAuth2Client.credentials.access_token});
  	res.redirect(`/#/&youtubeToken=${this.oAuth2Client.credentials.access_token}`);
  }
}

/*  Youtube authentication  end */

/*
* forgot password, user email verification
*/
router.post('/verify-email',(req,res)=> {
	let email=req.body.email;
	try {
		if(!email) {
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		logger.info(loggerConstants.FORGOT_PASSWORD_REQUEST+" for "+email);
		
		authCtrl.verifyEmail(email).then(successResult=> {
			logger.info(successResult.msg +" requested for: "+email);
			return res.status(200).send(successResult);
		},error=> {
			logger.error("Requested for: "+email+"\n"+ error.stack || error);
			if(error instanceof CustomError) {
				return res.status(417).json({ msg: error.message });
			}else{
				return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
			}
		})
	}catch(err) {
		logger.error(loggerConstants.INTERNAL_ERROR +' requested for: '+email+' '+err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
	}
})

/*
* reset password, user email verification
*/
router.post('/reset-pass',(req,res)=> {
	let user= req.body.uId ;
	try {
		if(!user && !req.decoded.username) {
			logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
			return res.status(417).send({ success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
		}
		logger.info(loggerConstants.RESET_PASSWORD_REQUEST+" for "+user);
		
		authCtrl.resetPassword(req,null).then(successResult=> {
			logger.info(successResult.msg +" requested for: "+user);
			return res.status(200).send(successResult);
		},error=> {
			logger.error("Requested for: "+ user +" "+error.stack || error);
			if(error instanceof CustomError) {
				return res.status(417).json({ msg: error.message });
			}else{
				return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
			}
		})
	}catch(err) {
		logger.error(loggerConstants.INTERNAL_ERROR +' requested for: '+email);
		logger.error(err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
	}
})

/*
 *getting the nav bar menus for guest user and returns the nav-bar menus
 */
 router.get('/guest-menus', function (req, res) {
 	try {
 		authCtrl.getMenus('guest').then((successResult) => {
			// return res.status(201).send({ success: true, data: successResult, authToken:req.authToken });
			return res.status(201).send({ success: true, data: successResult });
		}, (errResult) => {
			// Log the error for internal use
			return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
		});
 	} catch (err) {
		// Log the Error for internal use
		res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
		return;
	}
});

 // Verify token provided by user
 router.get('/verifyToken/:token', function(req, res) {
 	const token = req.params.token;
 	if (token) {
 		authTokenCtrl.verifyAndRefreshToken(token,req).then((successResult) =>{
 			return res.status(201).send(successResult );
 		}, (errResult) =>{logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+errResult.msg);
 		return res.status(401).send(errResult);
 	})
 	} else {
 		logger.error({ success : false, data: errResult, msg: loggerConstants.INVALID_TOKEN });
 		return res.status(401).send({ success : false, msg: loggerConstants.INVALID_TOKEN });
 	}
 })


/*
 *middleware to verify user token for authentication and pass the decoded token to other request
 */
 router.use(authenticate);

 /*
* reset password, after login
* when user have token
*/
router.post('/reset-password',(req,res)=> {
	let user=req.decoded.username;
	try {
		logger.info(loggerConstants.RESET_PASSWORD_REQUEST+" for "+user);
		authCtrl.resetPassword(req,req.decoded).then(successResult=> {
			logger.info(successResult.msg +" requested for: "+user);
			return res.status(200).send(successResult);
		},error=> {
			logger.error("Requested for: "+ user +" "+error.stack || error);
			if(error instanceof CustomError) {
				return res.status(417).json({ msg: error.message });
			}else{
				return res.status(500).json({ msg: loggerConstants.INTERNAL_ERROR });
			}
		})
	}catch(err) {
		logger.error(loggerConstants.INTERNAL_ERROR +' requested for: '+email);
		logger.error(err.stack || err);
		return res.status(500).send({ msg: loggerConstants.INTERNAL_ERROR });
	}
})

// // Verify token provided by user
// router.post('/verifyToken', function(req, res, next) {
// 	const token = req.authToken;
// 	if (token) {
// 			return res.status(201).send({success: true, data:{token: token} });
// 	} else {
//       logger.error({ success : false, data: errResult, msg: loggerConstants.INVALID_TOKEN });
//       return res.status(403).send({ success : false, data: errResult, msg: loggerConstants.INVALID_TOKEN });
// 		}
// 	})


/*
 *getting the nav bar menus based on the role of user(coordinator,supervisor,admin,candidate) and returns the nav-bar menus
 */
 router.get('/nav-menus', function (req, res) {
 	let role = req.decoded.role;
 	try {
 		authCtrl.getMenus(role).then((successResult) => {
 			return res.status(201).send({ success: true, navJson: successResult, authToken:req.authToken });
 		}, (errResult) => {
 			return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
 		});
 	} catch (err) {
 		res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
 		return;
 	}
 });

 return router;
}