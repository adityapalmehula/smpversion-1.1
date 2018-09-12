const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('./subcategory.config');

const SubCategorySchema = new Schema({
  name:{
    type: String,
    minlength: constants.name.minlength,
    maxlength:constants.name.maxlength
  },
  description:{
    type: String,
    minlength: constants.description.minlength,
    maxlength:constants.description.maxlength
  },
  status: String,
  createdOn: {
    type: Date,
    default: Date.now
  },
  
  updatedOn: {
    type: Date,
    default: Date.now
  },

  categoryId:{
    type:Schema.Types.ObjectId,
  },
});

const SubCategory = mongoose.model('subcategories', SubCategorySchema);

module.exports = SubCategory;
