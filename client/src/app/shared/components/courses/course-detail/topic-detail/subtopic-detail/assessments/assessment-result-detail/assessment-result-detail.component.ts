import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { AssessmentService } from './../../../../../../../services/assessments/assessment.service';
import { AuthenticationService } from './../../../../../../../services/common/authentication.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';
import { CommonConfig } from './../../../../../../../config/common-config.constants';


@Component({
  selector: 'app-assessment-result-detail',
  templateUrl: './assessment-result-detail.component.html',
  styleUrls: ['./assessment-result-detail.component.css'],
  providers: [ AssessmentService ]
})
export class AssessmentResultDetailComponent implements OnInit {

  assessmentResultDetails:any=[];
  appendInfo:boolean=false;
  urlPrefix:string
  config:any=CommonConfig;
  assessmentResultId:string;
  courseId:string;
  assessmentId:string;
  role:string;
  assessmentResult: any;
  isReport:boolean=true;

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private errorService: ErrorService,
    private assessmentService: AssessmentService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private _vcr: ViewContainerRef,
    ) { }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.role=this.authenticationService.userRole;
    this.courseId=this.route.snapshot.params['courseId'];
    this.assessmentId=this.route.snapshot.params['assessmentId'];
    this.assessmentResultId= this.route.snapshot.params['id'];
    if(this.role==CommonConfig.USER_STUDENT) {
      this.courseId=localStorage.getItem('courseId');
      this.assessmentId=localStorage.getItem('assessmentId');
    }
    this.getStudentQuizResult();
    if(window.screen.width >1200){
      this.appendInfo=true;
    }
  }

  selectedType(val:any) {
    if(this.isReport) {
      this.isReport=false;
    }else {
      this.isReport=true;
    }
  }

  //view image in modal
  viewImage(imgUrl: string) {
    this.messageService.showImage(imgUrl,imgUrl);
  }
  
/*
* get student assessments result 
*/
getStudentQuizResult() {
  this.messageService.showLoader.emit(true);
  this.assessmentService.getAssessmentResultById(this.assessmentResultId)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      this.assessmentResult=response['data'];
      this.assessmentResultDetails=response['data'].questions;
    }
  },error=>{
    this.handleError(error);
  });
}

  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.messageService.showErrorToast(this._vcr,error.json().msg);
    this.errorService.handleError(error, this._vcr);
  }
}
