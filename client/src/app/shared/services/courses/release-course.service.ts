import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service';

@Injectable()
export class ReleaseCourseService {

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }

  // get all release courses
  getReleaseCourses(queryFlag:string) {
    return this.http.get(AppConfig.API_HOST+'/api/courses/releaseCourses?q='+queryFlag,this.authorizationService.authorization())
    .map(data => data.json(), (error: any) => error.json());
  }

 // get release course details by course id
 getReleaseCourseDetails(courseId:string, queryFlag:string) {
   return this.http.get(AppConfig.API_HOST+'/api/courses/releaseCourses/'+courseId+'?q='+queryFlag,this.authorizationService.authorization())
   .map(data => data.json(), (error: any) => error.json());
 }

  // get release courses details for filters
  getCoursesWithSubCategory(queryParam:string) {
    return this.http.get(AppConfig.API_HOST+'/api/courses/releaseCourses/filters?q='+queryParam,this.authorizationService.authorization())
    .map(data => data.json(), (error: any) => error.json());
  }

}
