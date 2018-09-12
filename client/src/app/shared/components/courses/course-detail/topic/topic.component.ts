import { Component, OnInit, ViewContainerRef,Inject} from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonConfig } from './../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../services/common/authentication.service';
import { MessageService } from './../../../../services/common/message.service';
import { ErrorService } from './../../../../services/common/error.service';
import { CourseService } from './../../../../services/courses/course.service';
import { Config} from './topic.config';


@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.css'],
  providers : [ CourseService ]
})
export class TopicComponent implements OnInit {
  public permissions = [];
  public urlPrefix:string;
  fb: FormBuilder;
  status: any = CommonConfig.STATUS;
  topicId:string;
  courseId:string;
  formTopic: FormGroup;
  topicDescription:any ='';
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
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES);  
    if(this.topicId) {
      this.getTopicById(this.topicId);
    }
  }


//intialze form
intializeForm(data:any={}):void {
  this.formTopic = this.fb.group({
    topicTitle: ['',
    [ Validators.required,
    Validators.minLength(this.Config.title.minlength[0]),
    Validators.maxLength(this.Config.title.maxlength[0])]
    ],
    statusCheck: [ CommonConfig.STATUS.ACTIVE ]
  });
  this.topicDescription= "";
}

// Save topic 
saveTopic(data : any) {
  if(this.topicDescription.length<=this.Config.description.minlength[0]){
    return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
  } else if (this.topicDescription.length>=this.Config.description.maxlength[0]) {
    return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
  }
  let topicData = {
    topicTitle: data.get('topicTitle').value,
    topicDescription: this.topicDescription,
    statusCheck: CommonConfig.STATUS.ACTIVE,
    courseId:this.courseId
  }
  this.messageService.showLoader.emit(true);
  this.courseService.addTopic(topicData).subscribe((res: any)=> {
    this.messageService.showLoader.emit(false);
    this.messageService.successMessage('Topic', 'Successfully saved',()=> {
      this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId]);
    });
  },(error: any) => {
    this.handleError(error);
  })
}

// update topic data
updateTopic(data : any ){
  if(this.topicDescription.length<=this.Config.description.minlength[0]){
    return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
  } else if (this.topicDescription.length>=this.Config.description.maxlength[0]) {
    return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
  }
  let topicData = {
    topicTitle: data.get('topicTitle').value,
    topicDescription: this.topicDescription,
    statusCheck: data.get('statusCheck').value,
    courseId:this.courseId
  }
  this.messageService.showLoader.emit(true);
  this.courseService.updateTopic(topicData,this.topicId).subscribe((res: any)=> {
    this.messageService.showLoader.emit(false);
    this.messageService.successMessage('Topic', 'Successfully updated',()=> {
      this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId]);
    });
  },(error: any)=> {
    this.handleError(error);
  })
}

// Get topic data for update
getTopicById(topicId: string) {
  this.courseService.fetchTopicDetail(topicId).subscribe((res: any)=> {
    this.messageService.showLoader.emit(false);
    if(res['data']) {
      this.formTopic = this.fb.group({
        topicTitle: [res['data'].title,
        [ Validators.required,
        Validators.minLength(this.Config.title.minlength[0]),
        Validators.maxLength(this.Config.title.maxlength[0])]
        ],
        statusCheck: [res['data'].status]
      });
      this.topicDescription=res['data'].description;
    }
  },(error: any)=> {
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
