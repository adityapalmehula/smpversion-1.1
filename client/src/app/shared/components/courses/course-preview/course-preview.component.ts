import { Component, OnInit, ViewChild,ElementRef, OnDestroy, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ReleaseCourseService } from './../../../services/courses/release-course.service';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { FacebookShareService } from './../../../services/common/facebookshare.service';
import { MessageConfig } from './../../../config/message-config.constants';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { StudentService } from './../../../services/students/student.service';

@Component({
	selector: 'app-course-preview',
	templateUrl: './course-preview.component.html',
	styleUrls: ['./course-preview.component.css'],
  providers : [ ReleaseCourseService,StudentService,FacebookShareService ]

})
export class CoursePreviewComponent implements OnInit, OnDestroy {
  @ViewChild('close')close: ElementRef;
  public courseId: any;
  public courseData: any;
  public errorMessage: any;
  public topicData : any;
  public subTopicData: any;
  public urlPrefix: any;
  public flow = 'preview';
  public colors = ['#ba68c8','#7986cb','#81c784','#ffb74d','#e57373'];
  public feedbackLength= 1;
  private studentInfo:any;
  public courses : any ;
  public permissions = [];
  public imgPath=new CommonConfig().STATIC_IMAGE_URL+'course';
  public courseStatus: any;

  constructor(
    private route : ActivatedRoute,
    private releaseCourseService: ReleaseCourseService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private facebookShareService: FacebookShareService,
    private studentService: StudentService,
    private errorService: ErrorService,
    private _vcr: ViewContainerRef,
    private router: Router) {
			// Initailze FacebookService method. 
      this.facebookShareService.initFacebook();
    }

    ngOnInit() {
      this.courseId=this.route.snapshot.params.id;
      this.getCourse(this.courseId);
      sessionStorage.setItem("courseId",this.courseId);

      let role = this.authenticationService.userRole;
      this.urlPrefix = role.toLowerCase();
      this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.COURSES);
      this.getStudentDetails();
    }

	// Rotate the arrow icon
  rotate(id) {
    document.getElementById(id).classList.toggle('rotate-up');
    document.getElementById(id).classList.toggle('rotate-down');
  }

  /*get course detail on courseid basis*/
  getCourse(courseId: any) {
    if(courseId) {
      this.messageService.showLoader.emit(true);
      this.releaseCourseService.getReleaseCourseDetails(this.courseId,'courseInfo_q2')
      .subscribe(response=> {
        if(response['data']) {
          this.messageService.showLoader.emit(false);
          this.courseData=response['data'];
          this.topicData=this.courseData.topics;
        }
      },error=> {
        if (error.status === 401) {
          this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, error.json().msg);
          this.authenticationService.logout();
          this.handleError(error);
        } else{
          this.errorMessage = error.json().msg;
          this.handleError(error);
        }
      });
    }
  }

  getStudentDetails() {
    this.studentService.getStudentInfo('student_info_q1').subscribe(response=> {
      if(response['data']) {
        this.studentInfo=response['data'];
        let courseList=this.studentInfo.courses.map(course => course.courseId);
        this.courseStatus=courseList.includes(this.courseId);
      } 
    },error=>{
      if (error.status === 401) {
        this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, error.json().msg);
        this.authenticationService.logout();
        this.handleError(error);
      } else{
        this.errorMessage = error.json().msg;
        this.handleError(error);
      }
    });
  }

  // Back button Method 
  back(){
  	this.router.navigate(['/', this.urlPrefix, 'allcourses']);
  }

  //subscribe course 
  subscribeCourse(activationMethod: string, shareModal: any) {
    this.errorMessage='';
    if(activationMethod=== CommonConfig.COURSE_ACTIVATION_TYPE[0] && this.studentInfo) {
      if(this.studentInfo.isSubscribed){
        this.takeCourse(this.courseData.courseId,true);
      }else if (!this.studentInfo.isSubscribed && sessionStorage.getItem('YTAT') != null) {
        this.updateSubscription();
      } else  {
        shareModal.click();
      }
    }else if(activationMethod === CommonConfig.COURSE_ACTIVATION_TYPE[1]) {
	//add paid methods here
}
}

	//share with social media
	socialMediaShare() {
    // Start Youtube subscription
    this.authenticationService.youtubeOauth();

    /* Disabled facebook sharing as we started promoting from youtube 
    - 18-07-2018 **/

    // Start Facebook sharing 

    // this.errorMessage='';
    // this.facebookShareService.share((error, res)=> {
    //   if(error) {
    //     this.errorMessage=MessageConfig.SOMETHING_WENT_WRONG;
    //     this.close.nativeElement.click();
    //   }else if(res) {
    //     if(this.courseData) {
    //       this.takeCourse(this.courseData.courseId);
    //     }
    //   }else {
    //     this.close.nativeElement.click();
    //     this.errorMessage=MessageConfig.INTERNAL_ERROR_OCCURED;
    //   }
    // });

    // End Facebook sharing 

  }

  // Update youtube subscription in users profile
  updateSubscription() {
    this.studentService.updateSubscription().subscribe((response:any)=> {
    this.messageService.showLoader.emit(false);
      if(response['data']) {
        sessionStorage.removeItem('YTAT');
        this.takeCourse(this.courseData.courseId,true);
      }
    },error => {
      this.handleError(error);
    });
  }
  
	//assign course to student 
	takeCourse(courseId, byShare:boolean=false) {
    this.errorMessage='';
    let course= {
      courseId: courseId,
      byShare: byShare
    }
    this.messageService.showLoader.emit(true);
    this.studentService.assignCourse(course)
    .subscribe(response=>{
      this.close.nativeElement.click();
      if(response['success']){
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Course', 'Assign successfully');
        this.router.navigate(['/', this.urlPrefix, 'course-details', course.courseId]);
      }
    },error=>{
      this.close.nativeElement.click();
      this.handleError(error);
    });
  }

	//buy course 
	buyCourse() {
    this.errorMessage='';
  }

  //buy course 
  addToCart(courseId) {
    let data = {
      'courseId':courseId
    }
    this.studentService.addToCart(data).subscribe(response=>{
    },error=>{
    })
  }

	//called on component destroy 
	ngOnDestroy(){
    if(this.close) {
      this.close.nativeElement.click();
    }
  }

  closeModal(){

  }

 // Handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 } 
}
