import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service';

@Injectable()
export class ReleaseProjectService {

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }

  // get all release projects
  getReleaseProjects(queryFlag:string) {
    return this.http.get(AppConfig.API_HOST+'/api/projects/releaseProjects?q='+queryFlag,this.authorizationService.authorization())
    .map(data => data.json(), (error: any) => error.json());
  }


 // get release project details by course id
 getReleaseProjectDetails(courseId:string, queryFlag:string) {
   return this.http.get(AppConfig.API_HOST+'/api/projects/releaseProjects/'+courseId+'?q='+queryFlag,this.authorizationService.authorization())
   .map(data => data.json(), (error: any) => error.json());
 }

}
