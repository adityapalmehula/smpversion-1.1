const appConstants = require('./../../../constants/app');

let constants = {
	title : {
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	},
	description : {
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[1000, 'Maximum length should be 1000'],
	},
	url : {
		validate:  {
			validator: function(v) {
				return /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(v);
			},
			message: '{VALUE} is not a valid URL!'
		},
		required: [true, 'URL required']
	},
	videoId :{
		required : [true , 'Video Id is required']
	},
	status: {
		enum: appConstants.CONTENT_STATUS
	},
	thumbnail : {
		required : [true , 'Thumbnail is required']
	}
}
module.exports = constants