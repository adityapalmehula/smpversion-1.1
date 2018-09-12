const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*const QuestionSchema = new Schema({
  courseId: Array,
  topicId: Array,
  subTopicId: Array,
  question: String,
  qusType: String,
  level: String,
  options: Array,
  answers: Array,
  solution: String,
  status: String,
  like: Number,
  disLike: Number,
  rating: Number,
  issues:[{
    userId: { type: Schema.Types.ObjectId,  ref: 'users'},
    description: { type: String }
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
});*/
const QuestionSchema = new Schema({
  qusCategories: Array,
  courseId: Array,
  topicId: Array,
  subTopicId: Array,
  question: String,
  qusType: String,
  hint: {
    text: String,
    icon: String
  },
  creditTo: String,
  level: String, // question difficulty level
  options: [{
    id: String,
    text: String,
    icon: String
  }],
  answers: [{
    id: String,
  }],
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'schools'
  },
  visibility: String,
  solution: String,
  status: String,
  qusIcon: String,
  solutionIcon: String,
  like: Number,
  disLike: Number,
  rating: Number,
  issues:[{
    userId: { type: Schema.Types.ObjectId,  ref: 'users'},
    description: { type: String }
  }],
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

const Question = mongoose.model('questions', QuestionSchema);

module.exports = Question;
