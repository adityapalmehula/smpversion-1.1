const orderModel = require('./order.entity');
const cartModel = require('../carts/cart.entity');
const logger = require('../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger');
const cartsConstants = loggerConstants.CARTS;
const ordersConstants = loggerConstants.ORDERS;
const appConstants = require('./../../constants/app');

// Save order data
const saveOrder = function(cart, currentUser) {
  let orderData = {};
  orderData['userId'] = cart.userId;
  orderData['items'] = cart.items;
  orderData['totalPrice'] = cart.totalPrice;
  orderData['status'] = appConstants.ORDER_STATUS[2]; //Pending order
  orderData['error'] = {};
  orderData['createdBy']= {
    id: currentUser['userId'],
    role: currentUser['role'],
    name: currentUser['name']
  }
  let newOrder = new orderModel(orderData);
  logger.debug(ordersConstants.GET_OBJECT_AND_STORE_ORDER + ' : orders');

  // insert the data into db using promise
  return new Promise((resolve, reject) => {
    var ifError = validation.validationForm(orderData);
    if (ifError) {
        reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    } else {
      newOrder.save(function(err, order) {
        if (err) {
          logger.error(ordersConstants.ORDER_NOT_SAVED + ':' + err);
          reject({ success: false, msg: ordersConstants.ORDER_NOT_SAVED });
        } else {
        	logger.debug({ success: true, msg: ordersConstants.ORDER_SUCCESSFULLY_SAVED })
          resolve({ success: true, msg: ordersConstants.ORDER_SUCCESSFULLY_SAVED, data:order });
	    	} 
	  	});
    }
	});
}

//get cart by userId and cartId
const getUserCart = function(userId, cartId) {
  return new Promise((resolve, reject)=> {
    cartModel.findOne({$and:[{'_id': cartId},{'userId': userId}]},(err, cart) => {
      if (err) {
        logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
        reject({ success: false, msg: err });
      } else if (!cart) {
        logger.error(cartsConstants.CART_DATA_NOT_FOUND);
        reject({ success: false, msg: cartsConstants.CART_DATA_NOT_FOUND });
      } else {
        resolve({ success: true, data: cart });
      }
    });
  });
};

// Update order data
const updateOrder = function(success, data, error) {
  logger.debug(ordersConstants.GET_OBJECT_AND_STORE_ORDER + ' : orders');
  let payment = { };
  let orderStatus;
  if (data !== null) {
    payment['TXNID'] = data.TXNID,
    payment['BANKTXNID'] = data.BANKTXNID,
    payment['TXNAMOUNT'] = data.TXNAMOUNT,
    payment['CURRENCY'] = data.CURRENCY,
    payment['STATUS'] = data.STATUS,
    payment['TXNTYPE'] = data.TXNTYPE,
    payment['GATEWAYNAME'] = data.GATEWAYNAME,
    payment['RESPCODE'] = data.RESPCODE,
    payment['RESPMSG'] = data.RESPMSG,
    payment['BANKNAME'] = data.BANKNAME,
    payment['MID'] = data.MID,
    payment['PAYMENTMODE'] = data.PAYMENTMODE,
    payment['REFUNDAMT'] = data.REFUNDAMT,
    payment['TXNDATE'] = data.TXNDATE 

    if (appConstants.PAYTM_ORDER_STATUS.indexOf(data.STATUS) != -1) {
      orderStatus = appConstants.ORDER_STATUS[appConstants.PAYTM_ORDER_STATUS.indexOf(data.STATUS)];
    } else {
      orderStatus = appConstants.ORDER_STATUS[2];
    }
  } 
  if (error !== null) {
    if (!success && error.ErrorMsg === appConstants.TXNAMOUNT_NOT_MATCHED) {
      orderStatus = appConstants.ORDER_STATUS[3];
    } else {
      orderStatus = appConstants.ORDER_STATUS[4];
    }
  } else if(error === null){
    error = {};
  }
  return new Promise((resolve, reject) => {
    orderModel.findOneAndUpdate({ _id: data.ORDERID },
      { 
        $set: {
          payment : payment,
          status : orderStatus,
          error : error
        }
      },function(err, data) {
      if (err) {
        logger.error(ordersConstants.ORDER_NOT_UPDATED + ':' + err);
        reject({ success: false, msg: ordersConstants.ORDER_NOT_UPDATED });
      } else {
        logger.debug({ success: true, msg: ordersConstants.ORDER_SUCCESSFULLY_UPDATED })
        resolve({ success: true, msg: ordersConstants.ORDER_SUCCESSFULLY_UPDATED });
      } 
    });
  });
}

//Get order by orderId
const getOrderById = function(orderId) {
  return new Promise((resolve, reject)=> {
    orderModel.findById({_id: orderId},(err, order) => {
      if (err) {
       logger.error(loggerConstants.PROBLEM_OCCURED + ' : ' + err);
       reject({ success: false, msg: err });
      } else if (!order) {
       logger.error(ordersConstants.ORDER_DATA_NOT_FOUND);
       reject({ success: false, msg: ordersConstants.ORDER_DATA_NOT_FOUND });
      } else {
      resolve({ success: true, data: order });
      }
    });
  });
};

module.exports = {
  saveOrder : saveOrder,
  getUserCart : getUserCart,
  updateOrder : updateOrder,
  getOrderById : getOrderById
}