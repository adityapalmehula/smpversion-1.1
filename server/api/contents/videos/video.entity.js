const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('./video.config');

const VideoSchema = new Schema({
  title: {
    type: String,
    minlength: constants.title.minlength,
    maxlength:constants.title.maxlength
  },
  description: {
    type: String,
    minlength: constants.description.minlength,
    maxlength:constants.description.maxlength
  },
  url: {
    type: String,
    // validate: constants.url.validate
  },
  videoId: {
    type: String,
    required: constants.videoId.required
  },
  thumbnail: {
    type: String,
    required: constants.videoId.required
  },
  source: {
    type: String
  },
  status : {
    type: String,
    enum: constants.status.enum,
  },
  startTime: Number,
  //endTime: String,
  author: {
    name: String,
    createdOn: Date,
  },
  contributors: [
  {
    name: String,
    updatedOn: Date,
  }
  ],
  type : String,
  chapters: [{
    title: String,
    startTime: Number,
    endTime: Number
  }],
  likes: 
  [{ 
    userId : String
  }],
  dislikes: 
  [{  
    userId : String
  }],
  ratings: { type: Number, default: 0 },
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

const Video = mongoose.model('videos', VideoSchema);

module.exports = Video;
