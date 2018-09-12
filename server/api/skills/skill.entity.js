const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('./../../constants/app');
const constants = require('./skill.config');

const SkillsSchema = new Schema({
  title: {
    type:String,
    unique : true,
    minlength: constants.title.minlength,
    maxlength: constants.title.maxlength
  },
  status: {  
    type: String,
    required: true,
    default: appConstant.CONTENT_STATUS[2]
  }, // Active/ Inactive/ Deleted
  createdBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date: { type: Date, default: Date.now }
 }, 
 updatedBy:{
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date: { type: Date }
 },
 deletedBy:{
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date:{ type: Date }
 }
});

const Skills = mongoose.model('skills', SkillsSchema);

module.exports = Skills;
