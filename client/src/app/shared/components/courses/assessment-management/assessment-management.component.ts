import { Component, OnInit,Input, OnChanges, ViewContainerRef} from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { CourseService } from './../../../services/courses/course.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { AuthenticationService } from './../../../services/common/authentication.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-assessment-management',
  templateUrl: './assessment-management.component.html',
  styleUrls: ['./assessment-management.component.css'],
  providers: [ CourseService ]
})
export class AssessmentManagementComponent implements OnInit {

  public userId:string;
  public basePath = new CommonConfig().BASE_URL+CommonConfig.FOLDERS[6];
  public totalItems:number=0;
  public currentPage:number=1;
  public itemsPerPage:number=10;
  CONFIG=CommonConfig;
  urlPrefix:string
  role:string;
  standards:any=[];
  subCatId:string;
  courseMaster:any=[];
  courseList:any=[];
  courseId: string;
  topicList:any=[];
  topicId: string;
  subtopicList:any=[];
  subtopicId:string;
  assessmentId:string;
  isLoadAssessmentForm:boolean=false;
  assessmentConfig:any={};
  formType:string='add';
  questionStatus=CommonConfig.QUESTION_STATUS;
  visibility:string=CommonConfig.QUESTION_STATUS.PUBLIC;

  constructor(
    private route: ActivatedRoute,
    private router:Router,
    private authenticationService:AuthenticationService,
    private errorService: ErrorService,
    private messageService: MessageService,
    private courseService: CourseService,
    private _vcr: ViewContainerRef
    ){
  }

  ngOnInit() {
    this.getFilterData();
  }

  //get filter data
  getFilterData() {
    this.courseList=[];
    this.courseId='';
    this.topicList=[];
    this.topicId='';
    this.subtopicList=[];
    this.subtopicId='';
    this.messageService.showLoader.emit(true);
    this.courseService.getCoursesForFilters()
    .subscribe(response=> {
      this.messageService.showLoader.emit(false);
      if(response['data']) {
        let data=response['data'];
        this.courseMaster=data['courses'];
        this.standards=data['subCategories']
        //this.courseList=data['courses'].map(course=> ({title: course.title,courseId: course.courseId}));
      }
    },error=>{
      this.handleError(error);
    })
  }

//on standard change
selectedStandard(subCatId: string,isLoadConfig: boolean=true) {
  this.subCatId=subCatId;
  this.topicList=[];
  this.topicId='';
  this.subtopicList=[];
  this.subtopicId='';
  this.courseId='';
  this.courseList=this.courseMaster
  .filter(course=> course['subcategory']['_id']==subCatId)
  .map(course=> ({title: course.title,courseId: course.courseId}));
  if(isLoadConfig) {
    this.updateAssessmentConfig();
  }
}

//find course 
findCourse = courseId => this.courseMaster.find(course=> course.courseId == courseId);

//get topics by course id
getTopics(courseId:string,topicId:string=null) {
  this.courseId=courseId
  this.topicList=[];
  this.topicId='';
  this.subtopicList=[];
  this.subtopicId='';
  let course = this.findCourse(courseId);
  if(course && course.topics) {
    this.topicList = course.topics.map(topic=> ({title: topic.title,topicId: topic.topicId}));
  }
  if(topicId) {
    this.getSubtopics(topicId);
  }
  /*if(this.formType=='add') {
  }*/
  this.updateAssessmentConfig();
}

//get subtopics by topic id
getSubtopics(topicId:string) {
  this.topicId=topicId;
  this.subtopicId='';
  this.subtopicList=[];
  let course = this.findCourse(this.courseId);
  if(course && course.topics) {
    let topic=course.topics.find(topic=> topic.topicId == topicId);
    if(topic && topic.subtopics) {
      this.subtopicList=topic.subtopics.map(subtopic=> ({title: subtopic.title,subtopicId: subtopic.subtopicId}));
    }
  }
  if(this.formType=='add') {
    this.updateAssessmentConfig();
  }
}

//on subtopic change
setSubtopic(subtopicId:string) {
  this.subtopicId=subtopicId;
  if(this.formType=='add') {
    this.updateAssessmentConfig();
  }
}

//on add new assessment
addNewAssessment() {
  this.isLoadAssessmentForm=true;
  this.formType='add';
  this.updateAssessmentConfig();
}

//update config
updateAssessmentConfig(assessmentId:string=null,isResetFilter:boolean=false) {
  this.assessmentConfig={};
  this.assessmentConfig['courseId']=this.courseId;
  this.assessmentConfig['topicId']=this.topicId;
  this.assessmentConfig['subtopicId']=this.subtopicId;
  this.assessmentConfig['formType']=this.formType;
  this.assessmentConfig['visibility']=this.visibility;
  if(assessmentId) {
    this.assessmentConfig['assessmentId']=assessmentId;
  }
  if(isResetFilter) {
    this.assessmentConfig['isResetFilter']=isResetFilter;
  }
}

//set visibility
setVisibility() {
  this.updateAssessmentConfig();
}

//show questions
showAssessments() {
  this.isLoadAssessmentForm=false;
}

//update assessment
updateAssessment(data:any) {
  let assessmentId =data['assessmentId'];
  this.isLoadAssessmentForm=true;
  this.formType='edit';
  this.updateAssessmentConfig(assessmentId);
}

//set assessment details
setAssessmentDetails(assessmentInfo:any) {
  if(assessmentInfo) {
    if(assessmentInfo['courseId']) {
      let course = this.findCourse(assessmentInfo['courseId']);
      if(course && course['subcategory']) {
        this.selectedStandard(course['subcategory']._id,false);
        this.courseId=assessmentInfo['courseId'];
      }
    }
    if(assessmentInfo['visibility']) {
      this.visibility=assessmentInfo['visibility'];
    }

  }
}

//reset filters
resetFilters() {
  this.subCatId='';
  this.courseList=[];
  this.courseId='';
  this.topicList=[];
  this.topicId='';
  this.subtopicList=[];
  this.subtopicId='';
  this.courseList=this.courseMaster.map(course=> ({title: course.title,courseId: course.courseId}));
  this.updateAssessmentConfig(null,true);
}

//handle error
handleError(error:any) {
  this.messageService.showLoader.emit(false);
  this.errorService.handleError(error, this._vcr);
}

}
