const appConstant = require('../constants').app;

const validationForm=function(data){
  let ifError = false;
  Object.keys(data).filter(function(d){
   if(data[d] === ''|| data[d] === null) {
    ifError = true;


  }   	
});
  return ifError;
}

const addressvalidationForm=function(data){
  let ifError = false;
  Object.keys(data).filter(function(d){
   if(data[d] === ''|| data[d] === null) {
    console.log("finding validation"+d)
    ifError = true;

    if(d === 'address2' && data[d] === ''){
       console.log("finding validation2"+data[d])
      ifError = false;
     
    }
    
  }     
});
  return ifError;
}

/* form validation */
const formValidation = (error)=>{
 let errorKeys= Object.keys(error.errors);
 let errorObj= errorKeys.map((data,index)=>{
  return { [data]:error.errors[data].message}
})
 return {success:false, msg:'Schema valdation Failed',data:errorObj}
}

const isAuthorized=function(createdBy, userId, userRole, entityStatus, reqType,message){
  let reqTypes = appConstant.reqTypes;
  let res = {
    status : false,
    message :''
  }
  if(userRole === appConstant.USER_DETAILS.USER_ROLES[0]){
    if (reqType === reqTypes[0]) {
      res.status = true;
      return res;
    } else if((reqType === reqTypes[1]) && (entityStatus === appConstant.CONTENT_STATUS[0] || entityStatus === appConstant.CONTENT_STATUS[4])) {
      res.status = true;
      return res;
    } else {
      res.status = false;
      res.message = message;//'Only drafted or rejected course can be updated';
      return res;
    }
  } else if((userRole === appConstant.USER_DETAILS.USER_ROLES[1] && createdBy.id == userId) && (entityStatus === appConstant.CONTENT_STATUS[0] || entityStatus === appConstant.CONTENT_STATUS[4])){
    res.status = true;
    return res;
  } else {
    res.status = false;
    res.message = 'You have no rights to modify';
    return res;
  }
}
const isValidEmail=email=> /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(email);
const isNumber=value=> /^[0-9]+$/.test(value);
const isOnlyAlpahabetic=str=> /^[a-zA-Z ]+$/.test(str);
const isValidMobNo=mobNo=> /(7|8|9)\d{9}$/.test(mobNo);


/* form validation */
// const formValidation = (error)=>{
//  let errorKeys= Object.keys(error.errors);
//  return errorKeys.map((data,index)=>{
//   return {[data]:error.errors[data].message};
// })
// }


module.exports={
  validationForm: validationForm,
  addressvalidationForm:addressvalidationForm,
  isValidEmail: isValidEmail,
  isNumber: isNumber,
  isOnlyAlpahabetic: isOnlyAlpahabetic,
  isValidMobNo: isValidMobNo,
  formValidation: formValidation,
  isAuthorized: isAuthorized,
}	