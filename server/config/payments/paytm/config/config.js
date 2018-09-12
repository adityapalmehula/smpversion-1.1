var appConstants = require('../../../../constants/app');
var apps = appConstants.APPS;
var apiHost = appConstants.APIHOST;

var MERCHANT = { };
	MERCHANT[apps[0]] = { // smartpathshala
		MID : 'KNIGHT49765528155326',
		PAYTM_MERCHANT_KEY : '4AAodi20cKiFU&6l',
		WEBSITE : 'WEBSTAGING',
		CHANNEL_ID : 'WEB',
		INDUSTRY_TYPE_ID : 'Retail',
		TXN_REQ_API : 'https://securegw-stage.paytm.in/theia/processTransaction',
		TXN_STATUS_API : 'https://securegw-stage.paytm.in/merchant-status/getTxnStatus',
		CALLBACK_URL : apiHost+'/api/orders/checkout'
	},
	MERCHANT[apps[1]] = { // codestrippers
		MID : 'KNIPLS95057888899951',
		PAYTM_MERCHANT_KEY : 'nCjm5ZOvm@t!Zka!',
		WEBSITE : 'WEBSTAGING',
		CHANNEL_ID : 'WEB',
		INDUSTRY_TYPE_ID : 'Retail',
		TXN_REQ_API : 'https://securegw-stage.paytm.in/theia/processTransaction',
		TXN_STATUS_API : 'https://securegw-stage.paytm.in/merchant-status/getTxnStatus',
		CALLBACK_URL : apiHost+'/api/orders/checkout'
	}
	 

// var MID = 'KNIPLS95057888899951';
// var PAYTM_MERCHANT_KEY = 'nCjm5ZOvm@t!Zka!';
// var PAYTM_ENVIORMENT = 'TEST';   // PROD FOR PRODUCTION
// var WEBSITE = 'WEBSTAGING';
// var CHANNEL_ID =  'WEB';
// var INDUSTRY_TYPE_ID = 'Retail';
// var PAYTM_FINAL_URL = '';
// if (PAYTM_ENVIORMENT== 'TEST') {
//   PAYTM_FINAL_URL = 'https://securegw-stage.paytm.in/theia/processTransaction';
// }else{
// }

module.exports = {
	MERCHANT : MERCHANT
    // MID: MID,
    // PAYTM_MERCHANT_KEY :PAYTM_MERCHANT_KEY,
    // PAYTM_FINAL_URL :PAYTM_FINAL_URL,
    // WEBSITE: WEBSITE,
    // CHANNEL_ID: CHANNEL_ID,
    // INDUSTRY_TYPE_ID: INDUSTRY_TYPE_ID

};
