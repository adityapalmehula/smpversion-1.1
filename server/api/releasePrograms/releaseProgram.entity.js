const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('./../../constants/app');
const constants=require('./releaseProgram.config');


const ReleaseProgramSchema = new Schema({
  projectId: String,
  releaseversion:Number,
  releasedBy: {
   id: { type: Schema.Types.ObjectId, ref: 'users'},
   role: { type : String },
   name: { type: String },
   date: { type: Date, default: Date.now }
 },
 
code: {
        type: String
    },
    version: {
        type: String
       
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    programNeed: {
        type: String
    },
    // icon: {
    //     type: String
    // },
    duration: {
        type: Number,
        default: 0
    },
    effort: {
        type: Number,
        default: 0
    },
    status: {
        type: String
    },
    tags: [{
        type: String
      
    }],
    projectData: [{
        projectId: { type: String },
        title: { type: String },
    }],
    courseData: [{
        courseId: { type: String },
        title: { type: String },
    }],
    isPaid: {
        type: Boolean
    },
    price: {
        offered: {
            type: String
           // validate: constants.price.offered.validate
        },
        actual: {
            type: String
           
        },
        discount: {
            type: Number
           
        }
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

const ReleaseProgram = mongoose.model('releasePrograms', ReleaseProgramSchema);

module.exports = ReleaseProgram;
