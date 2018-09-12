var express = require('express');
var router = express.Router();
const logger = require('./../../services/app.logger');
const subCategoryCtrl = require('./subcategory.controller');
const loggerConstants = require('./../../constants/logger');

// route for post subcategory
router.post('/', function(req, res) {
  let subCategoryData = req.body;
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': subCategoryData');
  try {
    if (!subCategoryData) {
      logger.error(loggerConstants.SUBCATEGORY_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    subCategoryCtrl.insertSubCategory(subCategoryData).then((successResult)=> {
     logger.info(loggerConstants.SUBCATEGORY_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
     return res.status(201).send(successResult);
   }, (errResult)=> {
            // Log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(500).send(errResult);
          });
  } catch (err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });

// update subcategory

router.put('/subcategory/id/:id/',function(req, res){
  try {
    let subCategory=req.body;
    let _id=req.params.id;

    logger.debug(loggerConstants.GET_OBJECT_AND_STORE +  ': subCategory');
    if(!subCategory){
      logger.error(loggerConstants.SUBCATEGORY_DATA_NOT_FOUND);
      throw new Error(loggerConstants.INVALID_INPUTS);
    }
    subCategoryCtrl.updateSubCategory(subCategory,_id).then((successResult) => {
     logger.info(loggerConstants.SUBCATEGORY_SUCCESSFULLY_SAVED + ' : ' + successResult.msg);
     return res.status(201).send(successResult);
   }, (errResult)=>{
     logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
     return res.status(500).send(errResult);
   });
  } catch(err) {
    logger.fatal(err.stack || err);
    res.status(500).send({ success:false, msg: err });
    return;
  }
});


// route for delete subcategory

router.delete('/:id',function(req,res){
  let _id=req.params.id;
  try
  {
    subCategoryCtrl.deleteSubCategory(_id).then((successResult)=>{
      logger.info(loggerConstants.DATA_DELETED_FROM_SUBCATEGORY + ' : ' + successResult.msg);
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



// route for get all subcategories based in category id 
router.get('/id/:categoryId',function(req,res){
  let categoryId=req.params.categoryId;
  try
  {
    subCategoryCtrl.getSubCategories(categoryId).then((successResult)=>{
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

    // route for get all subcategories
    router.get('/',function(req,res){
      let categoryId=req.params.categoryId;
      try
      {
        subCategoryCtrl.getAllSubCategories().then((successResult)=>{
          logger.info('Get Data of subCategories');
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


// route for get all subcategories based in category id 
router.get('/subcategory/:id',function(req,res){
  let _id=req.params.id;
  try
  {
    subCategoryCtrl.getSubCategory(_id).then((successResult)=>{
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

//get subcategories by categories id
router.post('/categories',(req, res)=> {
  try {
    let categories=req.body;
    if(!categories ){
      logger.error(loggerConstants.NO_CATEGORIES_FOUND);
      throw new Error(loggerConstants.NO_CATEGORIES_FOUND);
    }else {
      subCategoryCtrl.getSubCatByCategories(categories).then((successResult) => {
       logger.info(successResult.msg);
       return res.status(201).send(successResult);
     }, (errResult)=>{
       logger.error(errResult.msg);
       return res.status(403).send(errResult);
     }).catch(err=>{
      logger.error(loggerConstants.INTERNAL_SERVER_ERROR+ err.stack || err);
      return res.status(500).send({ success:false, msg: err });
    });
   }
 }catch(err) {
  logger.error(loggerConstants.INTERNAL_SERVER_ERROR+ err.stack || err);
  return res.status(500).send({ success:false, msg: err });
}
});

module.exports = router;