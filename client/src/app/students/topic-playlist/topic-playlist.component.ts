import { Component, OnInit, ElementRef, ViewContainerRef} from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { OnClickEvent, OnRatingChangeEven, OnHoverRatingChangeEvent} from "angular-star-rating/star-rating-struct"
import { CourseService } from './../../shared/services/courses/course.service';
import { StudentService } from './../../shared/services/students/student.service';
import { AuthenticationService } from './../../shared/services/common/authentication.service';
import { AssessmentService } from './../../shared/services/assessments/assessment.service';
import { AssignCourseService } from './../../shared/services/assign-courses/assign-course.service';
import { CommonConfig } from './../../shared/config/common-config.constants';
import { MessageConfig } from './../../shared/config/message-config.constants';
import { ErrorService } from './../../shared/services/common/error.service';
import { MessageService } from './../../shared/services/common/message.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-topic-playlist',
  templateUrl: './topic-playlist.component.html',
  styleUrls: ['./topic-playlist.component.css'],
  providers: [CourseService,StudentService,AssessmentService,AssignCourseService]
})
export class TopicPlaylistComponent implements OnInit {
  public playlists:any=[];
  public topics: any=[];
  public subTopics: any=[];
  public assessments: any=[];
  public title: string="";
  public courseRating: any;
  public longDescription: string="";
  public shortDescription: string="";
  public componentName: string="topicDetails";
  public playListId: string="";
  public topicTitle: string="";
  public topicInfoType: string="Playlists";
  public topicId: string="";
  public topicDetails:any =["Playlists","Subtopics","Assessments"];
  public stuAttandedAssessments=[];
  public assessmentStatus="Not Attended";
  public errorMessage: string="";
  public urlPrefix: string="";
  public colors : any;
  public isDefaultTab = '';
  public chapterType='';
  public progressStatus= CommonConfig.LEARNING_PROCESS_STATUS;
  public courseId : any;
  public stuRating: number;
  courseStatusObj:any={};
  courseStatus:any='';
  courseData:any;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private authenticationService: AuthenticationService,
    private assessmentService: AssessmentService,
    private studentService: StudentService,
    private router: Router,
    private messageService: MessageService,
    private assignCourseService: AssignCourseService,
    private toastr: ToastsManager, 
    private errorService: ErrorService,
    private _vcr: ViewContainerRef
    ) { 
    this.toastr.setRootViewContainerRef(_vcr);
  }

  ngOnInit() {
    // let studentId = this.authenticationService.getUserId();
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.courseId=this.route.snapshot.params.id;
    this.getCourseProgressStatus().then(success=> {
      this.getTopics();
    });
    this.getAttendedAssessment();
    this.colors = CommonConfig.colors;
  }

  //toggle icon on div collapse
toggleCard(id:any) {
  $('#'+id).toggleClass('fa-chevron-down  fa-chevron-up')
}

  //get topic list
  getTopics() {
    sessionStorage.setItem("courseId",this.courseId);
    if(this.courseId) {
      this.courseService.getCourse(this.courseId)
      .subscribe(response=> {
        if(response['data']) {
          this.courseData=response['data'];
          this.title=response['data'].title;
          this.longDescription=response['data'].longDescription;
          this.shortDescription=response['data'].shortDescription;
          this.courseRating=response['data'].rating;
          if(response['data'].topics.length>0) {
            this.topics=response['data'].topics;
            this.mapStatusWithTopics();
            this.getPlaylists(this.topics[0]._id,null,this.courseData.topics[0].title);
          }
        }
      },error=> {
        this.errorMessage=error.json().msg;
        this.handleError(error);
      });
    }
  }

/*
* map course status with topics
*/
mapStatusWithTopics() {
  this.topics.map(topic=> {
    let topicStatus=this.courseStatusObj.topics.find(status_topic=> status_topic.topicId==topic._id);
    if(topicStatus) {
      topic['status'] = topicStatus.status;
    }
  });
}

