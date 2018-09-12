const categoryModel = require('./category.entity');
const logger = require('./../../services/app.logger');
const validation = require('./../../common/validation');
const loggerConstants = require('./../../constants/logger');
const SubCategory = require('./../subcategories/subcategory.entity');
const appConstant = require('../../constants').app;

const insertCategory = function(Data) {
  var categoryDetails = {
    name: Data.categoryName,
    description: Data.categoryDescription,
    status: Data.statusCheck
  };

  return new Promise((resolve, reject) => {
    logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : '+ categoryDetails);
    let categoryData = new categoryModel(categoryDetails);
    let error= categoryData.validateSync();
    if(error){
      let msg= validation.formValidation(error);
      reject(msg)
    } else {
      categoryModel.find({ "name": Data.categoryName }, function(err, data) {
        if (data.length > 0) {

          reject({ success: false, msg: loggerConstants.CATEGORY_ALREADY_EXIST });
        } else {
          categoryData.save(function(err, data) {
            if (err) {
              logger.error(loggerConstants.CATEGORY_NOT_SAVED + ':' + err);
              reject({success : false, msg :loggerConstants.CATEGORY_NOT_SAVED});
            } else {
             logger.debug({success: true, msg: loggerConstants.CATEGORY_SUCCESSFULLY_SAVED + ' : ' + data })
             resolve({ success: true, msg: loggerConstants.CATEGORY_SUCCESSFULLY_SAVED});
           }
         });
        }
      });
    }
  });
};


// update category data
const updateCategory = function(categoryObj, categoryId) {
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : '+ categoryObj);
    //update data of category
    return new Promise((resolve, reject) => {
      let categoryDetails={
        name: categoryObj.categoryName,
        description: categoryObj.categoryDescription,
        status: categoryObj.statusCheck,
        updatedOn: Date.now()
      }
      let categoryData = new categoryModel(categoryDetails);
      let error= categoryData.validateSync();
      if(error){
        let msg= validation.formValidation(error);
        reject(msg)
      } else {
        categoryModel.updateOne({ _id: categoryId }, {
          $set: categoryDetails
        }, function(err, data) {
          if (err) {
            logger.error(loggerConstants.CATEGORY_NOT_UPDATED + ':' + err);
            reject({success : false, msg :loggerConstants.CATEGORY_NOT_UPDATED});
          } else {
            logger.debug({success: true, msg: loggerConstants.CATEGORY_SUCCESSFULLY_UPDATED + ' : ' + data })
            resolve({ success: true, msg: loggerConstants.CATEGORY_SUCCESSFULLY_UPDATED});
            
          }
        });
      }
    });
  };


// Delete category Data
const deleteCategory = function(categoryId) {
  return new Promise((resolve, reject) => {
    categoryModel.deleteOne({ _id: categoryId }, function(err, data) {
      if (err) {
        logger.error(loggerConstants.CATEGORY_DATA_NOT_FOUND + ' : ' + err);
        reject(err);
      } else {
        logger.debug({ success: true, msg: loggerConstants.CATEGORY_SUCCESSFULLY_DELETED });
        resolve({ success: true, msg: loggerConstants.CATEGORY_SUCCESSFULLY_DELETED });
      }
    });
  });
}


const insertsubCategory = function(Data, categoryId) {
  logger.debug('Get subCategoryData and store into subCategoryDetails', Data);
  var subCategoryDetails = {
    name: Data.subcategoryName,
    description: Data.subCategoryDescription,
    status: Data.statusCheck
  };
  var categoryId = categoryId;
  let subCategoryData = new categoryModel(subCategoryDetails);

    // insert the data into db using promise
    return new Promise((resolve, reject) => {
      var ifError = validation.validationForm(Data);
      if (ifError) {
        resolve({ success: false, msg: 'field blank' });
      } else {
        categoryModel.findOneAndUpdate({ '_id': categoryId }, {
          $push: {
            subCategories: subCategoryData
          }
        }, function(err, data) {
          if (err) {
            logger.error('subcategory not added' + err);
            reject(err);
          } else {
            resolve({ success: true, msg: 'added successfully' });
          }
        });
      };
    });

  }

