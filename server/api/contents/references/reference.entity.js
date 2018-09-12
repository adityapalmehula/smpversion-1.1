const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('./reference.config');

const ReferencesSchema = new Schema({
	title:{
		type: String,
		minlength: constants.title.minlength,
		maxlength:constants.title.maxlength
	},
	url:{
		type: String,
		validate:constants.url.validate
	},
	status : {
		type: String,
		enum: constants.status.enum,
	},
	type : String,
	likes: { type: Number, default: 0 },
	dislikes: { type: Number, default: 0 },
	ratings: { type: Number, default: 0 },
	createdBy: {
		id: { type: Schema.Types.ObjectId, ref: 'users'},
		role: { type : String },
		name: { type: String },
		date: { type: Date, default: Date.now }
	}, 
	updatedBy: {
		id: { type: Schema.Types.ObjectId, ref: 'users'},
		role: { type : String },
		name: { type: String },
		date: { type: Date }
	},
	deletedBy: {
		id: { type: Schema.Types.ObjectId, ref: 'users'},
		role: { type : String },
		name: { type: String },
		date:{ type: Date }
	}
});

const References = mongoose.model('references', ReferencesSchema);

module.exports = References;
