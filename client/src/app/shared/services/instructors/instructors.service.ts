import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'

@Injectable()
export class InstructorService {
  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) {}

  /* find instructor service request*/
  findAll(){
    return this.http.get(AppConfig.API_HOST+'/api/instructors',this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  /* List all active instructors*/
  listAll(){
    return this.http.get(AppConfig.API_HOST+'/api/instructors/list',this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  /* save instructor service request */
  save(data) {
    return this.http.post(AppConfig.API_HOST+'/api/instructors',data,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  // update(data) {
  //   return this.http.put(AppConfig.API_HOST+'/api/instructors/'+data,this.authorizationService.authorization())
  //   .map(data=>data.json(),
  //     (error:any)=>error.json());
  // }

  /* update instructor data */
  update(data,id) {
    return this.http.put(AppConfig.API_HOST+'/api/instructors/'+id,data,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  /* get instructor data by id */
  getInstructor(id) {
    return this.http.get(AppConfig.API_HOST+'/api/instructors/'+id,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  /* find instructor by id*/
  findInstructorInfo(){
    return this.http.get(AppConfig.API_HOST + "/api/instructors/id",this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  /* delete instructor by id*/
  deleteInstructor(insId) {
    return this.http.delete(AppConfig.API_HOST+'/api/instructors/'+insId,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json())
  }
}


