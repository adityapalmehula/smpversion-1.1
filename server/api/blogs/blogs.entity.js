const appConfig = require('../../constants').app;
const mongoose = require('mongoose');

/* This is a blog Schema  */

const blogSchema= new mongoose.Schema({
		 keyword: {
        type: String,
        required: true,
    },
		description: {
        type: String,
        required: true,
    },
    	title: {
        type: String,
        required: true,
    },
    	url: {
        type: String,
        required: true,
    },
    	content: {
        type: String,
        required: true,
    },
    status: {
        type: String,
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
    createdBy : {
        type: String
    },
    createdName : {
         type: String
    },
    comments:[{
        commentedBy:{
            type:String,
            required: true
        },
        commentedEmail:{
            type:String,
            required: true
        },
        comment:{
            type:String,
            required: true
        },
        commentDate:{
            type:Date,
            default:Date.now
        },
        status:{
            type:String,
            default: appConfig.BLOG_COMMENT.STATUS[0]
        },
    }]
},
     {
    	collection:'blog'
  });

module.exports = mongoose.model('blog', blogSchema);