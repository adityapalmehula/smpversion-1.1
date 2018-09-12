import { Component, OnInit, ViewContainerRef,Inject} from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { CommonConfig } from './../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../services/common/authentication.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MessageService } from './../../../../../services/common/message.service';
import { ErrorService } from './../../../../../services/common/error.service';
import { CourseService } from './../../../../../services/courses/course.service';
import { Config} from './subtopic.config';

@Component({
  selector: 'app-subtopic',
  templateUrl: './subtopic.component.html',
  styleUrls: ['./subtopic.component.css'],
  providers : [ CourseService ]
})
export class SubtopicComponent implements OnInit {
  fb: FormBuilder;
  formSubTopic: FormGroup;
  permissions = [];
  urlPrefix : String;
  status: any = CommonConfig.STATUS;
  courseId:string;
  topicId:string;
  subtopicId:string
  subTopicDescription:any;
  public backendErrorMsg = [];
  public Config : any=Config;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _vcr : ViewContainerRef,
    private messageService: MessageService,
    private errorService: ErrorService,
    private authenticationService : AuthenticationService,
    private courseService : CourseService,
    ) {
    this.fb = fb;
    this.intializeForm();
  }

  ngOnInit() {
    this.courseId= this.route.snapshot.params.courseId;
    this.topicId= this.route.snapshot.params.topicId;
    this.subtopicId= this.route.snapshot.params.subtopicId;
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES);
    if(this.subtopicId) {
      this.getSubTopic(this.subtopicId);
    }
  }

//intialize form 
intializeForm(data:any={}):void {
  this.formSubTopic = this.fb.group({
    subTopicTitle: [data.title || '',
    [ Validators.required,
    Validators.minLength(this.Config.title.minlength[0]),
    Validators.maxLength(this.Config.title.maxlength[0])]
    ],
    statusCheck: [data.status || CommonConfig.STATUS.ACTIVE]
  });
  this.subTopicDescription= data.description || "";
}

// Save subtopic
saveSubTopic(data: any) {
  if(this.subTopicDescription.length<=this.Config.description.minlength[0]){
    return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
  } else if (this.subTopicDescription.length>=this.Config.description.maxlength[0]) {
    return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
  }
  let topicData = {
    subTopicTitle: data.get('subTopicTitle').value,
    subTopicDescription: this.subTopicDescription,
    statusCheck: data.get('statusCheck').value,
    topicId:this.topicId
  }
  this.messageService.showLoader.emit(true);
  this.courseService.addSubTopic(topicData).subscribe((res: any) => {
    this.messageService.showLoader.emit(false);
    this.messageService.successMessage('SubTopic', 'Successfully saved',()=> {
      this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId,'topics',this.topicId]);
    });
  },(error: any)=> {
    this.handleError(error);
  })
}

// Get SubTopic Data for update
getSubTopic(subtopicId :any) {
  this.courseService.getSubTopicById(subtopicId).subscribe((res: any) => {
    this.messageService.showLoader.emit(false);
    if(res['data']) {
      this.intializeForm(res['data']);
    }
  },(error: any)=> {
    this.handleError(error);
  })
}

//Update subtopic
updateSubTopic(data:any) {
  if(this.subTopicDescription.length<=this.Config.description.minlength[0]){
    return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
  } else if (this.subTopicDescription.length>=this.Config.description.maxlength[0]) {
    return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
  }
  let topicData = {
    subTopicTitle: data.get('subTopicTitle').value,
    subTopicDescription: this.subTopicDescription,
    statusCheck: data.get('statusCheck').value,
    topicId:this.topicId,
  }
  this.messageService.showLoader.emit(true);
  this.courseService.updateSubTopic(topicData,this.subtopicId).subscribe((res: any) => {
    this.messageService.showLoader.emit(false);
    this.messageService.successMessage('SubTopic', 'Successfully updated',()=> {
      this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId,'topics',this.topicId]);
    });
  },(error: any) => {
    this.handleError(error);
  })
}

  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    if(error.status===500) {
      this.backendErrorMsg= this.errorService.iterateError(error);
    } else {
      this.errorService.handleError(error, this._vcr);
    }
  }
}
