import { Component, OnInit,OnChanges, ViewContainerRef,Input,Output,EventEmitter} from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { CommonConfig } from './../../../../../../../config/common-config.constants';
import { AuthenticationService } from './../../../../../../../services/common/authentication.service';
import { CourseService } from './../../../../../../../services/courses/course.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from  './../../../../../../../services/common/error.service';

@Component({
  selector: 'app-manage-questions',
  templateUrl: './manage-questions.component.html',
  styleUrls: ['./manage-questions.component.css'],
  providers: [CourseService]
})

export class ManageQuestionsComponent implements OnInit,OnChanges {
  @Input() qusConfig?: any;
  @Output() showQuestions = new EventEmitter<Object>();
  @Output() setQuestionInfo = new EventEmitter<Object>();

  urlPrefix: String;
  questionTypes: any= CommonConfig.QUESTION_TYPE;
  levels: any= CommonConfig.QUESTION_DIFFICULTY_LEVELS;
  categories=CommonConfig.ASSESSMENT.QUESTION_CATEGORIES;
  questionStatus=CommonConfig.QUESTION_STATUS;
  visibility:string=CommonConfig.QUESTION_STATUS.PUBLIC;
  qusCategoriesConfig:any={};
  qusCategoriesList:any=[];
  backendErrorMsg:any;
  questionType: any;
  subTopicId: string;
  question: any;
  errorMessage: string;
  level:string;  
  formType:string='add';
  qusCategories:any=[];
  questionId:string;
  courseId: string;
  topicId: string;
  creditTo: string;
  qusInfo:any={};
  nestedComp:boolean=false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private courseService: CourseService,
    private _vcr: ViewContainerRef,
    private errorService: ErrorService,
    ) {
  }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    if(!this.nestedComp) {
      this.courseId= this.route.snapshot.params['courseId'];
      this.topicId= this.route.snapshot.params['topicId'];
      this.subTopicId= this.route.snapshot.params['subtopicId'];
      if(this.subTopicId) {
        this.subTopicId=this.subTopicId.split('?')[0];
      }
      this.loadForms();
    }
    this.loadConfig();
  }

 //load config
 loadConfig() {
   this.qusCategoriesConfig = { 
     singleSelection: false, 
     text: "Select categories",
     selectAllText: 'Select All',
     unSelectAllText: 'UnSelect All',
     enableSearchFilter: true,
     badgeShowLimit: 2,
   };
   this.questionType=this.questionTypes[0];
   this.qusCategoriesList = this.categories.map(cat=>({"id":cat,"itemName":cat}));
 }

 
 ngOnChanges() {
   let qusDetails=this.qusConfig;
   if(qusDetails) {
     this.nestedComp=true;
     this.formType=qusDetails['formType'];
     this.courseId= qusDetails['courseId'];
     this.topicId= qusDetails['topicId'];
     this.subTopicId=qusDetails['subtopicId'];
     if(qusDetails['questionId']) {
       this.questionId=qusDetails['questionId'];
       this.getQuestion();
     }
   }
 }

//set level
selectedLevel(level:string) {
  this.level=level;
}

//load question type based form
loadForms() {
  this.questionId= this.route.snapshot.params['qusId'];
  if(this.questionId) {
    this.questionId=this.questionId.split('?')[0];
    this.formType='edit';
    this.getQuestion();
  }
}

//set question type 
setQuestionType(questionType: string) {
  this.questionType= questionType;
}

/*
* get question based on question id
*/
getQuestion(){
  this.messageService.showLoader.emit(true);
  this.courseService.getQuestionById(this.questionId)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      this.qusInfo=response['data'];
      if(this.qusInfo) {
        if(this.nestedComp) {
          this.setQuestionInfo.emit(this.qusInfo);
        }
        this.questionType=this.qusInfo.qusType;
        if(this.qusInfo.creditTo) {
          this.creditTo=this.qusInfo.creditTo;
        }
        if(this.qusInfo.qusCategories && this.qusInfo.qusCategories.length) {
          this.qusCategories=this.qusInfo.qusCategories.map(cat=> { return { 'id': cat, 'itemName': cat}});
        }
        this.level=this.qusInfo.level;
      }
    }
  },error=> {
    this.errorMessage = error.json().msg;
    this.handleError(error);
  })
}

/*//form validation
isValid() {
  if(this.qusCategories.length == 0) return this.messageService.showErrorToast(this._vcr,'Question category is required');
  if(!this.level) return this.messageService.showErrorToast(this._vcr,'Difficulty level is required');
  if(this.nestedComp) {
    if(!this.courseId) return this.messageService.showErrorToast(this._vcr,'Course is required');
    if(!this.topicId) return this.messageService.showErrorToast(this._vcr,'Topic is required');
    if(!this.subTopicId) return this.messageService.showErrorToast(this._vcr,'Subtopic is required');
  }
}*/

//add new question
newQuestionDetails(details:any) {
  let questionInfo =details['data'];
  if(this.nestedComp) {
    if(!this.courseId) return this.messageService.showErrorToast(this._vcr,'Course is required');
    if(!this.topicId) return this.messageService.showErrorToast(this._vcr,'Topic is required');
    if(!this.subTopicId) return this.messageService.showErrorToast(this._vcr,'Subtopic is required');
  }
  if(this.qusCategories.length == 0) return this.messageService.showErrorToast(this._vcr,'Question category is required');
  if(!this.level) return this.messageService.showErrorToast(this._vcr,'Difficulty level is required');
  if(!questionInfo['question']) return this.messageService.showErrorToast(this._vcr,'Question is required');
  if(questionInfo['options'].length<2) return this.messageService.showErrorToast(this._vcr,`Minimum 2 options required`);
  if(questionInfo['answers'].length==0) return this.messageService.showErrorToast(this._vcr,'Select the correct options');

  let $addOrUpdate:any=null,message:string='';
  questionInfo['courseId']=this.courseId;
  questionInfo['topicId']=this.topicId;
  questionInfo['subTopicId']=this.subTopicId;
  questionInfo['level']=this.level;
  questionInfo['qusType']=this.questionType;
  questionInfo['visibility']=this.visibility;
  questionInfo['creditTo']=this.creditTo;
  questionInfo['qusCategories']=this.qusCategories.map(cat=>cat.id);
  this.messageService.showLoader.emit(true);
  if(details['type']=='update') {
    $addOrUpdate=this.courseService.updateQuestion(this.questionId,questionInfo);
    message="updated successfully";
  }else {
    $addOrUpdate=this.courseService.saveQuestion(questionInfo);
    message="Added successfully";
  }
  $addOrUpdate.subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['success']) {
      this.messageService.successMessage('Question',message,()=> {
        if(!this.nestedComp) {
          this.router.navigate(['/', this.urlPrefix, 'courses', this.courseId , 'topics', this.topicId,'subtopics',this.subTopicId],{queryParams:{'tab':'questions'}});
        }else {
          this.showQuestions.emit();
        }
      });
    }
  },error=> {
    this.errorMessage = error.json().msg;
    this.handleError(error);
  });
}

//handle error
handleError(error) {
  this.messageService.showLoader.emit(false);
  if(error.status===500) {
    this.backendErrorMsg= this.errorService.iterateError(error);
  } else {
    this.errorService.handleError(error, this._vcr);
  }
}

}