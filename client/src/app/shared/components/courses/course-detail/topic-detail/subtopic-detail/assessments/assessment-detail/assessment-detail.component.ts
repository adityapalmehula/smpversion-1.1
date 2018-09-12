import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from './../../../../../../../services/assessments/assessment.service';
import { AuthenticationService } from './../../../../../../../services/common/authentication.service';
import { ErrorService } from './../../../../../../../services/common/error.service';

@Component({
  selector: 'app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.css'],
  providers: [ AssessmentService ]
})
export class AssessmentDetailComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _vcr : ViewContainerRef,
    private assessmentService: AssessmentService,
    private errorService: ErrorService,
    private authenticationService: AuthenticationService,
    ) { }
  assessmentDetails:any;
  errorMessage: string="";
  urlPrefix: string;
  basicLevelQues:any=[];
  intermediateLevelQues:any=[];
  expertLevelQues:any=[];
  topicId:string;
  ngOnInit() {
    let assessmentId = this.route.snapshot.params['id'];
    this.topicId= sessionStorage.getItem("topic");
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    /*if(!this.topicId){
      this.router.navigate(['/', this.urlPrefix, 'courses']);
    }else {
      this.getAssessmentDetails(assessmentId);
    }*/
  }

//get assessment data based on assessment id
getAssessmentDetails(assessmentId:string) {
  this.assessmentService.getAssessmentById(assessmentId)
  .subscribe(response=> {
    if(response['data']) {
      this.assessmentDetails=response['data'];
      this.basicLevelQues=response['data'].basicLevelQuestion;
      this.intermediateLevelQues=response['data'].intermediateLevelQuestion;
      this.expertLevelQues=response['data'].expertLevelQuestion;
    }
  },error=>{
    this.errorMessage= error.json().msg;
    this.handleError(error);
  })
}

//toggle icon on div collapse
toggleCard(id:any) {
  $('#'+id).toggleClass('fa-chevron-circle-down  fa-chevron-circle-up')
}

  // Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }
}
