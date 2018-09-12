const logger = require('./../../../services/app.logger');
const loggerConstants = require('./../../../constants/logger');
const appConstants = require('./../../../constants/app');
var request = require('request');


// Save playlist Video
const searchVideos = function(searchText) {
    
    // insert the data into db using promise
    return new Promise((resolve, reject) => {
    	resolve({data : 'called', msg:'success'});
        // request.post(appConstants.VIMEO.UNAUTHTOKEN_API_URL, {"grant_type":"client_credentials","scope":"public private"},{ 'Authorization': 'basic ' +appConstants.VIMEO.VIMEO_UNAUTHTOKEN_AUTHORIZATION_HEADER })
        // .on('response', function(response) {
   
        // })
        
            // videoData.save(function(err, data) {
            //     if (err) {
            //         logger.error(loggerConstants.PLAYLIST_VIDEO_NOT_SAVED + ':' + err);
            //         reject({ success: false, msg: loggerConstants.PLAYLIST_VIDEO_NOT_SAVED });
            //     } else {
            //         Playlists.findOneAndUpdate({ '_id': playlistId }, {
            //             $push: {
            //                 videos: data._id
            //             }
            //         }, (err, data) => {
            //             if (err) {
            //                 logger.error({ success: false, msg: loggerConstants.VIDEO_ID_NOT_SAVED_IN_PLAYLIST })
            //                 reject({ success: false, msg: loggerConstants.VIDEO_ID_NOT_SAVED_IN_PLAYLIST });

            //             } else {
            //                 logger.debug({ success: true, msg: loggerConstants.PlAYLIST_VIDEO_SUCCESSFULLY_SAVED })
            //                 resolve({ success: true, msg: loggerConstants.PlAYLIST_VIDEO_SUCCESSFULLY_SAVED });

            //             }
            //         })
            //     }
            // });

    });
}



module.exports = {
    searchVideos: searchVideos,
}