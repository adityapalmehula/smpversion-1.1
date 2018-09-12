const appConstants = require('./../../constants/app');

let constants = {
	title : {
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	},
	description : {
		minlength:[10, 'Minimum length should be 10'],
		maxlength:[1000, 'Maximum length should be 1000'],
	},
	status : {
		enum:appConstants.CONTENT_STATUS
	},
	solutions : {
		title : {
			minlength: [10, 'Minimum length should be 10'],
			maxlength: [30, 'Maximum length should be 30'],
		},
		path : {
			required: [true, ' path is required for solutions']
		},
		extension :{
			enum: ['pdf'],
		},
		status : {
			enum:appConstants.CONTENT_STATUS
		}
	}
}

module.exports = constants;