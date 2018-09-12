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
		enum: appConstants.CONTENT_STATUS
	},
	courseId : {
		required: [true, 'Course Id is required for subtopics']
	},
	topicId : {
		required: [true, 'Topic Id is required for subtopics']
	},
	learningPaths : [{
		title:  {
			minlength:[10, 'Minimum length should be 10'],
			maxlength:[30, 'Maximum length should be 30'],
		},
		mainContent: {
			type: {
				enum:appConstants.CONTENTS
			},
			title: {
				minlength:[10, 'Minimum length should be 10'],
				maxlength:[30, 'Maximum length should be 30'],
			},
		},
		otherContents :[
		{
			type: {
				enum:appConstants.CONTENTS
			},
			title: {
				minlength:[10, 'Minimum length should be 10'],
				maxlength:[30, 'Maximum length should be 30'],
			},
		}],
	}],
}

module.exports = constants;