const express = require('express');
const router = express.Router();
var request = require('request');
const authenticate = require('./../authenticateToken/authToken.router');
var checksum = require('../../config/payments/paytm/model/checksum');
var merchant = require('../../config/payments/paytm/config/config').MERCHANT;
const orderController = require('./order.controller');
const loggerConstants= require('./../../constants/logger');
const logger = require('./../../services/app.logger');
const cartsConstants = loggerConstants.CARTS;
const appConstants = require('./../../constants/app');
const apps = appConstants.APPS;
const app = appConstants.APPNAME;

// Paytm merchant deatails for smartpathshala
var merchantDetails;
if(app === apps[0]){
  merchantDetails = merchant[apps[0]];
} else if (app === apps[1]) { // Paytm merchant deatails for codestrippers
  merchantDetails = merchant[apps[1]];
}

// Callback url for Paytm payment gateway
router.post('/checkout', (req, res) => {
  //Save payment information received from transaction request api
  orderController.updateOrder(true, req.body, null).then((successResult)=>{
    let body={
      'MID':req.body.MID,
      'ORDERID':req.body.ORDERID,
      'CHECKSUMHASH': req.body.CHECKSUMHASH
    }
    let options = {
      url:merchantDetails.TXN_STATUS_API,
      body:body, 
      json:true
    }
    // Make request to transaction status api to verify transaction status
    request.post(options, function (error, response, body) {
      let success = false, errorObj = null, txnObj = null;
      if (response && response.statusCode === 200) {
        // Get order data to verify transaction amount
        orderController.getOrderById(body.ORDERID).then((successResult)=>{
          let savedOrder = successResult.data;
          if (parseFloat(savedOrder.totalPrice) === parseFloat(body.TXNAMOUNT)) {
            success = true;
            txnObj = body;
          } else {
            success = false;
            txnObj = body;
            errorObj = {
              "ErrorMsg": appConstants.TXNAMOUNT_NOT_MATCHED
            }
          }
          txnObj['CURRENCY'] = savedOrder.payment.CURRENCY;
          //Update payment information received from transaction status api
          orderController.updateOrder(success, txnObj, errorObj).then((successResult)=>{
            // Write code here to remove items from cart if order is successful
            // Redirect user to order response page to show the transaction status
            res.redirect('/');

          }, (errResult)=>{
            // Redirect user to order response page to show the transaction status
            res.redirect('/');
          });
        }, (errResult) =>{
          // Redirect user to order response page to show the transaction status
          res.redirect('/');
        });
      } else if(error && error !== null) {
        success = false;
        errorObj = error;
        orderController.updateOrder(success, txnObj, errorObj).then((successResult)=>{
          // Redirect user to order response page to show the transaction status
          res.redirect('/');
        }, (errResult)=>{
          // Redirect user to order response page to show the transaction status
          res.redirect('/');
        });
      }
    });
  }, (errResult)=>{
    // Redirect user to order response page to show the transaction status
    res.redirect('/');
  });
});

// For authentication
router.use(authenticate);

router.get('/:cartId', (req, res) => {
  try {
    let cartId=req.params.cartId;
    let currentUser = req.decoded;
    let userId=currentUser.userId;
    logger.debug(cartsConstants.GET_CART_STARTED);
    // Retrieve user cart to place order
    orderController.getUserCart(userId,cartId).then((successResult)=>{
      let cart = successResult.data;
      cart = cart.toObject();

      // Create new order from cart content
      orderController.saveOrder(cart, currentUser).then((successResult)=>{
        let order = successResult.data;
        order = order.toObject();
        // Create transaction object to be sent to paytm payment gateway
        var paramlist = {
          'ORDER_ID':order._id.toString(),
          'CUST_ID': order.userId,
          'INDUSTRY_TYPE_ID':merchantDetails.INDUSTRY_TYPE_ID,
          'CHANNEL_ID':merchantDetails.CHANNEL_ID,
          'TXN_AMOUNT':order.totalPrice.toString(),
          'MID':merchantDetails.MID,
          'WEBSITE':merchantDetails.WEBSITE,
          'PAYTM_MERCHANT_KEY':merchantDetails.PAYTM_MERCHANT_KEY,
        }

        var paramarray = new Array();
        for (name in paramlist) {
          if (name == 'PAYTM_MERCHANT_KEY') {
               var PAYTM_MERCHANT_KEY = paramlist[name] ; 
          } else {
            paramarray[name] = paramlist[name] ;
          }
        }
        // Callback url to be called from paytm PG
        paramarray['CALLBACK_URL'] = merchantDetails.CALLBACK_URL;

        checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, function (err, result) 
        {
          res.render('pgredirect',{ 'restdata' : result, 'txnReqApi' : merchantDetails.TXN_REQ_API});
        });
      },(errResult)=>{
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
        return res.status(500).send({ success:false, msg: errResult.msg });
      });
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
      return res.status(500).send({ success:false, msg: errResult.msg });
    });
  }
  catch(err) {
    logger.fatal(err.stack || err);
    return res.status(500).send({ success:false, msg: err });
  }
});

module.exports = router;