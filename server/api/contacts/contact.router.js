var express = require('express');
var router = express.Router();
const logger = require('./../../services/app.logger');
const contactCtrl = require('./contact.controller');


// route for post category
router.post('/', function(req, res) {
    let contactData = req.body;
      logger.debug('Get object and store into contactData');
    try {
        if (!contactData) {
            logger.error('contactData not found');
            throw new Error('Invalid inputs passed...!');
        }
           contactCtrl.insertContact(contactData).then((successResult)=> {
            logger.info('Get successResult successfully and return back');
            return res.status(201).send(successResult);
        }, (errResult)=> {
            // Log the error for internal use
            logger.error('Internal error occurred');
            return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
        });
    } catch (err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
    }
});

module.exports = router;