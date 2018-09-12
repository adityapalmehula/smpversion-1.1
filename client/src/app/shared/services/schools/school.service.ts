import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'

@Injectable()
export class SchoolService{

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }

  // post request to server
  save(data:any) {
    return this.http.post(AppConfig.API_HOST+'/api/schools',data,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  //get reqest for all school
  getSchools(queryFilter: any={}) {
    return this.http.get(AppConfig.API_HOST+'/api/schools',this.authorizationService.authorization(queryFilter))
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  //get school data by id
  getSchool(id) {
    return this.http.get(AppConfig.API_HOST+'/api/schools/'+id,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

   //get school data by login Id
   getSchoolData() {
     return this.http.get(AppConfig.API_HOST+'/api/schools/schoolId',this.authorizationService.authorization())
     .map(data=>data.json(),
       (error:any)=>error.json());
   }

  // update school data
  update(data,id) {
    return this.http.put(AppConfig.API_HOST+'/api/schools/'+id,data,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  // delete school data
  deleteSchool(schoolId) {
    return this.http.delete(AppConfig.API_HOST+'/api/schools/'+schoolId,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json())
  }

  //get schools for filters
  getSchoolsFilter() {
    return this.http.get(AppConfig.API_HOST+'/api/schools/filter',this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }



 // update school data
 updateAssignCategories(data,id){
   return this.http.put(AppConfig.API_HOST+'/api/schools/assign/categories/'+id,data,this.authorizationService.authorization())
   .map(data=>data.json(),
     (error:any)=>error.json())
 }

//get assign categories by school id
getAssignCategories(id){
  return this.http.get(AppConfig.API_HOST+'/api/schools/assign/categories/'+id,this.authorizationService.authorization())
  .map(data=>data.json(),
    (error:any)=>error.json());
}


}