import { Component, OnInit,Input, OnChanges, ViewContainerRef,Output,EventEmitter} from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { CourseService } from './../../../../../../services/courses/course.service';
import { CommonConfig } from './../../../../../../config/common-config.constants';
import * as $ from 'jquery';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { AuthenticationService } from './../../../../../../services/common/authentication.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
  providers: [ CourseService ]
})

export class QuestionsComponent implements OnInit, OnChanges {
  @Input() qusConfig?: any;
  @Input() subTopicOwnerUserId?: string;
  @Output() updateQuestion = new EventEmitter<Object>();
  //@Output() showQuestions = new EventEmitter<Object>();
  @Output() resetFilters = new EventEmitter<Object>();

  public questionOwnerUserId: string;
  public userId:string;
  public basePath = new CommonConfig().BASE_URL+CommonConfig.FOLDERS[6];
  public totalItems:number=0;
  public currentPage:number=1;
  public itemsPerPage:number=10;
  errorMessage:string
  urlPrefix:string
  questions:any=[];
  subTopicId:string;
  questionTypes: any= CommonConfig.QUESTION_TYPE;
  courseId: string;
  topicId: string;
  dataArr:any=[];
  role:string;
  CONFIG=CommonConfig;
  levels: any= CommonConfig.QUESTION_DIFFICULTY_LEVELS;
  level:string;  
  qusCategoriesConfig:any={};
  qusCategoriesList:any=[];
  qusCategories:any=[];
  questionType: any;
  questionId:string;
  qusDetails:any;
  nestedComp:boolean=false;

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
    this.userId= localStorage.getItem("userId");
    if(!this.userId) {
      this.router.navigate(['/']);
    }
    this.role = this.authenticationService.userRole;
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    if(!this.nestedComp) {
      this.courseId= this.route.snapshot.params['courseId'];
      this.topicId= this.route.snapshot.params['topicId'];
      this.subTopicId= this.route.snapshot.params['subtopicId'];
      if(this.subTopicId) {
        this.subTopicId=this.subTopicId.split('?')[0];
      }
    }
    this.applyFilter();
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
  this.qusCategoriesList = CommonConfig.ASSESSMENT.QUESTION_CATEGORIES.map(cat=>({"id":cat,"itemName":cat}));
}

ngOnChanges() {
  this.questionOwnerUserId=this.subTopicOwnerUserId;
  let qusDetails=this.qusConfig;
  if(qusDetails) {
    this.nestedComp=true;
    this.courseId= qusDetails['courseId'];
    this.topicId= qusDetails['topicId'];
    this.subTopicId=qusDetails['subtopicId'];
    if(qusDetails['isResetFilter']) {
      this.applyFilter();
    }
  }
}

//view image in modal
viewImage(imgUrl: string) {
  this.messageService.showImage(imgUrl,imgUrl);
}

/*pagination logic start here*/
/*public setPage(pageNo: number): void {
  this.currentPage = pageNo;
}*/

public pageChanged(event: any): void {
  let current=event.page;
  this.currentPage = event.page;
  this.applyFilter(--current * this.itemsPerPage);
  //this.paginationData();
}

/*paginationData() {
  const indexOfLastItem = this.currentPage * this.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
  this.questions = this.dataArr.slice(indexOfFirstItem, indexOfLastItem);
}*/
/*pagination logic end here*/

//apply filter
applyFilter(skip: number=0) {
  let filter = {
    skip: skip,
    limit: this.itemsPerPage,
  };
  if(this.subTopicId) {
    filter['subTopicId']=this.subTopicId;
  }
  if(this.level) {
    filter['level']=this.level;
  } 
  if(this.questionType) {
    filter['qusType']=this.questionType;
  }
  if(this.qusCategories.length) {
    filter['qusCategories']=this.qusCategories.map(obj=> obj['id']);
  }
  if(this.nestedComp) {
    if(this.courseId) {
      filter['courseId']=this.courseId;
    }
    if(this.topicId) {
      filter['topicId']=this.topicId;
    }
  }
  this.getQuestions(filter);
}

//reset filter
resetFilter() {
  this.level="";
  this.questionType="";
  this.qusCategories=[];
  if(this.nestedComp) {
    this.resetFilters.emit();
  }else {
    this.applyFilter();
  }

}

//set level
selectedLevel(level: string) {
  this.level=level;
}

//set question type
selectedQusType(qusType: string) {
  this.questionType=qusType;
}

//get question based on topic id
getQuestions(filter: any={}) {
  this.messageService.showLoader.emit(true);
  this.courseService.getQuestions(filter)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      let data= response['data'];
      this.questions=data;
      this.dataArr=data;
      //this.totalItems=data.length;
      //this.paginationData();
    }
    if(response['totalCount']) {
      this.totalItems=response['totalCount'];
    }
  },error=>{
    this.handleError(error);
    this.errorMessage = error.json().msg;
  })
}

//toggle icon on div collapse
toggleCard(id:any) {
  $('#'+id).toggleClass('fa-chevron-circle-down  fa-chevron-circle-up')
}

//delete question by id
deleteQuestion(_id:string) {
  this.messageService.deleteConfirmation(()=> {
    this.courseService.deleteQuestion(_id)
    .subscribe(response=> {
      if(response['success']) {
        this.applyFilter();
      }
    },error=> { 
      this.errorMessage = error.json().msg;
      this.handleError(error);
    });
  })
}

//edit question
editQuestion(id:string,type:string) {
  if(this.nestedComp) {
    this.updateQuestion.emit({questionId: id})
  }else {
    let qusTypeRoute='';
    switch (type) {
      case this.questionTypes[1]:
      qusTypeRoute='multiple-choice'
      break;

      case this.questionTypes[2]:
      qusTypeRoute='true-false'
      break;

      default:
      qusTypeRoute='single-choice'
      break;
    }
    this.router.navigate(['/', this.urlPrefix, 'courses', this.courseId , 'topics', this.topicId,'subtopics',this.subTopicId,'questions','edit',id],{queryParams: { qusType: qusTypeRoute}});
  }
}


setQuestionDetails(id: string) {
  this.qusDetails=this.questions.find(qus=> qus._id===id);
}
 // Handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 }

}
