import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from './../../../services/courses/course.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { AuthenticationService } from '../../../services/common/authentication.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css'],
  providers : [ CourseService ]
})
export class CourseDetailComponent implements OnInit {
  public courseId : any;
  public courseData : any = {};
  public errMessage : any ;
  public errorMessage : any;
  private fb: FormBuilder;
  public formTopic: FormGroup;
  public colors : any ={};
  public topicId :any;
  public urlPrefix : String;
  public permissions =[];
  public status : any = CommonConfig.STATUS;
  isDefaultTab:string="";
  CONFIG=CommonConfig;
  userId:string;
  role:string;
  courseOwnerUserId:string;
  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 20;
  public dataArray : any;
  public topics = [];

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService : CourseService,
    private errorService: ErrorService,
    private _vcr: ViewContainerRef,
    private messageService: MessageService,
    private authenticationService : AuthenticationService
    ) {
    this.fb = fb;
    this.intializeForm(fb);
  }

  intializeForm(fb:FormBuilder,data:any={}):void {
    this.formTopic = fb.group({
      topicTitle: [data.title || '', [Validators.required]],
      topicDescription: [data.description ||'', [Validators.required]],
      statusCheck: [data.status || CommonConfig.STATUS.ACTIVE]
    });
  }

  ngOnInit() {
    this.userId= localStorage.getItem("userId");
    if(!this.userId) {
      this.router.navigate(['/']);
    }
    this.role = this.authenticationService.userRole;
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.TOPICS);
    this.courseId = this.route.snapshot.params['courseId'];
    sessionStorage.setItem('course',this.courseId);
    this.courseDetail(this.courseId);
    this.colors = CommonConfig.colors;
    let queryParams = this.router.parseUrl(this.router.url).queryParams
    this.isDefaultTab = queryParams.tab || 'topics';
  }

  /*pagination logic start here*/
  public setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }

  public pageChanged(event: any): void {
    this.currentPage = event.page;
    this.paginationData();
  }

  paginationData() {
    const indexOfLastItem = this.currentPage * this.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
    this.topics = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
  }

  /*pagination logic end here*/

  // Set default tab for contents
  setDefaultTab(defaultTab) {
    this.isDefaultTab = defaultTab;
  }
  // Get Course on basis of Id
  courseDetail(courseId : any) {
    this.courseService.getCourseData(courseId).subscribe(
      res => {
        this.courseData = res.data;
        this.dataArray=this.courseData.topics;
        this.totalItems=this.dataArray.length;
        this.paginationData();
        if(this.courseData.createdBy && this.courseData.createdBy.id) {
          this.courseOwnerUserId= this.courseData.createdBy.id;
        }
      },
      error => {
        let errMsg = error.json();
        this.errMessage = errMsg.msg;
        this.handleError(error);
      });
  }

// Save topic 
saveTopic(data : any) {
  let topicData = {
    topicTitle: data.get('topicTitle').value,
    topicDescription: data.get('topicDescription').value,
    statusCheck: data.get('statusCheck').value,
    courseId:this.courseId
  }
  this.courseService.addTopic(topicData).subscribe((res: any) => {
    this.messageService.successMessage('Topic', 'Successfully saved');
    this.courseDetail(this.courseId);
    this.closeModal();
  }, (error: any) => {
    let errMsg = error.json();
    this.errMessage = errMsg.msg;
    this.handleError(error);
  })
}

// Get topic data for update
getTopicForUpdate(topicId : any) {
  this.topicId=topicId;
  let topicData=this.courseData.topics.filter((data:any) => data._id === this.topicId );
  this.intializeForm(this.fb,topicData[0]);
}

// close modal
closeModal(){
  this.formTopic = this.fb.group({
    topicTitle: ['', [Validators.required]],
    topicDescription: [ '', [Validators.required]],
    statusCheck: [ 'active']
  });
  this.topicId='';
}

// update topic data
updateTopic(data : any ){
  let topicData = {
    topicTitle: data.get('topicTitle').value,
    topicDescription: data.get('topicDescription').value,
    statusCheck: data.get('statusCheck').value,
    courseId:this.courseId
  }
  this.courseService.updateTopic(topicData,this.topicId).subscribe((res: any) => {
    this.messageService.successMessage('Topic', 'Successfully updated');
    this.courseDetail(this.courseId);
    this.closeModal();
  }, (error: any) => {
    let errMsg = error.json();
    this.errMessage = errMsg.msg;
    this.handleError(error);
  })
}

deleteTopic(topicId : any ) {
  this.messageService.deleteConfirmation(()=>{
    return this.courseService.deleteTopic(topicId).subscribe(data=> { 
      if(data['success']) {
        this.courseDetail(this.courseId);
        this.messageService.successMessage('Topic', 'Successfully Deleted');
      }
    },(error:any)=>{
      let errorObj = error.json();
        this.handleError(error);
      if (errorObj.msg) {
        this.errorMessage = errorObj.msg; 
      }
    });
  });
}

// Handle error
handleError(error) {
  this.messageService.showLoader.emit(false);
  this.errorService.handleError(error, this._vcr);
}

}
