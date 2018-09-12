const countryModel = require('./country.entity');
const loggerConstants = require('./../../constants/logger').BASICPROFILE;
//const countryModel = require('./../country/country.entity')

function getCountry() {
    //let UserSchRef = userController.getUserModel(role);
    return new Promise((resolve, reject) => {
        countryModel.find({},(err, data) => {
            if (err) {
                logger.error(err.message)
                reject({ msg: loggerConstants.INTERNAL_ERROR });
            } else if (!data) {
                reject({ success: false, msg: loggerConstants.WE_COULD_NOT_FOUND_AN_ACCOUNT_ASSOCIATED_WITH + _id })
            } else {
                resolve({ success: true, msg: loggerConstants.DATA_GET_SUCCESSFULLY, data: data })
            }
        });
    });
}

module.exports = {
	 getCountry:getCountry,
}