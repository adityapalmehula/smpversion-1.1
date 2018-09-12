const appConstants = require('../../constants/app');
//const appConstant = require('../../constants').app;

let constants = {
  address1 : {
    minlength:[5, 'Minimum length should be 2'],
    maxlength:[200, 'Maximum length should be 200'],
  },
  city : {
    minlength:[2, 'Minimum length should be 2'],
    maxlength:[50, 'Maximum length should be 50'],
  },
  state : {
    minlength:[2, 'Minimum length should be 2'],
    maxlength:[50, 'Maximum length should be 50'],
  },
  pincode : {
    maxlength:[6, 'Maximum length should be 6'],
  },
  country : {
    minlength:[2, 'Minimum length should be 2'],
    maxlength:[50, 'Maximum length should be 50'],
  }
}

let academicinfo = {
  instituteName : {
    minlength:[2, 'Minimum length should be 2'],
    maxlength:[100, 'Maximum length should be 100'],
  },
  instituteAddress : {
    minlength:[5, 'Minimum length should be 5'],
    maxlength:[200, 'Maximum length should be 200'],
  },
  fieldStudy : {
    minlength:[2, 'Minimum length should be 2'],
    maxlength:[100, 'Maximum length should be 100'],
  },
  description : {
    minlength:[3, 'Minimum length should be 3'],
    maxlength:[200, 'Maximum length should be 200'],
  }
}

let profileUrlsinfo ={
     socialUrl : {
    minlength:[2, 'Minimum length should be 2'],
    maxlength:[100, 'Maximum length should be 100'],
          }
  }

module.exports = { 
  constants: constants,
  academicinfo: academicinfo,
  profileUrlsinfo: profileUrlsinfo
}