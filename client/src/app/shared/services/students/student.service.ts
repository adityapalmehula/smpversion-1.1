import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'

@Injectable()
export class StudentService{

	constructor(
		private http: Http,
		private authorizationService: AuthorizationService,
		){ }

  // post request to save data
  save(data:any) {
  	return this.http.post(AppConfig.API_HOST+'/api/students',data,this.authorizationService.authorization())
  	.map(data=>data.json(),
  		(error:any)=>error.json());
  }

  //get reqest for students
  findAll(queryFilter: any={}) {
  	return this.http.get(AppConfig.API_HOST+'/api/students',this.authorizationService.authorization(queryFilter))
  	.map(data=>data.json(),
  		(error:any)=>error.json());
  }
  
  //get student data by id
  findById(id) {
  	return this.http.get(AppConfig.API_HOST+'/api/students/studentId/'+id,this.authorizationService.authorization())
  	.map(data=>data.json(),
  		(error:any)=>error.json());
  }


  //get Login student data
  findStudentInfo() {
    return this.http.get(AppConfig.API_HOST+'/api/students/userId/',this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

   //get student filter detials based on query flag
   getStudentInfo(flag: string) {
     return this.http.get(AppConfig.API_HOST+'/api/students/id/'+'?q='+flag,this.authorizationService.authorization())
     .map(data=>data.json(),
       (error:any)=>error.json());
   }

  // update student data
  update(data,id) {
  	return this.http.put(AppConfig.API_HOST+'/api/students/'+id,data, this.authorizationService.authorization())
  	.map(data=> data.json(),
  		(error:any)=> error.json());
  }

  // delete student data
  deleteRecord(_id) {
  	return this.http.delete(AppConfig.API_HOST+'/api/students/'+_id, this.authorizationService.authorization())
  	.map(data=>data.json(),
  		(error:any)=>error.json());
  }

  //Get dashboard data for student
  getDashboard() {
  	return this.http.get(AppConfig.API_HOST+'/api/students/mydashboard', this.authorizationService.authorization())
  	.map(data=>data.json(),
  		(error:any)=>error.json());
  }

  //get all assign courses to perticular student
  getCourses(flag) {
    return this.http.get(AppConfig.API_HOST+'/api/students/mycourses?q='+flag, this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }

  //request to rate assign courses 
  getCourse(courseId: string,flag: string) {
    return this.http.get(AppConfig.API_HOST+'/api/students/mycourses/'+courseId+'?q='+flag,this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json())
  }
  
  //get students school wise
  findBySchoolCode(schoolId) {
  	return this.http.get(AppConfig.API_HOST+'/api/students/school'+schoolId, this.authorizationService.authorization())
  	.map(data=>data.json(),
  		(error:any)=>error.json());
  }

 //get classes based on school code
 getClasses(schoolId) {
 	return this.http.get(AppConfig.API_HOST + '/api/students/classes/' + schoolId,this.authorizationService.authorization())
 	.map(data=> data.json(),
 		(error: any)=> error.json());
 }

 // assign courses for students
 assignCourses(schoolId: string, standard: any, courses: any) {
 	return this.http.put(AppConfig.API_HOST + '/api/students/class/assign/courses/'+schoolId+'/'+standard, courses,this.authorizationService.authorization())
 	.map(data=> data.json(),
 		(error: any)=> error.json());
 }

  // assign courses for students
  getAssignCourses(schoolId: string, standard: any) {
  	return this.http.get(AppConfig.API_HOST + '/api/students/class/assign/courses/'+schoolId+'/'+standard,this.authorizationService.authorization())
  	.map(data=> data.json(),
  		(error: any)=> error.json());
  }

  //assign subscribed course to student 
  assignCourse(course:any) {
  	return this.http.put(AppConfig.API_HOST+'/api/students/mycourses/assign',course,this.authorizationService.authorization())
  	.map(data=>data.json(),error=>error.json());
  }

  // Get topic details to view learning contents
  getTopicDetails(courseId, topicId) {
    return this.http.get(AppConfig.API_HOST+'/api/students/mycourses/'+courseId+'/topics/'+topicId, this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json());
  } 

  // Get topic details to view learning contents
  getMyPerformance() {
    return this.http.get(AppConfig.API_HOST+'/api/students/myperformance', this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json());
  }

//update subscription details
updateSubscription() {
  let youtubeToken = sessionStorage.getItem('YTAT');
  let data = {
    'youtubeToken' : youtubeToken
  }
  return this.http.put(AppConfig.API_HOST+'/api/students/subscription/',data, this.authorizationService.authorization())
  .map(data=> data.json(),
    (error:any)=> error.json());
}

  //Get learning content details based content id
  getLearningContent(data) {
    return this.http.post(AppConfig.API_HOST+'/api/students/learningContent',data, this.authorizationService.authorization())
    .map(data=> data.json(),
      (error:any)=> error.json());
  }

  //update learning path status
  updateLearningPathStatus(statusDetails: any) {
    return this.http.put(AppConfig.API_HOST+'/api/students/mycourses/learningpaths/status',statusDetails,this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json());
  }

  /* change status of students*/
  changeStatus(studentsObject) {
    return this.http.put(AppConfig.API_HOST+'/api/students/status/change',studentsObject,this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json());
  }

  //assign subscribed course to student 
  addToCart(data) {
    return this.http.post(AppConfig.API_HOST+'/api/carts', data,this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json());
  }
  
  //get url details
  getUrlDetails(data) {
    return this.http.post(AppConfig.API_HOST+'/api/students/mycourse/url-details', data,this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json());
  }

  //update course version
  updateCourseVersion(data: any) {
    return this.http.put(AppConfig.API_HOST+'/api/students/mycourses/update/version',data,this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json());
  }
  
  //update class info of student
  updateClass(data: any){
  	return this.http.put(AppConfig.API_HOST+'/api/students/classInfo',data,this.authorizationService.authorization())
    .map(data=>data.json(),error=>error.json());
  }
}
