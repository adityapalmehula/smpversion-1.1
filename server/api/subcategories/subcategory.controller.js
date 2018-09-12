const subCategoryModel = require('./subcategory.entity');
const categoryModel = require('./../categories/category.entity');
const logger = require('./../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants= require('./../../constants/logger');
const constants = require('./../../constants/app');

// insert SubCategories

const insertSubCategory = function(Data) {
    // insert the data into db using promise
    return new Promise((resolve, reject) => {
      let subCategoryData = new subCategoryModel(Data);
      logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : '+ subCategoryData);
      let error= subCategoryData.validateSync();
      if(error){
        let msg= validation.formValidation(error);
        reject(msg)
      } else {
        subCategoryModel.find({ "name": Data.name }, function(err, data) {
          if (data.length > 0) {
            reject({ success: false, msg: loggerConstants.SUBCATEGORY_ALREADY_EXIST });
          } else {
            subCategoryData.save(function(err, data) {
              if (err) {
                logger.error(loggerConstants.SUBCATEGORY_NOT_SAVED + ':' + err);
                reject({success : false, msg :loggerConstants.SUBCATEGORY_NOT_SAVED});
              } else {
                logger.debug({success: true, msg: loggerConstants.SUBCATEGORY_SUCCESSFULLY_SAVED + ' : ' + data })
                resolve({ success: true, msg: loggerConstants.SUBCATEGORY_SUCCESSFULLY_SAVED});
              }
            });
          }
        });
      }
    });
  };

// update subcategory data
const updateSubCategory=function(subCategory,id){
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : '+ subCategory);
//update data of blog
return new Promise((resolve,reject)=>{
  let subCategoryDetails={
    name: subCategory.name,
    description: subCategory.description,
    status: subCategory.status,
    updatedOn: Date.now()
  }
  let subCategoryData = new subCategoryModel(subCategoryDetails);
  let error= subCategoryData.validateSync();
  if(error){
    let msg= validation.formValidation(error);
    reject(msg)
  }
  subCategoryModel.updateOne({_id:id},
  {
    $set:subCategoryDetails
  },function(err,data) {
    if(err) {
      logger.error(loggerConstants.CATEGORY_NOT_UPDATED + ':' + err);
      reject({success : false, msg :loggerConstants.SUBCATEGORY_NOT_UPDATED});
    } else {
      logger.debug({success: true, msg: loggerConstants.SUBCATEGORY_SUCCESSFULLY_UPDATED + ' : ' + data })
      resolve({ success: true, msg: loggerConstants.SUBCATEGORY_SUCCESSFULLY_UPDATED});
    }
  });
});
};

// delete subcategories
const deleteSubCategory=function(id){ 
  return new Promise((resolve,reject)=>{
    subCategoryModel.deleteOne({_id:id},function(err,studentData){
      if (err) {
        logger.error(loggerConstants.SUBCATEGORY_DATA_NOT_FOUND + ' : ' + err);
        reject(err);
      } else {
       logger.debug({ success: true, msg: loggerConstants.SUBCATEGORY_SUCCESSFULLY_DELETED });
       resolve({ success: true, msg: loggerConstants.SUBCATEGORY_SUCCESSFULLY_DELETED });
     }
   });
  });
}

// get subcategories based on category id
const getSubCategories=function(id,filterObj) {
  let condition={categoryId: id};
  if(filterObj) {
    condition.status=filterObj.status;
  }
  return new Promise((resolve,reject)=> {
    subCategoryModel.find(condition,function(err,data) {
      if (err) {
        logger.error('subCategoryModel Not Get any data' + err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// get subcategory based on id
const getSubCategory=function(id){
  return new Promise((resolve,reject)=>{
    subCategoryModel.findOne({_id:id},function(err,data){
      if (err) {
        logger.error('subCategoryModel Not Get any data' + err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// get all subcategories
const getAllSubCategories=function(){
  return new Promise((resolve,reject)=>{
    subCategoryModel.find({},function(err,data){
      if (err) {
        logger.error('subCategoryModel Not Get any data' + err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const getSubCat=(id)=>{
  return new Promise((resolve,reject)=>{
    subCategoryModel.find({categoryId: id},(err,data)=> {
      if(err) {
        reject(err);
      }else {
        resolve(data);
      }
    });
  });
}

//get subcategories by categories id 
const getSubCatByCategories = (categories)=>{
  let promises=[];
  let subCategories=[];
  return new Promise((resolve, reject)=> {
    categories.map(ele=> {
      promises.push(getSubCategories(ele.id,{status: constants.STATUS.ACTIVE}))
    });
    Promise.all(promises).then(responses => {
     responses.map(ele=>{
      subCategories=subCategories.concat(ele);
    });
     resolve({success: true, msg: 'SubCategories '+loggerConstants.GET_DATA_SUCCESSFULLY, data: subCategories});
   }).catch(error => { 
    logger.error(error);
    reject({msg: loggerConstants.INTERNAL_SERVER_ERROR})
  });
 });
}

module.exports={
  insertSubCategory: insertSubCategory,
  deleteSubCategory: deleteSubCategory,
  getSubCategories: getSubCategories,
  getSubCategory: getSubCategory,
  updateSubCategory: updateSubCategory,
  getAllSubCategories: getAllSubCategories,
  getSubCatByCategories: getSubCatByCategories,
}