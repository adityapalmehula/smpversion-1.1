const getVideoId = require('get-video-id');

const logger = require('../../services/app.logger');
const playlistModel = require('./playlist.entity');
const instructor = require('../instructors/instructor.entity');
const teacher = require('../teachers/teacher.entity');
var Topics = require('../topics/topic.entity');
const loggerConstants= require('./../../constants/logger');
const validation = require('./../../common/validation');

//Add new playlist details
const addPlaylist = function(playlistObj, createrId, role) {
  let userModel;
  if (role === 'Instructor') {
    userModel = instructor;
  } else if (role === 'Teacher') {
    userModel = teacher;
  }
  let topicId = playlistObj.topicId;
  let playlistDetails = {
    title: playlistObj.title,
    description: playlistObj.description,
    createrId: createrId,
    createrRole: role,
    likes: 0,
    dislikes: 0,
    ratings: 0,
    createdOn: Date.now(),
    updatedOn: Date.now()
  };
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' : playlistDetails');
// insert the data into db using promise
return new Promise((resolve, reject) => {
  userModel.findOne({ _id: createrId }, (err, user) => {
    if (err) {
      logger.error(loggerConstants.USER_DETAIL_FOUND + err);
      reject(err);
    } else {
      playlistDetails.createrName = user.name;
      let playlistData = new playlistModel(playlistDetails);
      playlistData.save(function(err, playlist) {
        if (err) {
          logger.error(loggerConstants.PLAYLIST_DATA_NOT_SAVED + err);
          reject(err);
        } else {
          Topics.findOne({ _id: topicId }, function(err, topic) {
            if (err) {
              logger.error({ success : false, msg:loggerConstants.PLAYLIST_DATA_NOT_SAVED + err });
              reject(err);
            } else {
              topic.playlists.push(playlist);
              topic.save(function(err, data) {
                if (err) {
                  logger.error({ success : false, msg:loggerConstants.PLAYLIST_DATA_NOT_SAVED + err });
                  reject(err);
                } else {
                  resolve({ success: true, msg: loggerConstants.PLAYLIST_SUCCESSFULLY_SAVED });
                }
              });
            }

          });
        }
      });
    }
  });

});
};

//Edit play List
const editplayList = function(playlistData) {
  logger.debug(loggerConstants.GET_OBJECT_AND_STORE + ' :  playlistData');
  return new Promise((resolve, reject) => {
   var ifError = validation.validationForm(playlistData);
   if (ifError) {
    logger.error(loggerConstants.FIll_ALL_BLANK_FIELD + ':' + ifError);
    reject({ success: false, msg: loggerConstants.FIll_ALL_BLANK_FIELD });
  } else {
    playlistModel.findOneAndUpdate({ _id: playlistData.playListID }, {
      $set: {
        title: playlistData.data.title,
        description: playlistData.data.description
      }
    }, { upsert: true, save: true },
    function(err, data) {
      if (err) {
        logger.error(loggerConstants.PLAYLIST_NOT_UPDATED + ':' + err);
        reject({success : false, msg :loggerConstants.PLAYLIST_NOT_UPDATED});
      } else {
        logger.debug({success: true, msg: loggerConstants.PLAYLIST_SUCCESSFULLY_UPDATED})
        resolve({ success: true, msg: loggerConstants.PLAYLIST_SUCCESSFULLY_UPDATED});

      }
    });
  }
});
}

// Delete playlist by id
const deletePlayList = function(playListId) {
  return new Promise((resolve, reject) => {
    playlistModel.remove({ _id: playListId },
      function(err, data) {
        if (err) {
         logger.error({ success: false, msg:loggerConstants.PLAYLIST_DATA_NOT_FOUND + ' : ' + err});
         reject(err);
       } else {
        logger.debug({ success: true, msg: loggerConstants.PLAYLIST_DATA_FOUND });
        resolve({ success: true, msg: loggerConstants.PLAYLIST_SUCCESSFULLY_DELETED });
      }
    }
    );
  })
}

// Get playlist by id
const getPlaylistById = (playlistId)=> {
  return new Promise((resolve, reject) => {
    playlistModel.findOne({ _id: playlistId })
    .populate({ path: 'notes' })
    .populate({ path: 'videos' })
    .populate({ path: 'media' })
    .populate({ path: 'keyPoints' })
    .populate({ path: 'references' })
    .exec((err, playlist)=> {
     if(err) {
       logger.error(err);
       reject({ msg: loggerConstants.INTERNAL_ERROR});
     }else if(playlist) {
      resolve({success : true, msg : loggerConstants.GET_DATA_SUCCESSFULLY, data: playlist});
    } else {
      reject({ msg: loggerConstants.NO_DATA_FOUND});
    }
  });
  });
}


// Get all play lists by owner
const getPlaylists = function(createrId, role) {
    // let userModel;
    // if (role === 'Instructor') {
    //     userModel = instructor;
    // } else if (role === 'Teacher') {
    //     userModel = teacher;
    // }
    return new Promise((resolve, reject) => {
      playlistModel.find({ 'createrId': createrId },
        function(err, data) {
          if (err) {
            reject(err);
          } else {
                    // userModel.findOne({ _id: createdBy }, (err, user) => {
                    //     resolve({ playlist: data, creater: user });
                    // });
                    resolve(data);
                  }
                });
    });
  }

// Add play item to playlist
const addItemsToPlaylist = function(owner, playData) {
  return new Promise((resolve, reject) => {
    let playItem = {
      title: playData.title,
      url: playData.url,
      youtubeId: getVideoId(playData.url).id,
      thumbnail: 'https://i.ytimg.com/vi/' + getVideoId(playData.url).id + '/default.jpg',
      startTime: playData.startTime,
      endTime: playData.endTime
    }

    playlistModel.findOneAndUpdate({ $and: [{ _id: playData.playListId }, { owner: owner }] }, { $push: { contents: playItem } }, { upsert: true, save: true },
      function(err, data) {
        if (err) {
         
          reject(err);
        } else {
          resolve({ playlist: { title: data.title, success: true } });

        }
      });
  });
}


const updatePlayListItem = function(playLId, playListItemData) {

  let playListId = playLId;
  let playListItemId = playListItemData.playListItemId;
  return new Promise((resolve, reject) => {
    playlistModel.findOneAndUpdate({ 'contents._id': playListItemId }, {
      $set: {
        'contents.$.title': playListItemData.title,
        'contents.$.url': playListItemData.url,
        'contents.$.youtubeId': getVideoId(playListItemData.url).id,
        'contents.$.thumbnail': 'https://i.ytimg.com/vi/' + getVideoId(playListItemData.url).id + '/default.jpg',
        'contents.$.tartTime': playListItemData.startTime,
        'contents.$.endTime': playListItemData.endTime
      }
    }, { upsert: true, save: true },
    function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve({ success: true, msg: ' Successfully updated' });
      }
    });
  });

}

//Delete playList Item
const deletePlayListItem = function(playListID, playListItemID) {

  return new Promise((resolve, reject) => {
    playlistModel.findOneAndUpdate({ '_id': playListID }, { $pull: { "contents": { '_id': playListItemID } } }, { upsert: true, save: true },
      function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, msg: ' Successfully deleted' });
        }
      });
  });
}

module.exports = {
  addPlaylist: addPlaylist,
  getPlaylists: getPlaylists,
  addItemsToPlaylist: addItemsToPlaylist,
  deletePlayList: deletePlayList,
  editplayList: editplayList,
  deletePlayListItem: deletePlayListItem,
  updatePlayListItem: updatePlayListItem,
  getPlaylistById: getPlaylistById
};