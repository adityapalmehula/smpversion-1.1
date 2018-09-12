import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service';

@Injectable()
export class AssessmentService {

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }

//request for save assessment
saveAssessment(data) {
  return this.http.post(AppConfig.API_HOST+'/api/assessments', data,this.authorizationService.authorization())
  .map(data=> data.json(), error => error.json());
}

 //request to fetch assessments based on course id
 getAssessments(filter){
   return this.http.get(AppConfig.API_HOST+'/api/assessments',this.authorizationService.authorization(filter))
   .map(data=> data.json(),error=> error.json());
 }

  //request to fetch assessments based on topic id
  getAssessmentsByTopicId(topicId:any){
    return this.http.get(AppConfig.API_HOST+'/api/assessments/topicId/'+topicId,this.authorizationService.authorization())
    .map(data=> data.json(),error=> error.json());
  }

 //request to fetch assessments by id
 getAssessmentById(id:any){
   return this.http.get(AppConfig.API_HOST+'/api/assessments/'+id,this.authorizationService.authorization())
   .map(data=> data.json(),error=> error.json());
 }

 //request to fetch assessments without answers by id
 getAssessmentWithoutAnswers(assessmentId:string){
   return this.http.get(AppConfig.API_HOST+'/api/assessments/take-assessment/'+assessmentId,this.authorizationService.authorization())
   .map(data=> data.json(),error=> error.json());
 }

//delete assessment
deleteAssessment(id) {
  return this.http.delete(AppConfig.API_HOST+'/api/assessments/'+id,this.authorizationService.authorization()).map(data =>
    data.json(), (error: any) => {
      error.json();
    });
}

//delete assessment detials
updateAssessment(id:string,assessment:any) {
  return this.http.put(AppConfig.API_HOST+'/api/assessments/'+id,assessment,this.authorizationService.authorization()).map(data =>
    data.json(), (error: any) => {
      error.json();
    });
}

 //save assessment result
 getAssessmentInfo(assessmnetId:any,query:string=null) {
   let url ='/api/assessmentresults/assessmentInfo/'+assessmnetId
   if(query) url+'?q='+query;
   return this.http.get(AppConfig.API_HOST+url,this.authorizationService.authorization())
   .map(data=> data.json(),error=> error.json());
 }

  //save assessment result
  saveTakeAssessment(data:any) {
    return this.http.post(AppConfig.API_HOST+'/api/assessmentresults',data,this.authorizationService.authorization())
    .map(data=> data.json(),error=> error.json());
  }
 //save assessment result
 takeAssessment(data:any) {
   return this.http.post(AppConfig.API_HOST+'/api/assessmentresults/practice',data,this.authorizationService.authorization())
   .map(data=> data.json(),error=> error.json());
 }

//get all assessment results based on assessment id ( fetch assement results for all the students)
getAssessmentResults(assessmentId:string) {
  return this.http.get(AppConfig.API_HOST+'/api/assessmentresults/assessmentId/'+assessmentId,this.authorizationService.authorization())
  .map(data=> data.json(),error=> error.json());
}

//get assessment results for perticular student by assessment and student id
getStudentAssessmentResult(assessmentId:string) {
  return this.http.get(AppConfig.API_HOST+'/api/assessmentresults/studentId/assessmentId/'+assessmentId,this.authorizationService.authorization())
  .map(data=> data.json(),error=> error.json()); 
}

 //get assessment result details based on assessment-result id
 getAssessmentResultById(id:string) {
   return this.http.get(AppConfig.API_HOST+'/api/assessmentresults/'+id,this.authorizationService.authorization())
   .map(data=> data.json(),error=> error.json());
 }
 
  //get assessment status 
  getStudentAssessmentStatus(id:string) {
    return this.http.get(AppConfig.API_HOST+'/api/assessmentresults/status/'+id,this.authorizationService.authorization())
    .map(data=> data.json(),error=> error.json());
  }

 //update assessment result for user answer
 saveOrUpdateUserAnswer(id:string,assessmentResult:any) {
   return this.http.put(AppConfig.API_HOST+'/api/assessmentresults/'+id,assessmentResult,this.authorizationService.authorization())
   .map(data=>data.json(),error=> error.json());
 }

 //update assessment result for user answer
 submitAndFinishAssessment(id:string,assessmentInfo:any={}) {
   return this.http.put(AppConfig.API_HOST+'/api/assessmentresults/result/'+id,assessmentInfo,this.authorizationService.authorization())
   .map(data=>data.json(),error=> error.json());
 }

 //update assessment result for user answer
 updateUserAnswers(id:string,assessmentInfo:any={}) {
   return this.http.put(AppConfig.API_HOST+'/api/assessmentresults/userAnswers/'+id,assessmentInfo,this.authorizationService.authorization())
   .map(data=>data.json(),error=> error.json());
 }

 //update assessment result for user answer
 finishAssessment(id:string,assessmentInfo:any={}) {
   return this.http.put(AppConfig.API_HOST+'/api/assessmentresults/submit/'+id,assessmentInfo,this.authorizationService.authorization())
   .map(data=>data.json(),error=> error.json());
 }

//update time and status 
updateTimeAndStatus(id:string,assessmentInfo:any) {
  return this.http.put(AppConfig.API_HOST+'/api/assessmentresults/question/time/'+id,assessmentInfo,this.authorizationService.authorization())
  .map(data=>data.json(),error=> error.json());
}

//update mark for review 
updateMarkReview(id:string,questionForReview:any) {
  return this.http.put(AppConfig.API_HOST+'/api/assessmentresults/questions/review/'+id,questionForReview,this.authorizationService.authorization())
  .map(data=>data.json(),error=> error.json());
}

//get assessments by subtopic id
getAssessmentsBySubTopicId(subTopicId:string) {
  return this.http.get(AppConfig.API_HOST+'/api/assessments/subtopics/'+subTopicId,this.authorizationService.authorization())
  .map(data=>data.json(),error=>error.json());
}

//generate random question assessment
generateRandomAssessment(data:any,filter:any) {
  return this.http.post(AppConfig.API_HOST+'/api/assessments/generate/practiceTest',data,this.authorizationService.authorization(filter))
  .map(data=>data.json(),error=>error.json());
}

/*//get assessment based on subtopic id
  //fetch assessments
  getAllQuizData(){
    return this.http.get(AppConfig.API_HOST+'/api/assessments/quiz/quizzes',this.authorizationService.authorization())
    .map(data=> data.json(),error=> error.json());
  }

  //get quiz results based on quizId and student id 
  fetchStudentQuizResults(studentId,quizId) {
    return this.http.get(AppConfig.API_HOST+'/api/quizResults/stuId/'+studentId+'/quizId/'+quizId,this.authorizationService.authorization())
    .map(data=> data.json(),error=> error.json()); 
  }*/

}