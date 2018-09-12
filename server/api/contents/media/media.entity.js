const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('./media.config');

const mediaSchema = new Schema({
  title: {
    type: String,
    minlength: constants.title.minlength,
    maxlength:constants.title.maxlength
  },
  path: {
    type: String,
    required: constants.path.required
  },
  extension :{
   type : String,
   enum : constants.extension.enum
 } ,
 type : {
   type: String,
 },
 status: String,
 likes: { type: Number, default: 0 },
 dislikes: { type: Number, default: 0 },
 ratings: { type: Number, default: 0 },
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

module.exports =  mongoose.model('media', mediaSchema);;
