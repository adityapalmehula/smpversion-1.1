const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var video = require('../contents/videos/video.entity');
var notes = require('../contents/notes/note.entity');
var references = require('../contents/references/reference.entity');
const constants = require('./subtopic.config');

const SubTopicSchema = new Schema({
  title: {
    type: String,
    minlength:constants.title.minlength,
    maxlength:constants.title.maxlength,
  },
  description: {
    type: String,
    minlength:constants.description.minlength,
    maxlength:constants.description.maxlength,
  },
  status: {
    type: String,
    enum:constants.status.enum
  },
  rating: String,
  courseId:{
    type: String,
  }, 
  topicId: {
    type: String,
  },
  videos : [{
    type: Schema.Types.ObjectId,
    ref: 'videos'
  }],
  notes : [{
    type: Schema.Types.ObjectId,
    ref: 'notes'
  }],
  references : [{
    type: Schema.Types.ObjectId,
    ref: 'references'
  }],
  keypoints : [{
    type: Schema.Types.ObjectId,
    ref: 'keypoints'
  }],
  media : [{
    type: Schema.Types.ObjectId,
    ref: 'media'
  }],
  
  learningPaths : [{
    title: {
      type: String,
      minlength:constants.learningPaths[0].title.minlength,
      maxlength:constants.learningPaths[0].title.maxlength
    },
    mainContent: {
      contentId: {
        type:Schema.Types.ObjectId,
        refPath: 'mainContent.type'
      },
      type: {
        type:String,
        enum:constants.learningPaths[0].mainContent.type.enum
      },
      title: {
        type: String,
        minlength:constants.learningPaths[0].mainContent.title.minlength,
        maxlength:constants.learningPaths[0].mainContent.title.maxlength
      },
      date: {
        type : Date ,
        default : Date.now},
      },
      otherContents :[
      {
        contentId: {
         type:Schema.Types.ObjectId,
         refPath: 'otherContents.type'
       },
       type: {
        type:String,
        enum:constants.learningPaths[0].otherContents[0].type.enum
      },
      title:  {
        type: String,
        minlength:constants.learningPaths[0].otherContents[0].title.minlength,
        maxlength:constants.learningPaths[0].otherContents[0].title.maxlength
      },
      date: {
        type : Date ,
        default : Date.now},
      }],
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
   action:[{
     id: { type: Schema.Types.ObjectId, ref: 'users'},
     role: { type : String },
     name: { type: String },
     date: { type: Date },
     dataType: { type: String},
     method: { type: String},
     contentId :{type:Schema.Types.ObjectId, ref:'action.dataType' }
   }],
   questions:[{
    type:Schema.Types.ObjectId,
    ref:'questions'
  }]
});

// This function will execute before remove event
SubTopicSchema.pre('remove', function(next) {
  Promise.all([
    video.remove({ '_id': { $in: this.videos } }),
    notes.remove({ '_id': { $in: this.notes } }),
    references.remove({ '_id': { $in: this.references } })
    ]).then(() => next());
});

const SubTopic = mongoose.model('subtopics', SubTopicSchema);

module.exports = SubTopic;
