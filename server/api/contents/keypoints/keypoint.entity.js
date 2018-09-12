const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const constants = require('./keypoint.config');


const keypointSchema= new Schema({
  title:{
    type: String,
    minlength: constants.title.minlength,
    maxlength:constants.title.maxlength
  },
  description:{
    type: String,
    minlength: constants.description.minlength,
    maxlength:constants.description.maxlength
  },
  type : {
   type: String,
   enum: constants.status.enum,
 },
 type : String,
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
});

const keypoint= mongoose.model('keypoints',keypointSchema);

module.exports=keypoint;