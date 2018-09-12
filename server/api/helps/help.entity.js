const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const HelpSchema = new Schema({
  category: String,
  description: String,
  attachment: {
    type: {type: String},
    path: { type: String}
  },
  status: String,
  replies: [{
    message:  { type : String },
    repliedBy: {
      id: { type: Schema.Types.ObjectId, ref: 'users'},
      role: { type : String },
      name: { type: String },
      date: { type: Date, default: Date.now }
    },
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
});


const Help = mongoose.model('helps', HelpSchema);

module.exports = Help;
