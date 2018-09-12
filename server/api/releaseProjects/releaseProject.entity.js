
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('./../../constants/app');
const constants=require('./releaseProject.config');


const ReleaseProjectSchema = new Schema({
  projectId: String,
  releaseversion:Number,
  version: Number,
  releasedBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date: { type: Date, default: Date.now }
 },
 

 code: { type:String},
  version: { type:String, required: true},
  title: { 
    type:String
  },
  description: { type:String},
  level: { type:String},
  duration: { type: Number}, //In hrs. Sum of stories duration
  tenure: { type:Number},// In weeks
  prerequisites: { type :String},
  tags: [{ type :String}],
  epics: [{
    title: { type: String},
    status: { type: String},
    description: { type: String},
  }],
  stories: [{
    epicId : { type : String},
    title: { type: String},
    status: { type: String},
    description: { type: String},
    doneCriteria: { type: String},
    duration: { type : Number}, // In hrs. Sum of tasks duration
    tasks: [{
      seqNo: { type: Number},
      title: { type: String},
      description: { type: String},
      doneCriteria: { type: String},
      duration: { type : Number}, // In hrs.
      actions:[{type: String}], // Completed/Mark for Review
      concepts:[{type: String}],
      status: { type: String}
    }]
  }],
  instructors: [{
    technology: {type : String},
    allocated: {
      type: Schema.Types.ObjectId,
      ref: 'instructor'
    },
    alternate: {
      type: Schema.Types.ObjectId,
      ref: 'instructor'
    },
    backps: [{
      type: Schema.Types.ObjectId,
      ref: 'instructor'
    }],
  }],
  architecture:{
    url: {type: String},
    show: {type: Boolean}, // Default should be false
  },
  synopsis:{
    url: {type: String},
    show: {type: Boolean}, // Default should be false
  },
  report:{
    url: {type: String},
    show: {type: Boolean}, // Default should be false
  },
  presentation:{
    url: {type: String},
    show: {type: Boolean}, // Default should be false
  },
  price: {
    offered: { type: String},
    actual: { type: String},
    discount: { type: Number}
  },
  currency: { type: String},
  activationMethod: { type: String}, // Promotion/Paid
  isPaid: { type: Boolean}, // True/False
  status: { type: String}, // Active/ Inactive/ Deleted
  icon : { type: String},
  rating: { 
    type: Number
  },
  students:[{
    studentId : { 
      type: Schema.Types.ObjectId,
      ref: 'students'
    }
  }],
  userRatings: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    name: String,
    rating: Number,
    title: String,
    description: String,
    likes : [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }],
    dislikes : [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }],
    ratedOn: { type : Date , default : Date.now },
  }],
  
workFlows: [{
  id: { type: Schema.Types.ObjectId, ref: 'users'},
  role: { type : String },
  name: { type: String },
  date: { type: Date },
  statusFrom: { type : String },
  statusTo: { type : String },
  comment: { type : String }
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

},{ versionKey: false });

const ReleaseProject = mongoose.model('releaseProjects', ReleaseProjectSchema);

module.exports = ReleaseProject;
