import { Injectable } from '@angular/core';
import { Http,  Response, Headers,  } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'


@Injectable()
export class AssignCourseService {
  
  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) {}

  // Set learning status
  setLearningStatus(data) {
    return this.http.put(AppConfig.API_HOST + '/api/assign/courses/learningStatus', data, this.authorizationService.authorization())
    .map(data=> data.json(),
      (error:any)=>error.json());
  }

  //request to rate assign courses 
  rateAssignCourse(courseId: string, ratingData: any) {
    return this.http.put(AppConfig.API_HOST+'/api/students/mycourses/'+courseId+'/rating',ratingData,this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json())
  }

  //get assign course progress for student
  getAssignCourseStatus(courseId:string) {
    return this.http.get(AppConfig.API_HOST+'/api/assign/courses/'+courseId,this.authorizationService.authorization())
    .map(data=> data.json(),error=> error.json());
  }

}
