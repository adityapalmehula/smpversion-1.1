const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubTopics = require('../subtopics/subtopic.entity');
const constants = require('./topic.config');

const TopicSchema = new Schema({
  title:{
    type: String,
    minlength: constants.title.minlength,
    maxlength: constants.title.maxlength,
  },
  description: {
    type: String,
    minlength: constants.description.minlength,
    maxlength: constants.description.maxlength,
  },
  status:{
    type: String,
    enum: constants.status.enum
  },
  rating: String,
  courseId:{
    type: String,
  },
  subtopics: [{
    type: Schema.Types.ObjectId,
    ref: 'subtopics'
  }],
  solutions: [{
    title:  { type : String,
      minlength: constants.solutions.minlength,
      maxlength: constants.solutions.maxlength,
    },
    type: { type : String },
    source: { type : String },
    path: {
     type : String,
     required: constants.solutions.path.required
   },
   status: { 
    type: String,
    enum: constants.solutions.status.enum
  },
  extension: {
    type: String,
    enum: constants.solutions.extension.enum
  }
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
}]
});

// This function will execute before remove event
TopicSchema.pre('remove', function(next) {
  this.subtopics.forEach((elem, index) => {
    SubTopics.findById({ '_id': elem })
    .then((subtopic) => {
      subtopic.remove()
      .then(() => next());
    });
  });
});

const Topic = mongoose.model('topics', TopicSchema);

module.exports = Topic;
