const router = require('express').Router();
const logger = require('../../services/app.logger');
const playlistCtrl = require('./playlist.controller');
const loggerConstants= require('./../../constants/logger');


// Add new playlist
router.post('/', function(req, res) {
  let playlistData = req.body;
  let createdId = req.decoded.userId;
  let role = req.decoded.role;

  logger.debug(loggerConstants.GET_OBJECT_AND_STORE_PLAYLISTDATA);
  try {
    if (!playlistData) {
      logger.error(loggerConstants.PLAYLISTDATA_NOT_FOUND);
      return res.status(500).send({ error:loggerConstants.PLAYLISTDATA_NOT_FOUND });
    }

    playlistCtrl.addPlaylist(playlistData, createdId, role).then((successResult) => {
      logger.info(loggerConstants.PLAYLISTDATA_SUCCESSFULLY_SAVED);
      return res.status(201).send(successResult);
    }, (errResult)=> {
            // Log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
          });
  } catch (err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });

// Update playlist by playlist id
router.put('/:playListID', function (req, res) {
  let playlistData = {playListID: req.params.playListID, data: req.body};
  logger.debug(loggerConstants.GET_PARAMETER_VALUE_AND_STORE_INTO + ' : playlistData');

  try {
    playlistCtrl.editplayList(playlistData).then((successResult) => {
      logger.info(loggerConstants.DATA_SUCCESSFULLY_UPDATED);
      return res.status(201).send(successResult);
    }, (errResult) => {
            //log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult);
            return res.status(403).send(errResult);
          });
  }
  catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
      }
    });

// Delete playlist by id
router.delete('/:playListID', function (req, res) {
  let playListID = req.params.playListID;
  logger.debug(loggerConstants.GET_PARAMETER_VALUE_AND_STORE_INTO + ' : playListID');
  try {
    playlistCtrl.deletePlayList(playListID).then((successResult) => {
      logger.info(loggerConstants.DATA_DELETED_FROM_PLAYLIST);
      return res.status(201).send(successResult);
    }, (errResult) => {
            //log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
          });
  }
  catch(err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
      }
    });


//Get playlist by playlist id
router.get('/:playlistId', (req, res)=> {
  let playlistId = req.params.playlistId;
  try {
    if(!playlistId) {
      logger.error(loggerConstants.MISSING_EXPECTED_INPUT);
      return res.status(400).send({success: false, msg: loggerConstants.MISSING_EXPECTED_INPUT});
    }else {
      playlistCtrl.getPlaylistById(playlistId).then((successResult) => {
        logger.info(successResult.msg+" for playlist by playlist id: "+playlistId);
        return res.status(200).send(successResult);
      }, (errResult)=> {
        logger.error(errResult.msg || errResult.stack || errResult+" for playlist by playlist id: "+playlistId);
        return res.status(417).send(errResult);
      });
    }
  } catch(err) {
   logger.error(loggerConstants.INTERNAL_SERVER_ERROR+ " in get playlist by playlist id: "+playlistId+" "+err.stack || err);
   return res.status(500).send({ msg: loggerConstants.INTERNAL_SERVER_ERROR });
 }
});

// Add items to playlist by owner
router.put('/', function(req, res) {
  let playlistData = req.body;
  let owner = req.decoded.username;

  logger.debug(loggerConstants.GET_OBJECT_AND_STORE_PLAYLISTDATA);
  try {
    if (!playlistData) {
      logger.error(loggerConstants.PLAYLISTDATA_NOT_FOUND);
      return res.status(500).send({ error:loggerConstants.PLAYLISTDATA_NOT_FOUND});
    }

    playlistCtrl.addItemsToPlaylist(owner, playlistData).then((successResult) => {
      logger.info(loggerConstants.PLAYLISTITEM_SUCCESSFULLY_SAVED);
      return res.status(201).send(successResult);
    }, (errResult)=> {
            // Log the error for internal use
            logger.error(loggerConstants.PROBLEM_OCCURED + ' : '+ errResult.msg);
            return res.status(403).send(errResult);
          });
  } catch (err) {
        // Log the Error for internal use
        logger.fatal(err.stack || err);
        res.status(500).send({ success:false, msg: err });
        return;
      }
    });

// Get all plalist by owner
router.get('/myplaylist', function (req, res) {
  try {
    let createrId = req.decoded.userId;
    let role = req.decoded.role;

    playlistCtrl.getPlaylists(createrId, role).then((successResult) => {
      return res.status(201).send({ success: true, playLists: successResult, playListsCount:successResult.length});
    }, (errResult) => {
     return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
   });
  } catch (err) {
    logger.error('Exception occurred' + err);
    res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
    return;
  }
});




// Delete playlistItem by id
router.delete('/:playListID/playlistItem/:playListItemID', function (req, res) {
  let playListID = req.params.playListID;
  let playListItemID=req.params.playListItemID;
  logger.debug('Get params value and store into playListID');
  try {
    playlistCtrl.deletePlayListItem(playListID,playListItemID).then((successResult) => {
      logger.info('Get successResult successfully and return back');
      return res.status(201).send(successResult);
    }, (errResult) => {
      logger.error('Internal error occurred');
      return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
    });
  } catch (err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
      }
    });




// Update play item in playlist
router.put('/:playListID/playlistItem', function (req, res) {
  let playListId=req.params.playListID
  let playlistItemData =req.body;
  logger.debug('Get request value and store into playlistItemData');
  try {
    playlistCtrl.updatePlayListItem(playListId,playlistItemData).then((successResult) => {
      logger.info('Get successResult successfully and return back');
      return res.status(201).send(successResult);
    }, (errResult) => {
            // Log the error for internal use
            logger.error('Internal error occurred');
            return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
          });
  } catch (err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
      }
    });


// router.get('/:kenlistID/discussions', function (req, res) {
//   let kenlistId = req.params.kenlistID;
//   logger.debug('Get params value and store into kenlistId');
//      try {
//         playlistCtrl.getKenlistDisucssions(kenlistId).then((successResult) => {
//             return res.status(201).send(successResult);
//         }, (errResult) => {
//             // Log the error for internal use
//             return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
//         });
//     } catch (err) {
//         // Log the Error for internal use
//         res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
//         return;
//     }
// });





module.exports = router;
