const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('./note.config');


const NotesSchema = new Schema({
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
  status : {
   type: String,
   enum: constants.status.enum,
 },
 likes: { type: Number, default: 0 },
 dislikes: { type: Number, default: 0 },
 ratings: { type: Number, default: 0 },
 type: String,
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

const Notes = mongoose.model('notes', NotesSchema);

module.exports = Notes;
