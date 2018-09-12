import { Injectable } from '@angular/core';
import { Http, Response, Headers,URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { RequestOptions, Request, RequestMethod } from '@angular/http';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service';
import { AuthenticationService } from './../../services/common/authentication.service';


@Injectable()
export class ProgramService {
  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    private router: Router,
    private autenticationService: AuthenticationService,
    ) { }

// get project data from detail page 
getProjectsAndCourses(programId){
	return this.http.get(AppConfig.API_HOST+'/api/programs/projects/'+programId,this.authorizationService.authorization()).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    });
}

// add program data to database
addProgram(formData)
{
	let headers = new Headers();
  headers.append('enctype', 'multipart/form-data');
  headers.append('Accept', 'application/json');
  headers.append('Authorization', this.autenticationService.getToken());
  let options = new RequestOptions({ headers: headers });
  return this.http.post(AppConfig.API_HOST+'/api/programs',formData, options).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}
// fetching Programs data from db
fetchPrograms()
{
  return this.http.get(AppConfig.API_HOST+'/api/programs',this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

//update Project
  updateProgram(formData,programId){
    // let projectDetail=JSON.stringify(data);
    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', this.autenticationService.getToken());
    // headers.append('projectData',projectDetail);
    let options = new RequestOptions({ headers: headers });  
    return this.http.put(AppConfig.API_HOST+'/api/programs/'+programId,formData,options).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }


// fetch program details on basis of id
getProgramData(_id){
  return this.http.get(AppConfig.API_HOST+'/api/programs/'+_id,this.authorizationService.authorization()).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    });
}

//Delete program
  deleteProgram(programId) {
    return this.http.delete(AppConfig.API_HOST+'/api/programs/'+programId,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }


//update project status based on id
updateProgramStatus(programId: string, statusDetails:any ) {
    return this.http.put(AppConfig.API_HOST+'/api/programs/status/'+programId,statusDetails,this.authorizationService.authorization()).map(data =>
      data.json(), (error: any)=>error.json());
  }

}
