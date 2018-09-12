const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const logger = require('../../services/app.logger');
const uploadCtrl = require('./upload.controller');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'server/uploads/')
    },
    filename: function(req, file, cb) {
        console.log(file);
        cb(null, file.originalname.slice(0, file.originalname.lastIndexOf('.')) + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({ storage: storage }).any();  

router.post('/', function(req, res) {
  try {
    upload(req, res, function(err) {
      if (err) {
          console.log(err);
      }
      else {
        uploadCtrl.saveStudents(req.files[0].path).then((successResult) => {
          logger.info('Get successResult successfully and return back');
          return res.status(201).send(successResult);
          }, (errResult) => {
              // Log the error for internal use
              logger.error('Internal error occurred');
              return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
        });
      }
    })
  }
  catch (err) {
    logger.fatal('Exception occurred' + err);
    res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
    return;
  }
});
module.exports = router;
