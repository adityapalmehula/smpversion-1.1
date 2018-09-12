import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'

@Injectable()
export class TeacherService{

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }

  // post request to server
  save(data:any) {
    return this.http.post(AppConfig.API_HOST+'/api/teachers',data,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  //get reqest for all teacher
  getTeachers(queryFilter: any={}) {
    return this.http.get(AppConfig.API_HOST+'/api/teachers',this.authorizationService.authorization(queryFilter))
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  //get teacher data by id
  getTeacher(id) {
    return this.http.get(AppConfig.API_HOST+'/api/teachers/'+id,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

   //get teacher data by login Id
   getTeacherData() {
     return this.http.get(AppConfig.API_HOST+'/api/teachers/teacherId',this.authorizationService.authorization())
     .map(data=>data.json(),
       (error:any)=>error.json());
   }

  // update teacher data
  update(data,id) {
    return this.http.put(AppConfig.API_HOST+'/api/teachers/'+id,data,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

    // update teacher data
    assignClasses(id,classes) {
      return this.http.put(AppConfig.API_HOST+'/api/teachers/assignClasses/'+id,classes,this.authorizationService.authorization())
      .map(data=>data.json(),
        (error:any)=>error.json());
    }

  // delete teacher data
  deleteTeacher(teacherId) {
    return this.http.delete(AppConfig.API_HOST+'/api/teachers/'+teacherId,this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json())
  }

   //get teacher data by id
   getTeacherBySchool() {
     return this.http.get(AppConfig.API_HOST+'/api/teachers/school',this.authorizationService.authorization())
     .map(data=>data.json(),
       (error:any)=>error.json());
   }

 }