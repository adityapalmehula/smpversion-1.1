const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('./../../constants/app');
const constants=require('./project.config');


const ProjectSchema = new Schema({
  code: { type:String, required: constants.code.required},
  version: { type:String, required: true},
  title: { 
    type:String, 
    required: constants.title.required,
    minlength:constants.title.minlength,
    maxlength:constants.title.maxlength,
  },
  description: { type:String, required: constants.description.required},
  level: { type:String, required: constants.level.required},
  duration: { type: Number, default:0 }, //In hrs. Sum of stories duration
  tenure: { type:Number, required: constants.tenure.required},// In weeks
  prerequisites: { type :String,required:constants.prerequisites.required },
  tags: [{ type :String,required: constants.tags.required  }],
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
    tasks: [{
      seqNo: { type: Number},
      title: { type: String},
      description: { type: String},
      doneCriteria: { type: String},
      duration: { type : Number, default:0}, // In hrs.
      actions:[{type: String}], // Completed/Mark for Review
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
    offered: { type: String,validate: constants.price.offered.validate },
    actual: { type: String,required: constants.price.actual.required  },
    discount: { type: Number,
    validate: constants.price.discount.validate
     }
  },
  currency: { type: String,enum:constants.currency.enum, },
  activationMethod: { type: String,enum:constants.activationMethod.enum }, // Promotion/Paid
  isPaid: { type: Boolean,enum: constants.isPaid.enum }, // True/False
  status: { type: String, required: true, default: appConstant.CONTENT_STATUS[0] }, // Active/ Inactive/ Deleted
  icon : { type: String},
  rating: { 
    type: Number,
    default: 0
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
      validationTracking:{
      title: String, 
      status: String, 
      epics: Array,
      stories:Array,
      isInvalid:Boolean,
      isType:{type:String}

    },
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

const Projects = mongoose.model('projects', ProjectSchema);

module.exports = Projects;
