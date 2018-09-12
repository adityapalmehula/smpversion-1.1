const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
  title: String,
  description: String,
 // duration: String,
  url: String,
  youtubeId: String,
  thumbnail: String,
  startTime: Number,
  //endTime: String,
  status: String,
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
});

const Video = mongoose.model('videos', VideoSchema);

module.exports = Video;
