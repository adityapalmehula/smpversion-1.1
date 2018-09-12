import { Injectable, EventEmitter } from '@angular/core';
import { Http,  Response, Headers, RequestOptions  } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { CommonConfig } from './../../config/common-config.constants';
import { AuthorizationService } from './../common/authorization.service'
import { AuthenticationService } from './../../services/common/authentication.service';

@Injectable()
export class ClassService {
  public updateProfile: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    private autenticationService: AuthenticationService,
    ) {}

 //get classes by school id
 getClassesBySchool(){
   return this.http.get(AppConfig.API_HOST + "/api/classes/",this.authorizationService.authorization())
   .map(data=> data.json(),error=> error.json());
 }

 //update teacher data
 assignCourses(id,courses) {
   return this.http.put(AppConfig.API_HOST+'/api/classes/assignCourses/'+id,courses,this.authorizationService.authorization())
   .map(data=>data.json(),error=>error.json());
 }

}