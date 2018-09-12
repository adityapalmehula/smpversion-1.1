const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('./../../constants/app');
const constants = require('./program.config');
const projects  = require('../projects/project.entity');

const ProgramSchema = new Schema({
    code: {
        type: String,
        required: constants.code.required,
        minlength: constants.code.minlength,
        maxlength: constants.code.maxlength
    },
    version: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: constants.title.required,
        minlength: constants.title.minlength,
        maxlength: constants.title.maxlength,
    },
    description: {
        type: String,
        required: constants.description.required,
        minlength: constants.description.minlength,
        maxlength: constants.description.maxlength
    },
    programNeed: {
        type: String,
        required: constants.programNeed.required,
        minlength: constants.programNeed.minlength,
        maxlength: constants.programNeed.maxlength
    },
    icon: {
        type: String
    },
    duration: {
        type: Number,
        default: 0
    },
    effort: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        default: appConstant.CONTENT_STATUS[0]
    },
    tags: [{
        type: String,
        required: constants.tags.required
    }],
    projectData: [{
        contentId: { type: Schema.Types.ObjectId, ref: 'projects'},
        title: { type: String },

    }],
    courseData: [{
        contentId: { type: Schema.Types.ObjectId, ref: 'courses'},
        title: { type: String },
    }],
    isPaid: {
        type: Boolean,
        enum: constants.isPaid.enum
    },
    price: {
        offered: {
            type: String,
           // validate: constants.price.offered.validate
        },
        actual: {
            type: String,
            required: constants.price.actual.required
        },
        discount: {
            type: Number,
            validate: constants.price.discount.validate
        }
    },
    currency: { 
    	     type: String,
    	     enum:constants.currency.enum, 
    	   },
    activationMethod: 
          { 
          type: String,
          enum:constants.activationMethod.enum 
          }, // Promotion/Paid
    workFlows: [{
        id: { type: Schema.Types.ObjectId, ref: 'users' },
        role: { type: String },
        name: { type: String },
        date: { type: Date },
        statusFrom: { type: String },
        statusTo: { type: String },
        comment: { type: String }
    }],
    createdBy: {
        id: { type: Schema.Types.ObjectId, ref: 'users' },
        role: { type: String },
        name: { type: String },
        date: { type: Date, default: Date.now }
    },
    updatedBy: {
        id: { type: Schema.Types.ObjectId, ref: 'users' },
        role: { type: String },
        name: { type: String },
        date: { type: Date }
    },
    deletedBy: {
        id: { type: Schema.Types.ObjectId, ref: 'users' },
        role: { type: String },
        name: { type: String },
        date: { type: Date }
    }
});

const Programs = mongoose.model('programs', ProgramSchema);

module.exports = Programs;