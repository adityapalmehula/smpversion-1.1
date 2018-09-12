const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Topics = require('../topics/topic.entity');
const constants = require('./course.config');

const CourseSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    required: constants.category.required
  },
  subcategory:{
    type: Schema.Types.ObjectId,
    ref: 'subcategories',
    required: constants.subcategory.required
  },
  title: {
    type: String,
    minlength:constants.title.minlength,
    maxlength:constants.title.maxlength,
  },
  shortDescription:{
    type: String,
    minlength:constants.shortDescription.minlength,
    maxlength:constants.shortDescription.maxlength,
  },
  longDescription:{
    type: String,
    minlength:constants.longDescription.minlength,
    maxlength:constants.longDescription.maxlength,
  },
  prerequisites:  {
    type: String,
  },
  status:{
    type: String,                       // Active/ Inactive/ Deleted
    enum: constants.status.enum,
  }, 
  topics: [{
    type: Schema.Types.ObjectId,
    ref: 'topics'
  }],
  type:{
      type: String                        //Academic/Technical
    },
    price: {
      offered: {
        type: Number,
        validate: constants.price.offered.validate
      },
      actual: {
        type: Number,
        required: constants.price.actual.required
      },
      discount: {
        type: Number,
        validate: constants.price.discount.validate
      }
    },
    currency:  {
      type: String,
      enum:constants.currency.enum,
    },
    activationMethod:  {
      type: String,                       // Promotion/Paid
      enum:constants.activationMethod.enum
    }, 
    isPaid:{
      type: Boolean,                      // True/False
      enum: constants.isPaid.enum
    }, 
    duration: {
      type: Number,                       //In days
      min:constants.duration.min,
      max:constants.duration.max,
    }, 
    icon :  {
      type: String,
    },
    iconExtension : {
      type: String,
      enum : constants.iconExtension.enum
    },
    rating: { 
      type: Number,
      default: 0
    },
    tags:  {
      type: Array,
      required: constants.tags.required
    },
    students:[{
      studentId : { 
        type: Schema.Types.ObjectId,
        ref: 'students'
      }
    }],
    userRatings: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      name: String,
      rating: Number,
      title: String,
      description: String,
      likes : [{
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        }
      }],
      dislikes : [{
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        }
      }],
      ratedOn: { type : Date , default : Date.now },
    }],
    validationTracking:{
      title: String, 
      status: String, 
      topics: Array, 
    },
    workFlows: [{
      id: { type: Schema.Types.ObjectId, ref: 'users'},
      role: { type : String },
      name: { type: String },
      date: { type: Date },
      statusFrom: { type : String },
      statusTo: { type : String },
      comment: { type : String }
    }],
    createdBy: {
     id: { type: Schema.Types.ObjectId, ref: 'users'},
     role: { type : String },
     name: { type: String },
     date: { type: Date, default: Date.now }
   }, 
   updatedBy: {
     id: { type: Schema.Types.ObjectId, ref: 'users'},
     role: { type : String },
     name: { type: String },
     date: { type: Date }
   },
   deletedBy: {
     id: { type: Schema.Types.ObjectId, ref: 'users'},
     role: { type : String },
     name: { type: String },
     date:{ type: Date }
   },
   action:[{
     id: { type: Schema.Types.ObjectId, ref: 'users'},
     role: { type : String },
     name: { type: String },
     date: { type: Date },
     dataType: { type: String},
     method: { type: String},
     contentId :{type:Schema.Types.ObjectId, ref:'action.dataType' }
   }]
 });

// This function will execute before remove event
CourseSchema.pre('remove', function(next) {
  this.topics.forEach((elem, index) => {
    Topics.findById({ '_id': elem })
    .then((topic) => {
      topic.remove()
      .then(() => next());
    });
  });
});

const Course = mongoose.model('courses', CourseSchema);

module.exports = Course;