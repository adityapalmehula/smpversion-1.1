const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('../../constants').app;
const autoIncrement = require('mongoose-auto-increment');
const config = require('./../../config');
const db = config.db;
let connection=mongoose.connect(db.MONGO.URL);

autoIncrement.initialize(connection);

const SchoolSchema = new Schema({
  name: String,
  schoolCode:Number,
  email: {type: String, required: true, unique: true},
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
  mobile: String,
  phoneNo: String,
  website: String,
  categories: [{
   type: Schema.Types.ObjectId,
   ref:'categories' 
 }],
 type: {
  type: String,
  required: true,
  default: 'B2B',
},
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
SchoolSchema.plugin(autoIncrement.plugin, {
  model: 'school',
  field: 'schoolCode',
  startAt: 10001,
  incrementBy: 1
});
SchoolSchema.index({name: 'text', email: 'text'});
const School = mongoose.model('school', SchoolSchema);

module.exports = School;
