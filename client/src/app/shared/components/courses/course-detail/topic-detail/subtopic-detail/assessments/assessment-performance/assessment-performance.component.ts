import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { StudentService } from './../../../../../../../services/students/student.service';
import { AuthenticationService } from './../../../../../../../services/common/authentication.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';
import * as _ from "lodash";

@Component({
  selector: 'app-assessment-performance',
  templateUrl: './assessment-performance.component.html',
  styleUrls: ['./assessment-performance.component.css'],
  providers: [StudentService],
})
export class AssessmentPerformanceComponent implements OnInit {
  assessmentResults: any=[];
  courseFilterData:any;
  assessmentWisePerformance:any=[];
  topicsConfig:any;
  topicsList:any= [];
  selectedTopics:any=[];
  courseId:string;
  urlPrefix:string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _vcr: ViewContainerRef,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private studentService: StudentService,
    private errorService: ErrorService
    ) { }

  ngOnInit() {
    this.getStudentPerformance();
    this.topicsConfig = { 
      singleSelection: false, 
      text:"Select topics",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
    }; 
  }

//get student performance
getStudentPerformance() {
  this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  this.messageService.showLoader.emit(true);
  this.studentService.getMyPerformance()
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      let data = response['data'];
      if(data['assessmentResults']) {
        this.assessmentResults=data['assessmentResults'];
        this.assessmentPerformance(data['assessmentResults']);
      }
      if(data['courseFilterData']) {
        this.courseFilterData=data['courseFilterData'];
      }
    }
  },error=> {
    this.handleError(error);
  });
}


 //calculate assessment performance
 assessmentPerformance(assessmentResults:any) {
   let uniqueAssessments= _.uniqBy(assessmentResults, 'assessmentId').map(a=>a.assessmentId);
   this.assessmentWisePerformance = uniqueAssessments.map(assessmentId=> {
     let assessments=assessmentResults.filter(assessment=>assessment.assessmentId==assessmentId);
     let assessmentInfo=assessments[0];
     let result= {assessmentId: assessmentInfo.assessmentId, assessment: assessmentInfo.assessment}
     result['max']=_.maxBy(assessments, 'score').score;
     result['min']=_.minBy(assessments, 'score').score;
     result['avg']=_.meanBy(assessments, 'score').toFixed(2);
     result['totalAttampts']=assessments.length;
     return result;
   });
 }

//on course filter change
selectedCourse(courseId:string) {
  this.courseId=courseId;
  this.selectedTopics=[];
  if(courseId) {
    this.topicsList=this.courseFilterData.find(course=> course.courseId==courseId).topics.map(t=> ( { id: t.topicId, itemName: t.title}))
    this.assessmentPerformance(this.assessmentResults.filter(assessment=>assessment.courseId==courseId));
  }else {
    this.topicsList=[];
    this.assessmentPerformance(this.assessmentResults);
  }
}

//on topic change
onTopicsChange($event:any) {
  if(this.selectedTopics.length>0) {
    this.assessmentPerformance(this.assessmentResults.filter(assessment=> this.selectedTopics.map(t=> t.id).some(t=> assessment.topics.includes(t))));
  }else {
    this.assessmentPerformance(this.assessmentResults);
  }
}

  //handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
    this.messageService.showErrorToast(this._vcr,error.json().msg);
  }
}
