const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
  texts: [{
    name: String,
    type: String,
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
    rating: Number,
    status: String,
  }],

  urls: [{
    name: String,
    type: String,
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
    rating: Number,
    status: String,
  }],

  videos: [{
    name: String,
    youtubeId: String,
    description: String,
    startTime: String,
    endTime: String,
    duration: String,
    url: String,
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
    rating: Number,
  }],

  mediaFiles: [{
    name: String,
    url: String,
    status: String,
    author: {
      name: String,
      rating: Number,
    },
    contributors: [
      {
        name: String,
        rating: Number,
        updatedOn: Date,
      }
    ],
    rating: Number,
  }]
});

const Content = mongoose.model('contents', ContentSchema);

module.exports = Content;
