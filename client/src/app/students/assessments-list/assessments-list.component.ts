import { Component, OnInit,ViewContainerRef} from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { AuthenticationService } from './../../shared/services/common/authentication.service';
import { MessageService } from './../../shared/services/common/message.service';
import { AssessmentService } from './../../shared/services/assessments/assessment.service';
import { ErrorService } from './../../shared/services/common/error.service';

@Component({
  selector: 'app-assessments-list',
  templateUrl: './assessments-list.component.html',
  styleUrls: ['./assessments-list.component.css'],
  providers: [ AssessmentService ]
})

export class AssessmentsListComponent implements OnInit {

  urlPrefix: string;
  courseId: string;
  assessments: Array<{}>=[];
  
  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService : MessageService,
    private errorService: ErrorService,
    private assessmentService : AssessmentService,
    private _vcr : ViewContainerRef,

    ) { }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    //this.courseId=this.route.snapshot.params.id;
    //this.getAssessmentByCourseId();
  }

/*
* get assessments by courseId
*/
getAssessmentByCourseId() {
 /* this.assessmentService.getAssessmentsByCourseId(this.courseId)
  .subscribe(response=> {
    if(response['data']) {
      this.assessments=response['data'];
    }
  },error=> {
    this.messageService.showErrorToast(this._vcr,error.json().msg);
  })*/
}

}