/*
 * fetch course status 
 * get topic & subtapic level status
 */
 getCourseProgressStatus() {
   return new Promise(resolve=> {
     this.assignCourseService.getAssignCourseStatus(this.courseId)
     .subscribe(response=> {
       resolve();
       if(response['data']) {
         this.courseStatusObj= response['data'];
         this.stuRating =this.courseStatusObj.rating || 0 ;
         this.courseStatus =this.courseStatusObj.status || this.progressStatus[0] ;
       }
     },error=> {
this.handleError(error);
     });
   })
 }

  //get playlists for selected topic
  getPlaylists(topicId: string,event: any,topicTitle: string) {
    this.topicInfoType='Playlists';
    sessionStorage.setItem('topic', topicId);
    this.topicTitle=topicTitle;
    this.chapterType=this.topicTitle;
    this.courseService.getPlaylistByTopicId(topicId).subscribe(response=> {
      if(response['data']){
        if(response['data'].playlists.length>0){
          this.playlists=response['data'].playlists;
        }else {
          this.playlists=[];
        } if(response['data'].subtopics.length>0){
          this.subTopics=response['data'].subtopics;
          let t_index=this.courseStatusObj.topics.findIndex(topic=> topic.topicId==topicId);
          if(t_index>=0) {
            this.subTopics.map(subtopic=> {
              let subtopicStatus=this.courseStatusObj.topics[t_index].subtopics.find(sub_topic=> sub_topic.subtopicId==subtopic._id);
              if(subtopicStatus) {
                subtopic['status'] = subtopicStatus.status;
              }
            });
          }
        }else {
          this.subTopics=[];
        }
      }else {
        this.playlists=[];
        this.subTopics=[];
      }
    },error=> {
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });

    //get assessments based on topic id 
    this.assessmentService.getAssessmentsByTopicId(topicId)
    .subscribe(response=> {
      if(response['data']) {
        this.assessments=response['data'];
      }
    },error=>{
      //this.errorMessage= error.json().msg;
      this.handleError(error);
    })
  }
  
  //rotate card
  rotateCard(btn){
    let card = $(btn).closest('.card-container');
    if(card.hasClass('hover')){
      card.removeClass('hover');
    } else {
      card.addClass('hover');
    }
  }


  //get topic details 
  getTopicDetails(index, event){
    this.topicInfoType=this.topicDetails[index];
  }

  getAttendedAssessment() {
    this.studentService.findStudentInfo()
    .subscribe(response=> {
      if(response['data']) {
        if(response['data'].assessments) {
          this.stuAttandedAssessments=response['data'].assessments;
        }
      }
    },error=>{
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });
  }

  getStatus(assessmentId:string):string {
    let dataObj=this.stuAttandedAssessments.find(assessment=>assessment.assessmentId === assessmentId);
    if(dataObj) {
      this.assessmentStatus="Attended";
      return "Attended";
    }else{
      this.assessmentStatus="Not Attended";
      return "Not Attended";
    }
  }

  changeStatus(subtopicId,data) {
    let statusData = {
      status:data.value,
      subtopicId:subtopicId,
      topicId :sessionStorage.getItem('topic'),
      courseId :this.courseId
    }
    this.messageService.showLoader.emit(true);
    let title=this.topicTitle;
    this.assignCourseService.setLearningStatus(statusData).subscribe(data=>{
      if(data['success']) {
        this.getCourseProgressStatus().then(success=> {
          this.mapStatusWithTopics();
          this.getPlaylists(statusData.topicId,null,title);
          this.topicInfoType=this.topicDetails[1];
        });
        this.messageService.showLoader.emit(false);
        this.toastr.success("Success", MessageConfig.STUDENT_CONFIG.STATUS_UPDATED_SUCCESSFULLY);
      }
    },(error:any)=> {
      this.errorMessage=error.json().msg;
      this.handleError(error);
    })
  }

  // Back button Method 
  back(){
    this.router.navigate(['/', this.urlPrefix, 'courses']);
  }

  /*star rating code block start from here*/
  onClickResult:OnClickEvent;
  onHoverRatingChangeResult:OnHoverRatingChangeEvent;
  onRatingChangeResult:OnRatingChangeEven;

  onClick = ($event:OnClickEvent) => {
    //this.onClickResult = $event;
    this.submitStudentCourseRating($event);
  };

  onRatingChange = ($event: OnRatingChangeEven) => {
    //this.onRatingChangeResult = $event;
    
  };

  onHoverRatingChange = ($event:OnHoverRatingChangeEvent) => {
    //this.onHoverRatingChangeResult = $event;
  };

  /*star rating code block end here*/


  submitStudentCourseRating(rating:any) {
    this.assignCourseService.rateAssignCourse(this.courseId,rating)
    .subscribe(response=> {
      if(response['data'] && response['data'].courseRating) {
        this.courseRating=response['data'].courseRating;
        this.toastr.success("Success", MessageConfig.STUDENT_CONFIG.COURSE_RATING_SUBMIT_SUCCESSFULLY);
      }
    },error=> {
this.handleError(error);
    });
  }

  getSubTopic(topicId: any) {
    this.courseService.fetchTopicDetail(topicId)
    .subscribe(response=>{
      if(response['data'] && response['data'].subtopics) {
        this.subTopics=response['data'].subtopics;
      }
    },error=>{
this.handleError(error);
    })
  }

// Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }

}
