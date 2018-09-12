const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('./../../constants/app');
const constants = require('./instructor.config');
const backendvalidation = require('./reference.config');

const InstructorSchema = new Schema({
      // userId : {type : String, unique : true, required : true},
      name: { 
        type: String,
        required: constants.name.required
      },
      email: { 
        type: String,
        unique : true,
        required : true,
        validate: constants.email.validate
      },
      mobile: { 
        type: String,
        validate: constants.mobile.validate
      },
      platform: {
      type: String,
    },
      gender: {
       type: String,
       enum: constants.gender.enum
     },
 address :{
  address: { 
    type: String,
    minlength: backendvalidation.constants.address1.minlength,
    maxlength: backendvalidation.constants.address1.maxlength
     },
  city: { 
    type: String,
    minlength: backendvalidation.constants.city.minlength,
    maxlength:backendvalidation.constants.city.maxlength
     },
  state: { 
    type: String,
    minlength: backendvalidation.constants.state.minlength,
    maxlength: backendvalidation.constants.state.maxlength
     },
  pincode: { 
    type: String,
    maxlength: backendvalidation.constants.pincode.maxlength
     },
  country: { 
    type: String,
    minlength: backendvalidation.constants.country.minlength,
    maxlength: backendvalidation.constants.country.maxlength
     }
 },
  academicDetails: {
    qualification :{
      type: String
    },
     instituteName :{
      type: String,
      minlength: backendvalidation.academicinfo.instituteName.minlength,
      maxlength: backendvalidation.academicinfo.instituteName.maxlength
    },
     instituteAddress :{
      type: String,
       minlength: backendvalidation.academicinfo.instituteAddress.minlength,
       maxlength: backendvalidation.academicinfo.instituteAddress.maxlength
    },
    //  startDate :{
    //   type: String
    // },
    //  endDate :{
    //   type: String
    // },
    //  fieldStudy :{
    //   type: String,
    //    minlength: backendvalidation.academicinfo.fieldStudy.minlength,
    //    maxlength: backendvalidation.academicinfo.fieldStudy.maxlength
    // },
    //  description :{
    //   type: String,
    //    minlength: backendvalidation.academicinfo.description.minlength,
    //    maxlength: backendvalidation.academicinfo.description.maxlength
    // },
  },
  profileUrls: [{
    platform :{
      type: String
    },
    socialUrl :{
      type: String,
      minlength: backendvalidation.profileUrlsinfo.socialUrl.minlength,
      maxlength: backendvalidation.profileUrlsinfo.socialUrl.maxlength
    }
  }],
    isFlockJoined: { 
      type: Boolean,
    },
    profilePic : {
      type : String,
    },
      status: { type: String, required: true, default: appConstant.USER_DETAILS.USER_STATUS[0] }, // Active/ Inactive/ Deleted
      role : {type: String, required: true, default: appConstant.USER_DETAILS.USER_ROLES[1]}, // by default Instructor
      createdBy: {
       id: { type: Schema.Types.ObjectId, ref: 'users'},
       role: { type : String },
       name: { type: String },
       date: { type: Date, default: Date.now }
     }, 
     // updatedBy:{
     //   id: { type: Schema.Types.ObjectId, ref: 'users'},
     //   role: { type : String },
     //   name: { type: String },
     //   date: { type: Date }
     // },
     updatedBy: [{
			 id: { type: Schema.Types.ObjectId, ref: 'users'},
			 role: { type : String },
			 name: { type: String },
			 date: { type: Date }
			}],
     deletedBy:{
       id: { type: Schema.Types.ObjectId, ref: 'users'},
       role: { type : String },
       name: { type: String },
       date:{ type: Date }
     }
   },{collection:"instructor"});


const Instructor = mongoose.model('instructor', InstructorSchema);

module.exports = Instructor;
