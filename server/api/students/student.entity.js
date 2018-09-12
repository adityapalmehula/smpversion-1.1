const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('../../constants').app;
const constants = require('./student.config');
const backendvalidation = require('./reference.config');
//content schema
const ContentSchema = new Schema({
  title: String,
  description: String,
  type : { type : String },
  path: String,
  extension : String,
  url: String,
  videoId: String,
  thumbnail: String,
  source: String,
  startTime: Number,
  chapters: [{
    title: String,
    startTime: Number,
    endTime: Number
  }],
  //assessment schema
  assessment : { type : String },
  type : { type : String },
  level: { type :  String},
  totalMarks: { type : Number},
  passPercentage: { type : Number },
  tags: { type : Array },
  courseId: { type :  String},
  topics: [{ type : String }],
  subTopics: [ {type : String }],
  maxTime: { type : Number },
  insAtStart: { type : String },
  insAtTheEnd: { type : String },
  showFeedbackAt: { type : String },
  showScoreAt: { type : String },
  shuffleAns: { type : String },
  maxAttempts: { type : String },
  totalQuestion: { type : Number},
  status: { type : String },
  questions: [{ 
    qusId: { type: Schema.Types.ObjectId, ref: 'questions' },
    question: String,
    qusIcon: String,
    qusType: String,
    hint: {
      text: String,
      icon: String
    },
    level: String,
    options: [{
      id: String,
      text: String,
      icon: String
    }],
    /* answers: [{
      id: String,
    }],*/
    // solution: String,
    //topicId: Schema.Types.ObjectId,
    //subTopicId: Schema.Types.ObjectId,
    qusCategories: Array,
    courseId: Array,
    topicId: Array,
    subTopicId: Array,
    maxTime: { type : Number },
    marks: { type : Number }
  }]
});

//course schema
const CourseSchema = new Schema({
  category: {
    _id: String,
    name: String,
    description:String,
  },
  subcategory: {
    _id: String,
    name: String,
    description:String,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'releaseCourses',
  },
  title: String,
  shortDescription: String,
  longDescription: String,
  type: { type: String },
  version: Number,
  status: {
    type: String,
    default: appConstant.LEARNING_PROGRESS_STATUS[0],
  },
  progress: {
    type: Number,
    default: 0,
  },
  price: {
    offered: String,
    actual: String,
    discount: Number
  },
  currency: { type: String },
  activationMethod: { type: String }, 
  isPaid: { type: Boolean },
  duration: { type: Number },
  icon : { type: String },
  tags: { type : Array },
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
 assignedOn: {
  type: Date,
  default: Date.now
},
releasedBy: {
 id: { type: Schema.Types.ObjectId, ref: 'users'},
 role: { type : String },
 name: { type: String },
 date: { type: Date, default: Date.now }
},
topics: [{
  title: String,
  description: String,
  topicId: String,
  courseId: String,
  status: {
    type: String,
    default: appConstant.LEARNING_PROGRESS_STATUS[0],
  },
  progress: {
    type: Number,
    default: 0,
  },
  solutions: [{
    title:  { type : String },
    type: { type : String },
    source: { type : String },
    path: { type : String },
  }],
  subtopics: [{
   title: String,
   description: String,
   courseId: String,
   topicId: String,
   subtopicId: String,
   status: {
    type: String,
    default: appConstant.LEARNING_PROGRESS_STATUS[0],
  },
  progress: {
    type: Number,
    default: 0,
  },
  learningPaths : [{
    title: String,
    status: {
      type: String,
      default: appConstant.LEARNING_PROGRESS_STATUS[0],
    },
    progress: {
      type: Number,
      default: 0,
    },
    mainContent: {
      contentId: ContentSchema,
      type: { type: String },
      title: String,
    },
    otherContents :[{
      contentId: ContentSchema,
      type: { type: String },
      title: String,
    }]
  }]
}]
}]
});

