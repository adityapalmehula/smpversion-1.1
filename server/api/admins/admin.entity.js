const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('../../constants').app;
const backendvalidation = require('./reference.config');

const AdminSchema = new Schema({
      name:String,
      email:{type : String, unique : true, required : true},
      mobile:String,
      gender:String,
      platform: {
      type: String,
    },
 address :{
  address1: { 
    type: String,
    minlength: backendvalidation.constants.address1.minlength,
    maxlength: backendvalidation.constants.address1.maxlength
     },
  address2: { 
    type: String 
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
     fieldStudy :{
      type: String,
       minlength: backendvalidation.academicinfo.fieldStudy.minlength,
       maxlength: backendvalidation.academicinfo.fieldStudy.maxlength
    },
     description :{
      type: String,
       minlength: backendvalidation.academicinfo.description.minlength,
       maxlength: backendvalidation.academicinfo.description.maxlength
    },
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
 address :{
  address1: { 
    type: String,
    minlength: backendvalidation.constants.address1.minlength,
    maxlength: backendvalidation.constants.address1.maxlength
     },
  address2: { 
    type: String 
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
      minlength: backendvalidation.academicinfo.instituteAddress.minlength,
      maxlength: backendvalidation.academicinfo.instituteAddress.maxlength,
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
     fieldStudy :{
      type: String,
       minlength: backendvalidation.academicinfo.fieldStudy.minlength,
       maxlength: backendvalidation.academicinfo.fieldStudy.maxlength
    },
     description :{
      type: String,
       minlength: backendvalidation.academicinfo.description.minlength,
       maxlength: backendvalidation.academicinfo.description.maxlength
    },
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
      profilePic : {
        type : String,
      },
      extension: String,
      status: { type: String, required: true, default: appConstant.USER_DETAILS.USER_STATUS[0] }, // Active/ Inactive/ Deleted
      regDate: { type: Date, default: Date.now },
      creationDate : {type : Date , default : Date.now},
      updationDate : {type : Date },
    },{collection:"admins"});

const Admin = mongoose.model('admins', AdminSchema);

module.exports = Admin;
