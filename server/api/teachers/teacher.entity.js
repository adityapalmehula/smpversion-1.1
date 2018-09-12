const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('../../constants').app;
const TeacherSchema = new Schema({
  name: String,
  email: {type: String, required: true, unique: true},
  gender:String,
  mobile: String,
  address:{
  city: {
  	type: String
    },
  state:{
    type: String
    },
  country: {
  	type:String
    },
  address: { 
  type: String
   },
  pincode: {
  	type: String
  }
  },
  type: {
    type: String,
    required: true,
    default: 'B2B',
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'schools'
  },
  subCategories: Array,/*[{
    type: Schema.Types.ObjectId,
    ref: 'subCategories'
  }]*/
  status: {
    type: String,
    default: appConstant.LEARNING_PROGRESS_STATUS[0],
  },
  isMailSend: { 
    type: Boolean,
  },
  createdBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date: { type: Date, default: Date.now }
 }, 
 updatedBy: [{
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date: { type: Date }
 }],
 deletedBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date:{ type: Date }
 }
});

TeacherSchema.index({name: 'text', email: 'text'});
const Teacher = mongoose.model('teacher', TeacherSchema);
module.exports = Teacher;