// Get all category data from db
const getCategory = function() {
  return new Promise((resolve, reject) => {
    categoryModel.find({}, function(err, data) {
      if (err) {
        logger.error(loggerConstants.NO_CATEGORY_FOUND + ' : ' + err);
        reject({ success: false, msg: err });
      } else if (!data) {
        logger.error(loggerConstants.NO_CATEGORY_FOUND);
        reject({ success: false, msg: loggerConstants.NO_CATEGORY_FOUND });
      } else {
        logger.debug(loggerConstants.GET_ALL_DATA_CATEGORY);
        resolve({ success: true, data: data, msg:loggerConstants.GET_ALL_DATA_CATEGORY });
      }
    });
  });

};

function getEditCategory(objId) {
  return new Promise((resolve, reject) => {
    categoryModel.findOne({ '_id': objId })
    .populate('subCategories')
    .exec(function(err, category) {
      resolve(category);
    });
  });
};


// get subcategory for updated

const getSubcategory = function(subcategoryId, categoryId) {
  return new Promise((resolve, reject) => {
    categoryModel.findOne({ "subCategories._id": subcategoryId }, function(err, data) {
      if (err) {
        logger.error('subCategoryModel Not Get any data' + err);
        reject(err);
      } else {

        let subcategory = data.subCategories.filter(function(subcat) {
          return subcat._id.toString() === subcategoryId;
        })
        resolve(subcategory[0]);
      }
    });
  });
}

// update subcategory data
const updateSubcategory = function(subcategoryData, subcategoryId) {
  logger.debug('Get subcategoryData and update into subcategorydetails', subcategoryData);

    //update data of blog
    return new Promise((resolve, reject) => {
      categoryModel.findOneAndUpdate({ "subCategories._id": subcategoryId }, {
        $set: {

          'subCategories.$.name': subcategoryData.subcategoryName,
          'subCategories.$.description': subcategoryData.subCategoryDescription,
          'subCategories.$.status': subcategoryData.statusCheck,
          'subCategories.$.updatedOn': Date.now()

        }
      }, function(err, data) {
        if (err) {
          logger.error('subcategoryData not updated successfully' + err);
          reject(err);
        } else {
          resolve({ success: true, msg: 'updated successfully' });
        }
      });
    });
  }
// delete subcategories
const deleteSubcategory = function(subcategoryId, categoryId) {
  return new Promise((resolve, reject) => {

    categoryModel.findOneAndUpdate({ "_id": categoryId }, {
      $pull: {
        'subCategories': {
          _id: subcategoryId
        }
      }
    }, { multi: true },
    function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve({ success: true, msg: 'deleted successfully' });
      }
    });
  });
}

//get categories and subcategories for filter 
const getCategoriesAndSubCategories = ()=> {
  return new Promise(async (resolve,reject)=> {
    try {
      let query={status: appConstant.STATUS.ACTIVE};
      let categories= await categoryModel.find(query).select('_id name');
      let subCategories= await SubCategory.find(query).select('_id name categoryId');
      resolve({ success: true, msg:loggerConstants.GET_ALL_DATA_CATEGORY,data: {categories,subCategories}});
    }catch(error){
      reject(error);
    }
  })
}

/*
const getCourses = function() {
  return new Promise((resolve, reject) => {
    categoryModel.find({}, function(err, courses) {
      if (err) {
        logger.error("No courses available ");
        reject(err);
      } else {
        resolve(courses);
      }
    })
  })
}*/

module.exports = {
  insertCategory: insertCategory,
  getCategory: getCategory,
  getEditCategory: getEditCategory,
  updateCategory: updateCategory,
  insertsubCategory: insertsubCategory,
  getSubcategory: getSubcategory,
  updateSubcategory: updateSubcategory,
  deleteCategory: deleteCategory,
  deleteSubcategory: deleteSubcategory,
  getCategoriesAndSubCategories: getCategoriesAndSubCategories,
}