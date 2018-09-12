const express = require('express');
const router = express.Router();
var request = require('request');

const logger = require('./../../../services/app.logger');
const searchCtrl = require('./search.controller');
const loggerConstants = require('./../../../constants/logger');
const appConstant= require('./../../../constants/app');

// Search Video from Vimeo
router.get('/videos', (req, res) => {

  // Set get method options
    var options = {
      url: appConstant.VIMEO.PRIVATE_VIDEO_API + req.query.searchText,
        headers: {
        'Authorization': 'Bearer ' + appConstant.VIMEO.PRIVATE_TOKEN
      }
    };
    
    // Callback function to be called for get request
    function callback(error, response, body) {
      res.send(body)
    }
    
    // Get request to get search result for private video of a user 
    request.get(options, callback);
});

module.exports = router;
