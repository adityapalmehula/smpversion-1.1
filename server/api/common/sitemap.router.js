var express = require('express');
const path = require('path');
var router = express.Router();
const logger = require('./../../services/app.logger');


//send sitemap.xml
router.get('/', (req, res, next) => {
	res.sendFile(path.resolve(__dirname, '../../common/sitemap.xml'));
  },(error)=>{
   logger.error(error);
   return res.status(500).send({ error: error });
 });

module.exports = router;

