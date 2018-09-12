const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const assessmentResultSchema = new Schema({
  assessment: { type: String },
  resultStatus: { type: String },
  correctAns:  { type: Number, default: 0},
  passPercentage: { type: Number },
  courseId: { type :  String},
  scorePercentage: { type: Number },
  topics: [{ type : String }],
  subTopics: [ {type : String }],
  totalQuestion: { type : Number, required : true },
  totalMarks: { type : Number, required : true },
  score: { type: Number,default: 0 },
  level: { type: String },
  maxTime: { type: Number }, 
  timeTaken: { type: Number,default: 0 },
  type: { type: String, required : true},
  assessmentStatus: { type: String, default: "Paused" }, //paused/finish
  attemptedStatus: { type: String }, //fully/partially
  lastSaveQuestion: {type: Number, default: 0},
  questionsForReview: {type: Array},
  questions: [{ 
    qusId: { 
      type: Schema.Types.ObjectId,
      ref: 'questions' 
    },
    question: String,
    qusIcon: String,
    qusType: String,
    hint: {
      text: String,
      icon: String
    },
    level: String,
    userAnswers: Array,
    status: { type: String, default: "Not Attempted" }, //Not Attempted//attendewd//skipped
    ansStatus: String, 
    solution: String,
    solutionIcon: String,
    skillTags: Array,
    keywords: Array,
    marks: { type : Number },
    userMarks: { type : Number },
    timeTaken: { type: Number, default: 0 },
    maxTime: Number,
    qusCategories: Array,
    courseId: Array,
    topicId: Array,
    subTopicId: Array,
    options: [{
      id: String,
      text: String,
      icon: String
    }],
    answers: [{
      id: String,
    }], 
    userAnswers: [{
      id: String,
    }],
  }],

  assessmentId:{
    type: Schema.Types.ObjectId,
    required : true,
    ref:'assessments'
  },

  studentId: {
    type:Schema.Types.ObjectId,
    required : true,
    ref:'students'
  },

  createdBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   date:{ type: Date, default: Date.now }
 }, 

 updatedBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   date:{ type: Date, default: Date.now }
 },

 deletedBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   date:{ type: Date, default: Date.now }
 }
});

const assessmentResults = mongoose.model('assessmentresults', assessmentResultSchema);

module.exports = assessmentResults;
