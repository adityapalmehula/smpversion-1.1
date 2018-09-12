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
export class CourseService{
  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    private router: Router,
    private autenticationService: AuthenticationService,
    ) { }

// fetch courses
fetchCourses(queryFlag="1") {
  return this.http.get(AppConfig.API_HOST+'/api/courses?q='+queryFlag,this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// Add Course
addCourse(data) {
  // let courseDetail=JSON.stringify(data);
  // let headers = new Headers();
  // headers.append('enctype', 'multipart/form-data');
  // headers.append('Accept', 'application/json');
  // headers.append('Authorization', this.autenticationService.getToken());
  // headers.append('courseData',courseDetail);

  // let options = new RequestOptions({ headers: headers });
  return this.http.post(AppConfig.API_HOST+'/api/courses',data, this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// fetch course details on basis of id
getCourseData(_id){
  return this.http.get(AppConfig.API_HOST+'/api/courses/id/'+_id,this.authorizationService.authorization()).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    });
}

// get my courses for instructor - created by only him 
getMyCoursesForInstructor() {
  return this.http.get(AppConfig.API_HOST+'/api/courses/mycourses?q=1',this.authorizationService.authorization()).map(data=>
    data.json(),(error:any)=> error.json());
}

  // get release courses details for filters
  getCoursesForFilters() {
    return this.http.get(AppConfig.API_HOST+'/api/courses/releaseCourses/filterInfo',this.authorizationService.authorization())
      .map(data => data.json(), (error: any) => error.json());
    }

  //update Course based on id
  updateCourse(data,courseId){
    // let courseDetail=JSON.stringify(data);
    // let headers = new Headers();
    // headers.append('enctype', 'multipart/form-data');
    // headers.append('Accept', 'application/json');
    // headers.append('Authorization', this.autenticationService.getToken());
    // headers.append('courseData',courseDetail);
    // let options = new RequestOptions({ headers: headers });
    
    return this.http.put(AppConfig.API_HOST+'/api/courses/id/'+courseId,data,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  //update Course status based on id
  updateCourseStatus(courseId: string, statusDetails:any ) {
    return this.http.put(AppConfig.API_HOST+'/api/courses/status/'+courseId,statusDetails,this.authorizationService.authorization()).map(data =>
      data.json(), (error: any)=>error.json());
  }

  //Delete course
  deleteCourse(courseId) {
    return this.http.delete(AppConfig.API_HOST+'/api/courses/deleteCourse/'+courseId,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }


// Fetch Course Detail by Id
fetchCourseDetail(id) {
  return this.http.post(AppConfig.API_HOST+'/api/courses/courseDetail', { id: id }, this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// Add Topic
addTopic(data) {
  return this.http.post(AppConfig.API_HOST+'/api/topics', data,this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// Update Topic by topicId
updateTopic(data,topicId) {
  return this.http.put(AppConfig.API_HOST+'/api/topics/id/'+ topicId, data,this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

//Delete topic 
deleteTopic(topicId) {
  return this.http.delete(AppConfig.API_HOST+'/api/topics/delete/'+topicId,this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// Fetch topic detail by topic id
fetchTopicDetail(id) {
  return this.http.get(AppConfig.API_HOST+'/api/topics/'+id,this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// Fetch topic detail by topic id
getTopicsWiseSubtopics(data) {
  return this.http.post(AppConfig.API_HOST+'/api/topics/subtopics',data,this.authorizationService.authorization()).map(data =>
    data.json(), (error: any) => {
      error.json();
    });
}

// Add subtopic
addSubTopic(data) {
  return this.http.post(AppConfig.API_HOST+'/api/subtopics', data,this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

  // Update Topic by subTopicId
  updateSubTopic(data,subTopicId) {
    return this.http.put(AppConfig.API_HOST+'/api/subtopics/id/'+ subTopicId, data,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

    //delete subtopic 
    deleteSubTopic(subTopicId) {
      return this.http.delete(AppConfig.API_HOST+'/api/subtopics/delete/'+subTopicId,this.authorizationService.authorization()).map(data =>
        data.json()
        , (error: any) => {
          error.json();
        });
    }

    // get subtopic  on basis of subtopic Id
    getSubTopicById(id:string) {
      return this.http.get(AppConfig.API_HOST+'/api/subtopics/'+id,this.authorizationService.authorization())
      .map(data=> data.json(),
        (error:any)=> error.json());
    }

  //Get a single course details by course id
  getCourse(courseId) {
    return this.http.get(AppConfig.API_HOST+'/api/courses/'+courseId,this.authorizationService.authorization())
    .map(response=> 
      response.json(),error=>error.json());
  }

   //get course validation tracking details
   getCourseValidationTracking(courseId) {
     return this.http.get(AppConfig.API_HOST+'/api/courses/validation-tracking/'+courseId,this.authorizationService.authorization())
     .map(response=> response.json(),error=>error.json());
   }

  //Get a single course details by course id
  getCourseForPerview(courseId) {
    return this.http.get(AppConfig.API_HOST+'/api/courses/'+courseId+'?q=coursePreview',this.authorizationService.authorization())
    .map(response=> 
      response.json(),error=>error.json());
  }
  //get playlists by topic id
  getPlaylistByTopicId(topicId) {
    return this.http.get(AppConfig.API_HOST+"/api/topics/playlists/"+topicId,this.authorizationService.authorization())
    .map(response=>
      response.json(),error=> error.json());
  }

  //save question
  saveQuestion(data:any) {
    return this.http.post(AppConfig.API_HOST+'/api/questions', data,this.authorizationService.authorization())
    .map(data=> data.json(), error => error.json());
  }
   //delete question
   deleteQuestion(id:any) {
     return this.http.delete(AppConfig.API_HOST+'/api/questions/'+id,this.authorizationService.authorization())
     .map(data=> data.json(), error => error.json());
   }

//get questions based on topic id
getQuestions(queryFilter:any={}) {
  return this.http.get(AppConfig.API_HOST+'/api/questions',this.authorizationService.authorization(queryFilter))
  .map(data=> data.json(), error=>error.json());
}
 //get question by id
 getQuestionById(questionId) {
   return this.http.get(AppConfig.API_HOST+'/api/questions/'+questionId,this.authorizationService.authorization())
   .map(response=> response.json(),error=>error.json());
 }
 
 // update question by question id
 updateQuestion(qusId,question) {
   return this.http.put(AppConfig.API_HOST+'/api/questions/'+ qusId, question,this.authorizationService.authorization())
   .map((response: any)=>  response.json(), (error: any)=> error.json());
 } 

 //get topics and subtopics
 getFilterTopics(courseId:string) {
   return this.http.get(AppConfig.API_HOST+'/api/courses/topics/subtopics/'+ courseId,this.authorizationService.authorization())
   .map((response: any)=>  response.json(), (error: any)=> error.json());
 }

  //update issues in question
  submitIssue(qusId,issueDetails) {
    return this.http.put(AppConfig.API_HOST+'/api/questions/issues/'+ qusId,issueDetails,this.authorizationService.authorization())
    .map((response: any)=>  response.json(),(error: any)=> error.json());
  } 

// rearrange topics by course id
rearrangeTopics(data, courseId) {
  return this.http.put(AppConfig.API_HOST+'/api/courses/'+courseId+'/topics/rearrange',data, this.authorizationService.authorization())
  .map((response: any)=>  response.json(),(error: any)=> error.json());
}

// rearrange subtopics by topic id
rearrangeSubTopics(data, topicId) {
  return this.http.put(AppConfig.API_HOST+'/api/topics/'+topicId+'/subTopics/rearrange',data, this.authorizationService.authorization())
  .map((response: any)=>  response.json(),(error: any)=> error.json());
}
/* for text book solutions*/
textBookSolution(solutionData,topicId){
  let headers = new Headers();
  headers.append('enctype', 'multipart/form-data');
  headers.append('Accept', 'application/json');
  headers.append('Authorization', this.autenticationService.getToken());
  let options = new RequestOptions({ headers: headers });
  return this.http.post(AppConfig.API_HOST+'/api/topics/'+topicId+'/textBookSolution', solutionData, options)
  .map(response=>response.json(),error=>error.json());
}

       //deleteTextBookSolution
       deleteTextBookSolution(solutionId:string,topicId:string){
         return this.http.delete(AppConfig.API_HOST+'/api/topics/'+topicId+'/textBookSolution/'+solutionId,this.authorizationService.authorization())
         .map(data=>data.json(),error=>error.json())
       }

/*getHeader() {
  if(!localStorage.getItem('currentUser')) {
    this.router.navigate(['/']);
  }else {
    let token = JSON.parse(localStorage.getItem('currentUser'))['token'];
    if (token) {
      let params: URLSearchParams = new URLSearchParams();
      params.set('params1','value1');
      params.set('params2','value2');
      let headers = new Headers({'Authorization': token});
      return new RequestOptions({ headers: headers, search: params});
    }else{
      this.router.navigate(['/']);
    }
  }
}*/

}
