var express = require('express');
const path = require('path');
var router = express.Router();
const logger = require('./../../services/app.logger');


//send google verification html
router.get('/', (req, res, next) => {
	res.sendFile(path.resolve(__dirname, '../../common/google276614a24a981680.html'));
  },(error)=>{
   logger.error(error);
   return res.status(500).send({ error: error });
 });

module.exports = router;

