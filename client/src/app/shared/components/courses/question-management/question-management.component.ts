import { Component, OnInit,Input, OnChanges, ViewContainerRef} from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { CourseService } from './../../../services/courses/course.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { AuthenticationService } from './../../../services/common/authentication.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-question-management',
  templateUrl: './question-management.component.html',
  styleUrls: ['./question-management.component.css'],
  providers: [ CourseService ]
})
export class QuestionManagementComponent implements OnInit {

  public userId:string;
  public basePath = new CommonConfig().BASE_URL+CommonConfig.FOLDERS[6];
  public totalItems:number=0;
  public currentPage:number=1;
  public itemsPerPage:number=10;
  CONFIG=CommonConfig;
  questionTypes: any= CommonConfig.QUESTION_TYPE;
  levels: any= CommonConfig.QUESTION_DIFFICULTY_LEVELS;
  standards:any=[];

  
  urlPrefix:string
  role:string;

  courseMaster:any=[];
  courseList:any=[];
  courseId: string;
  topicList:any=[];
  topicId: string;
  subtopicList:any=[];
  subtopicId:string;
  subCatId:string;

  questions:any=[];
  qusDetails:any;
  questionId:string;

  level:string;  
  questionType: any;

  qusCategoriesConfig:any={};
  qusCategoriesList:any=[];
  qusCategories:any=[];

  isLoadQuestionForm:boolean=false;
  questionConfig:any={};
  formType:string='add';

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
       // this.courseList=data['courses'].map(course=> ({title: course.title,courseId: course.courseId}));
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
    this.updateQuestionConfig();
  }
}

//find course 
findCourse = courseId => this.courseMaster.find(course=> course.courseId == courseId);

//get topics by course id
getTopics(courseId:string,topicId:string=null,isLoadConfig: boolean=true) {
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
    this.getSubtopics(topicId,isLoadConfig);
  }
  if(isLoadConfig) {
    this.updateQuestionConfig();
  }
}

//get subtopics by topic id
getSubtopics(topicId:string,isLoadConfig: boolean=true) {
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
  if(isLoadConfig) {
    this.updateQuestionConfig();
  }
}

//on subtopic change
setSubtopic(subtopicId:string,isLoadConfig: boolean=true) {
  this.subtopicId=subtopicId;
  if(isLoadConfig) {
    this.updateQuestionConfig();
  }
}

//on add new question
addNewQuestion() {
  this.isLoadQuestionForm=true;
  this.formType='add';
  this.updateQuestionConfig();
}

//update config
updateQuestionConfig(questionId:string=null,isResetFilter:boolean=false) {
  this.questionConfig={};
  this.questionConfig['courseId']=this.courseId;
  this.questionConfig['topicId']=this.topicId;
  this.questionConfig['subtopicId']=this.subtopicId;
  this.questionConfig['formType']=this.formType;
  if(questionId) {
    this.questionConfig['questionId']=questionId;
  }
  if(isResetFilter) {
    this.questionConfig['isResetFilter']=isResetFilter;
  }
}

//set assessment details
setQuestionDetails(questionInfo:any) {
  if(questionInfo && questionInfo['courseId']) {
   /* let course = this.findCourse(questionInfo['courseId']);
    if(course && course['subcategory']) {
      this.selectedStandard(course['subcategory']._id,false);
      this.getTopics(questionInfo['courseId'],questionInfo['topicId'],false);
      this.setSubtopic(questionInfo['subTopicId'],false);
    }*/
    let course = this.findCourse(questionInfo['courseId']);
    this.subCatId=course['subcategory']._id;
    this.courseId=questionInfo['courseId'];
    this.topicList=[];
    this.topicId=questionInfo['topicId'];
    this.subtopicList=[];
    this.subtopicId='';
    this.courseList=this.courseMaster
    .filter(course=> course['subcategory']['_id']==this.subCatId)
    .map(course=> ({title: course.title,courseId: course.courseId}));
    if(course && course.topics) {
      this.topicList = course.topics.map(topic=> ({title: topic.title,topicId: topic.topicId}));
      let topic=course.topics.find(topic=> topic.topicId == questionInfo['topicId']);
      if(topic && topic.subtopics) {
        this.subtopicList=topic.subtopics.map(subtopic=> ({title: subtopic.title,subtopicId: subtopic.subtopicId}));
        this.subtopicId=questionInfo['subTopicId'];
      }
    }
  }
}

//show questions
showQuestions() {
  this.isLoadQuestionForm=false;
  this.formType='add';
}

//update question
updateQuestion(data:any) {
  let questionId =data['questionId'];
  this.isLoadQuestionForm=true;
  this.formType='edit';
  this.updateQuestionConfig(questionId);
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
  this.updateQuestionConfig(null,true);
}

//handle error
handleError(error:any) {
  this.messageService.showLoader.emit(false);
  this.errorService.handleError(error, this._vcr);
}

}
