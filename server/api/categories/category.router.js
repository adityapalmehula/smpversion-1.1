var express = require('express');
var router = express.Router();
const logger = require('./../../services/app.logger');
const categoryCtrl = require('./category.controller');
const loggerConstants= require('./../../constants/logger');

// route for post category
router.post('/', function(req, res) {
  let categoryData = req.body;
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE_CATEGORY);
  try {
    if (!categoryData) {
      logger.error(loggerConstants.CATEGORY_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    categoryCtrl.insertCategory(categoryData).then((successResult)=> {
      logger.info(loggerConstants.CATEGORY_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult)=> {
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
      return res.status(500).send(errResult);
    });
  } catch (err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success:false, msg: err });
    return;
  }
});

/*
* To update category data 
*/
router.put('/id/:id',function(req, res){
  let categoryData=req.body;
  let categoryId=req.params.id;

  logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': categoryData');
  try {
    if(!categoryData){
      logger.error(loggerConstants.CATEGORY_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    categoryCtrl.updateCategory(categoryData,categoryId).then((successResult) => {
      logger.info(loggerConstants.CATEGORY_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult)=>{
                // log the error for internal use
                logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
                return res.status(500).send(errResult);
              });
  } catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });


// Delete category data 
router.delete('/:categoryId',function(req,res){
  let categoryId=req.params.categoryId;
  try
  {
    categoryCtrl.deleteCategory(categoryId).then((successResult)=>{
      logger.info(loggerConstants.DATA_DELETED_FROM_CATEGORY + ' : ' + successResult.msg);
      return res.status(201).send(successResult);
    }, (errResult) => {
            //log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
          });
  }
  catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });




//route for post subcategory
router.post('/:categoryId/subcategories', function(req, res) {
  let subCategoryData = req.body;
  let categoryId=req.params.categoryId;
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': categoryData');
  try {
    if (!subCategoryData) {
     logger.error(loggerConstants.CATEGORY_DATA_NOT_FOUND);
     throw new Error(loggerConstants.INVALID_INPUTS);
   }
   categoryCtrl.insertsubCategory(subCategoryData,categoryId).then((successResult)=> {
     logger.info(loggerConstants.CATEGORY_SUCCESSFULLY_UPDATED + ' : ' + successResult);
     return res.status(201).send(successResult);
   }, (errResult)=> {
            // Log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
          });
 } catch (err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });

// route for get category 
router.get('/',function(req,res){
  try
  {
    categoryCtrl.getCategory().then((successResult)=>{
     logger.info(loggerConstants.GET_ALL_DATA_CATEGORY);
     return res.status(203).send(successResult);
   }, (errResult) => {
      //log the error for internal use
      logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult);
      return res.status(403).send(errResult);
    });
  }
  catch(err) {
    // Log the Error for internal use
    logger.fatal(err.stack || err);
    res.status(500).send({ success:false, msg: err });
    return;
  }
});

//route for get category and subcategories for filters 
router.get('/subcategories/filters',(req,res)=> {
  try{
    categoryCtrl.getCategoriesAndSubCategories().then((successResult)=>{
     return res.status(203).send(successResult);
   }, (errResult) => {
     logger.error(errResult);
     return res.status(403).send(errResult);
   });
  }catch(err) {
   logger.error(err.stack || err);
   res.status(500).send({ success:false, msg: loggerConstants.PROBLEM_OCCURED });
 }
});

router.get('/id/:id',function(req,res){
  let categoryId=req.params.id;

  try
  {
    categoryCtrl.getEditCategory(categoryId).then((successResult)=>{
      logger.info('get data from Category');
      return res.status(203).send(successResult);
    }, (errResult) => {
            //log the error for internal use
            logger.error('Internal error occurred');
            return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
          });
  }
  catch(err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
      }
    });

// route for subcategory

router.get('/:categoryId/subcategories/:subcategoryId',function(req,res){
  let subcategoryId=req.params.subcategoryId;
  let categoryId=req.params.categoryId;
  try
  {
    categoryCtrl.getSubcategory(subcategoryId,categoryId).then((successResult)=>{
      logger.info('Get Data of subCategory');
      return res.status(203).send(successResult);
    }, (errResult) => {
            //log the error for internal use
            logger.error('Internal error occurred');
            return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
          });
  }
  catch(err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
      }
    });

// update subcategory
router.put('/:categoryId/subcategories/:subcategoryId',function(req, res){
  let subcategoryData=req.body;
  let subcategoryId=req.params.subcategoryId;

  logger.debug('Get object and update into subcategoryData');
  try {
    if(!subcategoryData){
      logger.error('subcategoryData not found');
      throw new Error('Invalid inputs passed...!');
    }
    categoryCtrl.updateSubcategory(subcategoryData,subcategoryId).then((successResult) => {
      logger.info('Update successfully and return back');
      return res.status(201).send(successResult);
    }, (errResult)=>{
                // log the error for internal use
                logger.error('Internal error occurred');
                return res.status(304).send({error : 'Internal error occurred, please try later..!' });
              });
  } catch(err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
      }
    });


router.delete('/:categoryId/subcategories/:subcategoryId',function(req,res){
  let subcategoryId=req.params.subcategoryId;
  let categoryId=req.params.categoryId;
  try
  {
    categoryCtrl.deleteSubcategory(subcategoryId,categoryId).then((successResult)=>{
      logger.info('Delete data from subcategory');
      return res.status(203).send(successResult);
    }, (errResult) => {
            //log the error for internal use
            logger.error('Internal error occurred');
            return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
          });
  }
  catch(err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
      }
    });

/*//get course data
router.get('/courses',function(req,res){
  try{
    categoryCtrl.getCourses().then((successResult)=>{
      logger.info('Get request to courses');
      return res.status(203).send(successResult);
    },(errorResult)=>{
      logger.error('Internal error occurred');
      return res.status(204).send({error:'Internal error occurred, please try later..!'})
    });
  }catch(err){
    logger.fatal('Exception occurred' + err);
    res.send({ error: 'Failed to complete, please check the request and try again..!' });
    return;

  }
});*/


module.exports = router;



