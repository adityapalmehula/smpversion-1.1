const appConstants = require('./../../../constants/app');

let constants = {
	title : {
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	},
	url : {
		validate:  {
			validator: function(v) {
				return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(v);
			},
			message: '{VALUE} is not a valid URL!'
		},
		required: [true, 'URL required']
	},
	status: {
		enum: appConstants.CONTENT_STATUS
	}
}
module.exports = constants