const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('../../constants').app;

let assignCourseSchema = new Schema ({
	studentId : { 
		required: true,
		type : String
	},
	rating: Number,
	courseId : { 
		required: true,
		type : Schema.Types.ObjectId,
		ref : 'courses'
	},
	status: { 
		type : String,
		default: appConstant.LEARNING_PROGRESS_STATUS[0], 
	},
	topics:[
	{
		topicId: { 
			type: Schema.Types.ObjectId,
			ref: 'topics'
		},
		status: { 
			type : String,
			default: appConstant.LEARNING_PROGRESS_STATUS[0], 
		},
		subtopics: [{
			subtopicId: { 
				type: Schema.Types.ObjectId,
				ref: 'subtopics'
			},
			status: { 
				type : String,
				default: appConstant.LEARNING_PROGRESS_STATUS[0], 
			},
			learningPaths :[{
				contentId:Schema.Types.ObjectId,
				status : { 
					type : String,
					default: appConstant.LEARNING_PROGRESS_STATUS[0], 
				}
			}]
		}]
	}]
});

assignCourseSchema.index({ studentId: 1, courseId: 1}, { unique: true });
module.exports = mongoose.model('assignCourses', assignCourseSchema);