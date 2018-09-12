import { Injectable, EventEmitter } from '@angular/core';
import { Http,  Response, Headers, RequestOptions  } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { CommonConfig } from './../../config/common-config.constants';
import { AuthorizationService } from './../common/authorization.service'
import { AuthenticationService } from './../../services/common/authentication.service';



@Injectable()
export class ProfileService {
  public updateProfile: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    private autenticationService: AuthenticationService,
    ) {}
 

 // getCountries(){
 //   return this.http.get(AppConfig.API_HOST + "/api/profiles/country",this.authorizationService.authorization()).map(data=>{
 //    return data.json();
 //  })
 // }

	// service method to upload image
	uploadFile(imageData) {
  return this.http.put(AppConfig.API_HOST + "/api/profiles/image", imageData,this.authorizationService.authorization()).map(data=>
    data.json(),
    (error:any)=>error.json());

  }
// update basic info of user
updateBasicInfo(basicInfo) {
  return this.http.put(AppConfig.API_HOST+"/api/profiles",basicInfo,this.authorizationService.authorization()).map(data=>{
    return data.json();
  }, (error:any)=>
  error.json());
}

// Change Password
changePassword(passwordData) {
  return this.http.put(AppConfig.API_HOST + "/api/users/change-password",passwordData,this.authorizationService.authorization()).map(data=>{
    return data.json();
  })
}

// User Address update
profileAddress(addressData){
  return this.http.put(AppConfig.API_HOST + "/api/profiles/address",addressData,this.authorizationService.authorization()).map(data=>{
    return data.json();
  })
}

// Academic Info of user
academicDetails(academicData){
  return this.http.put(AppConfig.API_HOST + "/api/profiles/academicInfo",academicData,this.authorizationService.authorization()).map(data=>{
    return data.json();
  })
}

// social profile address Update
socaialProfileData(socailprofileData){
  return this.http.put(AppConfig.API_HOST + "/api/profiles/socailInfo",socailprofileData,this.authorizationService.authorization()).map(data=>{
    return data.json();
  })
}
// social profile url delete
deleteSocialUrl(selectedUrl){
   return this.http.delete(AppConfig.API_HOST+'/api/profiles/'+selectedUrl._id,this.authorizationService.authorization()).map(data=>{
    return data.json();
  })
}

// Edit Social Profile urls 
editSocialUrl(editedUrls){
   return this.http.put(AppConfig.API_HOST+'/api/profiles/editSocailInfo',editedUrls,this.authorizationService.authorization()).map(data=>{
    return data.json();
  })
 }

/* get user detail */
getDetails(){
   return this.http.get(AppConfig.API_HOST + "/api/profiles",this.authorizationService.authorization()).map(data=>{
    return data.json();
  })
 }
}