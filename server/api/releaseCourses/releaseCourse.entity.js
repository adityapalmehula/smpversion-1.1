const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReleaseCourseSchema = new Schema({
  courseId: String,
  version: Number,
  releasedBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date: { type: Date, default: Date.now }
 },
 subcategory: {
  _id: String,
  name: String,
  description:String,
},
category: {
  _id: String,
  name: String,
  description:String,
},
title: String,
shortDescription: String,
longDescription: String,
prerequisites: String,
topics: Array,
type: { type: String },
price: {
  offered: { type: String },
  actual: { type: String },
  discount: { type: Number }
},
currency: { type: String },
activationMethod: { type: String },
isPaid: { type: Boolean },
duration: { type: Number },
icon : { type: String },
rating: { 
  type: Number,
  default: 0
},
tags: { type : Array },
students:[{
  studentId : { 
    type: Schema.Types.ObjectId,
    ref: 'students'
  },
  date: Date,
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
}

},{ versionKey: false });

const ReleaseCourse = mongoose.model('releaseCourses', ReleaseCourseSchema);

module.exports = ReleaseCourse;
