const appConstants = require('./../../../constants/app');

let constants = {
	title : {
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	},
	path : {
		required : [true, 'File path is required'],
	},
	extension : {
		enum : ['jpg', 'jpeg', 'png', 'pdf']
	},
	status: {
		enum: appConstants.CONTENT_STATUS
	}
}
module.exports = constants