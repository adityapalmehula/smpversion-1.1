const cartModel = require('./cart.entity');
const logger = require('../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger');
const cartsConstants = loggerConstants.CARTS;
const appConstants = require('./../../constants/app');
var Course = require('../courses/course.entity');

// Save cart data
const saveCart = function(courseData, currentUser) {
  let cartData = {};
  let cartItem = {};
  cartItem.itemId = courseData._id;
  cartItem.title = courseData.title;
  cartItem.actualPrice = courseData.price.actual;
  cartItem.offeredPrice = courseData.price.offered;

  cartData['userId'] = currentUser.userId;
  cartData['status'] = appConstants.CART_STATUS[1]; // Active
  cartData['createdBy'] = {
    id: currentUser['userId'],
    role: currentUser['role'],
    name: currentUser['name'],
    date: Date.now() 
  }
  
  cartData['items'] = [];
  cartData.items.push(cartItem);
  cartData['totalPrice'] = courseData.price.offered;
  
  let newCart = new cartModel(cartData);
  logger.debug(cartsConstants.GET_OBJECT_AND_STORE_CART + ' : carts');
  return new Promise((resolve, reject) => {
    var ifError = validation.validationForm(cartData);
    if (ifError) {
      reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
    } else {
      cartModel.findOne({'userId':currentUser.userId}, function(err, cart){
        if (err) {
          logger.error(loggerConstants.PROBLEM_OCCURED + ':' + err.toString());
          reject({ success: false, msg: loggerConstants.PROBLEM_OCCURED, data:err });
        } else if(cart) {
          let updatedBy = {
            id: currentUser['userId'],
            role: currentUser['role'],
            name: currentUser['name'],
            date: Date.now() 
          }

          cartModel.findOneAndUpdate({'userId':currentUser.userId},
          {
            $set:{
              totalPrice: cart.totalPrice,
              updatedBy: updatedBy
            },
            $push:{
              items:cartItem
            }
          }, function(err, data) {
            if (err) {
              logger.error(cartsConstants.CART_NOT_SAVED + ':' + err);
              reject({ success: false, msg: cartsConstants.CART_NOT_SAVED });
            } else {
              logger.debug({ success: true, msg: cartsConstants.CART_SUCCESSFULLY_SAVED })
              resolve({ success: true, msg: cartsConstants.CART_SUCCESSFULLY_SAVED });
            }
          })
        } else {
          newCart.save(function(err, data) {
            if (err) {
              logger.error(cartsConstants.CART_NOT_SAVED + ':' + err);
              reject({ success: false, msg: cartsConstants.CART_NOT_SAVED });
            } else {
              logger.debug({ success: true, msg: cartsConstants.CART_SUCCESSFULLY_SAVED })
              resolve({ success: true, msg: cartsConstants.CART_SUCCESSFULLY_SAVED });
            }
          });
        }
      })
      
    }
  });
}

// Get course data by id
const getCourseById = function(id) {
  let courseId = id;
  logger.debug(loggerConstants.GET_ID_AND_STORE + ' : courseId');
  return new Promise((resolve, reject) => {
    Course.findOne({ '_id': courseId },
      function(err, courseData) {
        if (err) {
          logger.error(loggerConstants.COURSE_DATA_NOT_FOUND + ' : ' + err);
          reject(err);
        } else if (courseData) {
          logger.debug({ success: true, msg: loggerConstants.GET_COURSE_DATA_BY_ID })
          resolve({ success: true, msg: loggerConstants.GET_COURSE_DATA_BY_ID, data: courseData });
        } else {
          logger.debug({ success: true, msg: loggerConstants.COURSE_DATA_NOT_FOUND })
          resolve({ success: true, msg: loggerConstants.COURSE_DATA_NOT_FOUND });
        }
      });
  });
}

//get cart by userId
const getCartByUserId = function(userId) {
  return new Promise((resolve, reject)=> {
    cartModel.findOne({'userId': userId},(err, cart) => {
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


module.exports = {
  saveCart: saveCart,
  getCourseById : getCourseById,
  getCartByUserId : getCartByUserId, 
}