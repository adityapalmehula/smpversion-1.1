import { Component, OnInit,ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { StudentService } from './../shared/services/students/student.service';
import { AuthenticationService } from './../shared/services/common/authentication.service';
import { AppConfig } from '../shared/config/app-config.constants';
import { MessageConfig } from '../shared/config/message-config.constants';
import { CommonConfig } from '../shared/config/common-config.constants';
import { FacebookShareService } from '../shared/services/common/facebookshare.service';
import { CourseService } from './../shared/services/courses/course.service';
import { AssignCourseService } from './../shared/services/assign-courses/assign-course.service';
import { MessageService } from './../shared/services/common/message.service';
import { ErrorService } from './../shared/services/common/error.service';
import { SearchVideoService } from './../shared/services/subtopics/videos/search-video.service';
import * as moment from 'moment/moment';
import * as _ from "lodash";

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  providers: [StudentService, FacebookShareService, CourseService,AssignCourseService, SearchVideoService],
})

export class StudentDashboardComponent implements OnInit {

  public urlPrefix: String;
  public errorMessage: string = "";
  public courses: any ;
  public errMessage: any;
  public quizzes = [];
  public activities = [];
  public forums =[];
  subscriptionEndDate: string = "";
  assessmentResultDetails:any=[];
  assessmentResults:any=[];
  public learningProgressStatus= CommonConfig.LEARNING_PROCESS_STATUS;
  public isSubscribed:boolean=false;
  assessmentWisePerformance:any=[];
  topicsConfig:any;
  topicsList:any= [];
  selectedTopics:any=[];
  courseFilterData: any=[];
  courseId:string;

  constructor(
    private studentService: StudentService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private facebookShareService: FacebookShareService,
    private courseService: CourseService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private assignCourseService : AssignCourseService,
    private _vcr : ViewContainerRef,
    private location: Location,
    private searchVideoService: SearchVideoService,
    ) {
    // Initailze FacebookService method. 
    this.facebookShareService.initFacebook();
  }

  // Share on Facebook by user
  share() {
    this.facebookShareService.share((error, res) => {
      if (res !== null) {
      } else {
        this.handleError(error);
      }
    })
  }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    // let studentId = this.authenticationService.getUserId();
    let userType = this.authenticationService.getUserType();
    this.getAssignCourses();

    // Below code is commented as here we have to get assigned courses for all type of students
    
    // if (userType === AppConfig.STUDENT_TYPE[0]) {
    //   this.fetchCourses();
    // } else {
    //   this.getAssignCourses();
    // }
    if (sessionStorage.getItem('YTAT')) {
      this.updateSubscriptionDate();
    }
    this.topicsConfig = { 
      singleSelection: false, 
      text:"Select topics",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
    }; 
  }

  //fetch courses
 /* fetchCourses() {
    this.messageService.showLoader.emit(true);
    this.courseService.fetchCourses().subscribe((response: any)=> {
      this.messageService.showLoader.emit(false);
      if(response.data) {
        this.courses = response.data;
      }
    }, error => {
      this.handleError(error);
    });
  }*/

  //get student details
  getAssignCourses() {
    this.messageService.showLoader.emit(true);
    this.studentService.getDashboard().subscribe(response => {
      if (response['data']) {
        let data=response['data'];
        if(data.courses) {
          this.courses =data.courses;
        }
        if(data.assessmentResults) {
          this.assessmentResults=data.assessmentResults;
          this.assessmentPerformance(this.assessmentResults);
        }
        if(data.assessmentResultDetails) {
          this.assessmentResultDetails=data.assessmentResultDetails;
        } 
        if(data.courseFilterData) {
          this.courseFilterData=data.courseFilterData;

        }
        if(data.subscriptionEndDate) {
          this.subscriptionEndDate= moment(new Date(response['data'].subscriptionEndDate)).format("DD MMMM YYYY");
        }
        if(data.lastLoginOn) {
          this.activities.push({
            title:"Last Login On",
            value: moment(new Date(response['data'].lastLoginOn)).format("DD MMMM YYYY")
          });
        }
        if(data.isSubscribed) {
          this.isSubscribed = data.isSubscribed;
        }
        this.messageService.showLoader.emit(false);
      }
    }, error => {
      this.handleError(error);
    });
  }

  // Doughnut
  public doughnutChartLabels: string[] = ['Total Courses', 'In-progress Courses', 'Completed Courses'];
  public doughnutChartData: number[] = [350, 450, 100];
  public doughnutChartType: string = 'doughnut';

  // events
  public chartClicked(e: any): void {
  }

  public chartHovered(e: any): void {
  }

/*
* share with fb -upgrade subscription
*/
shareWithFb(msg:string) {
  this.errorMessage='';
  this.facebookShareService.share((error, res)=> {
    if(error) {
      this.errorMessage=MessageConfig.SOMETHING_WENT_WRONG;
    }else if(res) {
      this.updateSubscriptionDate(msg);
    }
  });
}

/*
* on subscription update subscription date
*/
updateSubscriptionDate(msg:string='') {
  this.studentService.updateSubscription().subscribe((response:any)=> {
    this.messageService.showLoader.emit(false);
    if(response['data'] && response['data'].subscriptionEndDate) {
      sessionStorage.removeItem('YTAT');
      this.isSubscribed = true;
      // this.subscriptionEndDate= moment(new Date(response['data'].subscriptionEndDate)).format("DD MMMM YYYY");
      // this.messageService.showSuccessToast(this._vcr,msg+" successfully");
    }
  },error => {
    this.handleError(error);
  });
}

// Handle error
handleError(error) {
  this.messageService.showLoader.emit(false);
  this.errorService.handleError(error, this._vcr);
}

//navigate course
navigateCourse(courseId:string, status:string) {
  if(status===this.learningProgressStatus[1] || status===this.learningProgressStatus[2]) {
    this.router.navigate(['/',this.urlPrefix,'course-details',courseId,'play-contents']);
  }else {
    this.router.navigate(['/',this.urlPrefix,'course-details',courseId]);
  }
}

buy(){
  this.authenticationService.buy().subscribe(()=>{

  });
}

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
 youtubeOauth() {
   this.authenticationService.youtubeOauth();  
 }

 // Subscribe to youtube channel
 subscribeYoutubeChannel() {
   let access_token = this.authenticationService.getAccessToken(CommonConfig.TOKEN_TYPE.YUUID);
   if (access_token) {
     this.searchVideoService.access_token = access_token;
     this.searchVideoService.subscribeYoutubeChannel().subscribe((res) => {
     },
     (errRes) => {
     });
   } else {
   }
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
   if(this.assessmentWisePerformance.length>5) {
     this.assessmentWisePerformance=this.assessmentWisePerformance.splice(0,5);
 }
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

}
