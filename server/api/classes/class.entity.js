const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('../../constants').app;

let classSchema = new Schema({
 name: { type: String },
 schoolId: {
  type: Schema.Types.ObjectId,
  ref: 'schools'
},

teachers: [{
 type: Schema.Types.ObjectId,
 ref: 'teachers'
}],

subjects: [{
 type: Schema.Types.ObjectId,
 ref: 'subjects'
}],

sections: [{
 type: Schema.Types.ObjectId,
 ref: 'sections'
}],

subCategoryId: {
 type: Schema.Types.ObjectId,
 ref: 'subcategories'
},

status: { 
  type: String,
  required: true, 
  default: appConstant.USER_DETAILS.USER_STATUS[0] 
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

module.exports = mongoose.model('classes', classSchema);
