const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Playlist schema
const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'videos'
  }],
  notes: [{
    type: Schema.Types.ObjectId,
    ref: 'notes'
  }],
  references: [{
    type: Schema.Types.ObjectId,
    ref: 'references'
  }],
  keyPoints: [{
    type: Schema.Types.ObjectId,
    ref: 'keypoints'
  }],
  media: [{
    type: Schema.Types.ObjectId,
    ref: 'media'
  }],
  createrId: {
    type: String,
    required: true
  },
  createrName: {
    type: String,
    required: true
  },
  createrRole: {
    type: String,
    required : true
  },
  status: String,  // Active/ Inactive/ Deleted
  likes : Number,
  dislikes : Number,
  ratings: Number,
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  },
}, {
  collection: 'playlists'
});

module.exports = mongoose.model('playlists', playlistSchema);