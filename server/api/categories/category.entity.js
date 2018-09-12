const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('./category.config');

const CategorySchema = new Schema({
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
  deleted : String
  /*subCategories: [{
    type:Schema.Types.ObjectId,
    ref:'subcategories'
  }]*/
});

const Category = mongoose.model('categories', CategorySchema);

module.exports = Category;
