const express = require('express');
const router = express.Router();
const logger = require('./../../services/app.logger');
const cartController = require('./cart.controller');
const loggerConstants = require('./../../constants/logger');
const cartsConstants = loggerConstants.CARTS;


//save cart data
router.post('/', (req, res) => {
   try {
  	let itemId = req.body.courseId;
    let currentUser = req.decoded;
    cartController.getCourseById(itemId).then((successResult) =>{
      if(successResult.data) {
        cartController.saveCart(successResult.data, currentUser).then((successResult) =>{
          return res.status(201).send(successResult);
        }, (errResult) =>{
          logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
          return res.status(500).send(errResult);
        });
      } else {
        return res.status(203).send(successResult);
      }

    }, (errResult) =>{
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
      return res.status(500).send(errResult);
    });
  }catch(err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success:false, msg: err });
    return;
  }
});

//get cart by userId
router.get('/mycart',function(req,res){
  let userId=req.decoded.userId;
  logger.info(cartsConstants.GET_CART_STARTED);
  try {
    cartController.getCartByUserId(userId).then((successResult)=>{
      return res.status(200).send(successResult);
    }, (errResult) => {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch(err) {
    logger.fatal(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
    return res.status(500).send({ success: false, msg: loggerConstants.INTERNAL_ERROR_OCCURED, data: err });
  }
});


module.exports = router;