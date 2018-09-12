const conatct = require('./contact.entity');
const logger = require('./../../services/app.logger');
const validation=require('./../../common/validation');

const insertContact = function(contactObj) {
    logger.debug('Get contactObj and store into blogDetails', contactObj);
    var contactDetails = {
        name:contactObj.name,
        email:contactObj.email,
        phone:contactObj.phone,
        message:contactObj.message,
        createdOn:Date.now(),
            };
   let contactData = new conatct(contactDetails);
  return new Promise((resolve, reject) => {
        contactData.save(function(err, data) {
            if (err) {
                logger.error('contactObj not added sucessfully' + err);
                reject(err);
            } else {
                resolve({ success: true, msg: 'Conatct info is successfully saved' });
            }
        });
    });

}

module.exports = {
    insertContact: insertContact
};