let studentSchema = new Schema({
  /*schoolId: { type: String },
  class: { type: String },*/
  name: { 
    type: String,
    required: constants.name.required
  },
  email: { 
    type: String,
    validate: constants.email.validate
  },
  mobile: { 
    type: String,
    validate: constants.mobile.validate
  },
  gender: {
   type: String,
   enum: constants.gender.enum
 },
 schoolId: {
  type: Schema.Types.ObjectId,
  ref: 'schools'
},
address :{
  address1: { 
    type: String,
    minlength: backendvalidation.constants.address1.minlength,
    maxlength: backendvalidation.constants.address1.maxlength
  },
  address2: { 
    type: String 
  },
  city: { 
    type: String,
    minlength: backendvalidation.constants.city.minlength,
    maxlength:backendvalidation.constants.city.maxlength
  },
  state: { 
    type: String,
    minlength: backendvalidation.constants.state.minlength,
    maxlength: backendvalidation.constants.state.maxlength
  },
  pincode: { 
    type: String,
    maxlength: backendvalidation.constants.pincode.maxlength
  },
  country: { 
    type: String,
    minlength: backendvalidation.constants.country.minlength,
    maxlength: backendvalidation.constants.country.maxlength
  }
},

academicDetails: {
  board: {
    type: Schema.Types.ObjectId,
    ref: 'categories'
  }, 
  class: {
    type: Schema.Types.ObjectId,
    ref: 'subcategories'
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'schools'
  }, 
},

/* instituteName :{
  type: String,
  minlength: backendvalidation.academicinfo.instituteName.minlength,
  maxlength: backendvalidation.academicinfo.instituteName.maxlength
},
instituteAddress :{
  type: String,
  minlength: backendvalidation.academicinfo.instituteAddress.minlength,
  maxlength: backendvalidation.academicinfo.instituteAddress.maxlength
},*/

/*startDate :{
  type: String
},
endDate :{
  type: String
},
fieldStudy :{
  type: String,
  minlength: backendvalidation.academicinfo.fieldStudy.minlength,
  maxlength: backendvalidation.academicinfo.fieldStudy.maxlength
},
description :{
  type: String,
  minlength: backendvalidation.academicinfo.description.minlength,
  maxlength: backendvalidation.academicinfo.description.maxlength
},*/

profileUrls: [{
  platform :{
    type: String
  },
  socialUrl :{
    type: String,
    minlength: backendvalidation.profileUrlsinfo.socialUrl.minlength,
    maxlength: backendvalidation.profileUrlsinfo.socialUrl.maxlength
  }
}],
profilePic: {
  type: String,
},
extension: {
 type: String,
 enum: constants.extension.enum
},
type: {
  type: String,
  required: true,
  default: 'B2B',
},
isMailSend: { 
  type: Boolean,
},
isFlockJoined: { 
  type: Boolean,
},
courses: [{
  courseId: String,
  last: CourseSchema,
  current: CourseSchema
}],
assessments: [{
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: 'assessmentresults'
  }
}],
assignments: [{
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'assignmentresults'
  }
}],
schools: [{
  schoolId: { type: String },
  sessionFrom: { type: String },
  sessionTo: { type: String }
}],
currentSchool: {
  schoolId: { type: String }
},
isSubscribed: { type: Boolean, default: false }, 
subscriptionEndDate: { type: Date },
subscriptions:[{
  startDate: { type: Date },
  endDate: { type: Date }
}],
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
/*createdBy: {
  type: Schema.Types.ObjectId,
  ref: 'users'
},
creationDate: { type: Date, default: Date.now },
updatedBy: {
  type: Schema.Types.ObjectId,
  ref: 'users'
},
updationDate: { type: Date, default: Date.now },
deletedBy: {
  type: Schema.Types.ObjectId,
  ref: 'users'
},
deletedDate: { type: Date },*/
});

studentSchema.index({name: 'text', email: 'text'});
module.exports = mongoose.model('students', studentSchema);
