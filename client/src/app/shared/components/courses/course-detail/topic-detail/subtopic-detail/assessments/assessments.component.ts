import { Component, OnInit,Input,ViewContainerRef,OnDestroy,ViewChild,ElementRef,EventEmitter,Output} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService } from './../../../../../../services/courses/course.service';
import { AssessmentService } from './../../../../../../services/assessments/assessment.service';
import { CommonConfig } from './../../../../../../config/common-config.constants';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { AuthenticationService } from './../../../../../../services/common/authentication.service';
import { MenuService } from './../../../../../../services/common/menu.service';
import * as $ from 'jquery';
import swal  from 'sweetalert2';
import * as _ from "lodash";

@Component({
	selector: 'app-assessments',
	templateUrl: './assessments.component.html',
	styleUrls: ['./assessments.component.css'],
	providers: [ CourseService,AssessmentService ]
})
export class AssessmentsComponent implements OnInit,OnDestroy {
  @Input() courseOwnerUserId?:any;
  @Input() assessmentConfig?: any;
  @Output() updateAssessment = new EventEmitter<Object>();
  @Output() resetFilters = new EventEmitter<Object>();
  @ViewChild('clsRandomAssment') clsRandomAssment: ElementRef;

  assessmentOwnerUserId:string;
  courseId:string;
  assessments:any=[];
  urlPrefix:string;
  CONFIG:any=CommonConfig;
  role:string;
  userId:string;
  type:string;
  assessmentTypes:any=['Test','Practice','Exam','Self Evaluation'];

  topicsConfig:any;
  topicsList:any= [];
  selectedTopics:any=[];
  topicArr:any= [];
  selectedTopicsList:any=[];

  assessmnetsBytype:any=[];
  levels: any= CommonConfig.ASSESSMENT.ASSESSMENT_DIFFICULTY_LEVELS;
  level: string;
  subTopicsConfig:any;
  subTopicsList:any= [];
  selectedSubTopics:any=[];
  masterSubTopicsList:any= [];
  qusLevel:any;
  hasError: boolean=false;
  assementStatus: string[]=['Not Attempted','Attempted'];
  amntStaus:string;
  errorMessage: string;
  standards:any=[];
  subCatId:string;
  courseMaster:any=[];
  courseList:any=[];

 //totalQuestion: number= 10;
 totalQuestion: any= {
   value: 10,//CommonConfig.ASSESSMENT.TOTAL_QUESTION,
 };
 totalBasicLevelQus: any= {
   value: 3,//CommonConfig.ASSESSMENT.TOTAL_BASIC_QUESTION,
 }
 totalItmLevelQus:any= {
   value: 4,//CommonConfig.ASSESSMENT.TOTAL_ITM_QUESTION,
 }
 totalAdvLevelQus:any= {
   value: 3,//CommonConfig.ASSESSMENT.TOTAL_ADV_QUESTION,
 }
 assessmentDetails:any;
 totalItems:number=0;
 currentPage:number=1;
 itemsPerPage:number=10;
 nestedComp:boolean=false;

 constructor( 
   private router: Router,
   private route: ActivatedRoute,
   private courseService: CourseService,
   private assessmentService: AssessmentService,
   private authenticationService: AuthenticationService,
   private messageService: MessageService,
   private menuService: MenuService,
   private errorService: ErrorService,
   private toastr: ToastsManager,
   private _vcr: ViewContainerRef,
   ) { }

 ngOnInit() {
   this.userId= localStorage.getItem("userId");
   if(!this.userId) {
     this.router.navigate(['/']);
   }
   this.urlPrefix = this.authenticationService.userRole.toLowerCase();
   this.role=this.authenticationService.userRole;
   if(this.role!==CommonConfig.USER_STUDENT) {
     if(!this.nestedComp) {
       this.courseId=this.route.snapshot.params['courseId'];
       if(this.courseId) {
         this.courseId=this.courseId.split('?')[0];
       }
     }
   }else {
     this.courseId=this.route.snapshot.params['id'];
     localStorage.setItem('courseId',this.courseId);
     this.menuService.sidebar.emit({hide:true, contentPage:'playContent'});
     $(".body-section").css("overflow-y", " unset");
     $(".side-bar").hide();
   }
   if(this.route.snapshot.params['type'] && this.route.snapshot.params['type']=='practice') {
     this.type=this.assessmentTypes[1];
   }else {
     this.type=this.assessmentTypes[0];
   }
   if(!this.nestedComp) {
     this.getTopicFilterData();
   }else {
     this.getFilterData();
   }
   this.configDropDown(); 
 }

//load config 
configDropDown() {
  this.qusLevel=this.levels[3];
  this.topicsConfig = { 
    singleSelection: false, 
    text:"Select topics",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    badgeShowLimit: 1,
  }; 
  this.subTopicsConfig = { 
    singleSelection: false, 
    text:"Select sub-topics",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    badgeShowLimit: 1,
  }; 
}

//get assessments based on topic id
getAssessments(filter={}) {
  this.assessments=[];
  this.messageService.showLoader.emit(true);
  this.assessmentService.getAssessments(filter)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      if(response['data']) {
        let data= response['data'];
        if(response['totalCount']) {
          this.totalItems=response['totalCount'];
        }
        this.assessments=this.generateReportData(data);
      }
    }
  },error=>{
    this.handleError(error);
  })
}

//view image in modal
viewImage(imgUrl: string) {
  this.messageService.showImage(imgUrl,imgUrl);
}


/*pagination logic start here*/
public setPage(pageNo: number): void {
  this.currentPage = pageNo;
}

//on page change
pageChanged(event: any): void {
  let current=event.page;
  this.currentPage = event.page;
  this.applyFilter(--current * this.itemsPerPage);
}

//apply filter
applyFilter(skip:number=0) {
  let filter = {
    skip: skip,
    limit: this.itemsPerPage,
  };
  if(this.courseId) {
    filter['courseId']=this.courseId;
  }
  if(this.level) {
    filter['level']=this.level;
  } 
  if(this.type) {
    if(this.type==this.assessmentTypes[1]) {
      filter['type']=[this.assessmentTypes[1],this.assessmentTypes[3]];
    }else {
      filter['type']=this.type;
    }
  }
  if(this.amntStaus) {
    if(this.amntStaus==this.assementStatus[1]) {
      filter['assementStatus']=1;
    }else {
      filter['assementStatus']=0;
    }
  }
  if(this.selectedTopicsList.length) {
    filter['topics']=this.selectedTopicsList.map(t=> t.id)
  }
  this.getAssessments(filter);
}

//get filter data
getTopicFilterData() {
  this.courseService.getFilterTopics(this.courseId)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data'] && response['data'].topics) {
      this.topicsList=response['data'].topics.map(t=> {
        let subtopics=t.subtopics.map(s=> {
          return { id: s._id, itemName: s.title, topic: t._id};
        });
        if(subtopics) {
          this.subTopicsList= this.subTopicsList.concat(subtopics);
        }
        return { id: t._id, itemName: t.title};
      });
      this.masterSubTopicsList= this.subTopicsList;
      this.applyFilter();
    }
  },error=>{
    this.handleError(error);
  })
}

//get filter data
getFilterData() {
  this.courseList=[];
  this.courseId='';
  this.topicsList=[];
  this.selectedTopicsList=[];
  this.messageService.showLoader.emit(true);
  this.courseService.getCoursesForFilters()
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      let data=response['data'];
      this.courseMaster=data['courses'];
      this.standards=data['subCategories']
      this.applyFilter();
    }
  },error=>{
    this.handleError(error);
  })
}

//on standard change
selectedStandard(subCatId: string) {
  this.subCatId=subCatId;
  this.topicsList=[];
  this.selectedTopicsList=[];
  this.courseId='';
  this.courseList=this.courseMaster
  .filter(course=> course['subcategory']['_id']==subCatId)
  .map(course=> ({title: course.title,courseId: course.courseId}));
}

//find course 
findCourse = courseId => this.courseMaster.find(course=> course.courseId == courseId);

//get topics by course id
getTopics(courseId:string) {
  this.courseId=courseId
  this.topicsList=[];
  let course = this.findCourse(courseId);
  if(course && course.topics) {
    this.topicsList = course.topics.map(t=> ({ id: t.topicId, itemName: t.title}));
  }
}

//reset filter
resetFilter() {
  this.selectedTopicsList=[];
  this.level='';
  this.amntStaus='';
  this.applyFilter();
}

ngOnChanges() {
  this.assessmentOwnerUserId=this.courseOwnerUserId;
  let assessmentDetails=this.assessmentConfig;
  if(assessmentDetails) {
    this.nestedComp=true;
    this.courseId= assessmentDetails['courseId'];
   /* if(this.courseId) {
      this.getFilterData();
    }*/
    //this.topicId= assessmentDetails['topicId'];
    //this.subTopicId=assessmentDetails['subtopicId'];
    if(assessmentDetails['isResetFilter']) {
      this.applyFilter();
    }
  }
}

//assessment status
selectedAssessmentStatus(status:string) {
  this.amntStaus=status;
}

//redirect to assemesnts details
getAssessmentDetails(id: string) {
	this.router.navigate(['/',this.urlPrefix,'courses','topics','assessments',id],{queryParams:{tab:'questions'}})
}

// Handle error
handleError(error) {
  this.errorService.handleError(error, this._vcr);
  //this.messageService.showErrorToast(this._vcr,error.json().msg);
}

//delete assessment by assessment id
deleteAssessment(id:string) {
  this.messageService.deleteConfirmation(()=> {
    this.messageService.showLoader.emit(true);
    this.assessmentService.deleteAssessment(id)
    .subscribe(response=> {
      this.messageService.showLoader.emit(false);
      if(response) {
        //this.getAssessments();
        this.applyFilter();
        this.messageService.successMessage('Assessment', 'Successfully Deleted');
      }
    },error=>{
      this.handleError(error);
    })
  });
}

//take assessment
takeAssessment(assessmentId: string) {
  this.messageService.showLoader.emit(true);
  this.assessmentService.getAssessmentInfo(assessmentId)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      if(response['data'].isAttamptLimitExceed) {
        this.showAttemptsLimitExceed();
      }else {
        if(this.role==this.CONFIG.USER_STUDENT) {
          this.router.navigate(['/', this.urlPrefix, 'course-details', this.courseId, 'assessments', 'play-assessment',assessmentId]);
        }else {
          this.router.navigate(['/', this.urlPrefix, 'courses', this.courseId, 'assessments', assessmentId, 'play-assessment']);
        }
      }
    }
  },error=> {
    this.messageService.showLoader.emit(false);
    this.handleError(error);
  });
} 

 //show attempts limit exceed warning
 showAttemptsLimitExceed() {
   swal({
     type: 'error',
     text: 'You have exceeded the number of allowed attempts for this Test !',
     showConfirmButton: false,
     timer: 2200
   })
 }

 //set assessment type
 setAssessmentType(type: string) {
   this.type=type;
   this.totalItems=0;
   this.setPage(0);
   this.applyFilter();
 }

 //set level
 selectedLevel(level: string) {
   this.level=level;
 }

 //filter assessment by assessment type
/* filterByType() {
   this.assessments=[];
   if(this.type==this.assessmentTypes[1]) {
     this.assessments=this.assessmentList.filter(assessmnet=>assessmnet.type==this.type || assessmnet.type == this.assessmentTypes[3]);
   }else {
     this.assessments=this.assessmentList.filter(assessmnet=>assessmnet.type==this.type);
   }
   this.assessmnetsBytype=this.assessments;
   if(this.selectedTopicsList.length>0) {
     this.onTopicsChange();
   }
 }*/

 //generate report data
 generateReportData(assessments:any) {
   return assessments.map(assessment=> {
     if(assessment['results'] && assessment['results'].length>0) {
       assessment['max']=_.maxBy(assessment['results'], 'score').score;
       assessment['min']=_.minBy(assessment['results'], 'score').score;
       assessment['avg']=_.meanBy(assessment['results'], 'score').toFixed(2);
       assessment['totalAttampts']=assessment['results'].length;
     }
     return assessment;
   })
 }

//on topic change
/*onTopicsChange(event?: any) {
  this.assessments=[];
  if(this.selectedTopicsList.length>0) {
    this.assessments=this.assessmnetsBytype.filter(assessment=> {
      return this.selectedTopicsList.map(t=> t.id).some(t=> assessment.topics.includes(t));
    })
  }else {
    this.assessments=this.assessmnetsBytype;
  }
}*/

ngOnDestroy() {
  $(".body-section").css("overflow-y", " auto");
  this.menuService.sidebar.emit({hide: true, contentPage:'playContent'});
  $(".side-bar").hide();
}

 /*
* deselect topic
*/
onTopicsDeSelectAll(topic: any) {
  this.selectedSubTopics=[];
}
/*
* topics dropdown on de select event
*/
onTopicsDeSelect(topic: any) {
  let subtopics = this.subTopicsList.filter(s=> s.topic == topic.id);
  subtopics.forEach(s=> {
    let i=this.selectedSubTopics.findIndex(st=> st.id == s.id);
    if(i>=0) {
      this.selectedSubTopics.splice(i, 1);
    }
    i=this.subTopicsList.findIndex(sl=> sl.id==s.id);
    if(i>=0) {
      this.subTopicsList.splice(i, 1);
    }
  });
  if(this.selectedTopics.length==0) {
    this.subTopicsList= this.masterSubTopicsList;
  }
}

/*
* topics drop down on change event
*/
onTopicFilterChange(topic: any) {
  this.subTopicsList=[]
  this.selectedTopics.forEach(t=> {
    let subtopics= this.masterSubTopicsList.filter(s=> s.topic==t.id);
    if(subtopics) {
      this.subTopicsList= this.subTopicsList.concat(subtopics);
    }
  });
}

/*
* for custom validation
*/
validate(numberField:any) {
  if(!this.validateTotalQuestionCount(numberField)) { return; }
  let sum=parseInt(this.totalBasicLevelQus.value)+parseInt(this.totalItmLevelQus.value)+parseInt(this.totalAdvLevelQus.value);
  if(sum!= this.totalQuestion.value) {
    this.totalQuestion['notMatch']=true;
    this.hasError=true;
  }else {
    this.totalQuestion['notMatch']=false;
    this.hasError=false;
  }
}

/*
* validate total question field
*/
validateTotalQuestionCount(numberField:any): boolean {
  if(numberField.value === undefined || numberField.value === null) {
    this.hasError=true;
    numberField['notNumber']=false;
    numberField['required']=true;
    return false ;
  }else if(numberField.value>=0){
    numberField['required']=false;
    this.hasError=false;
  }
  if(!this.isNumber(numberField.value)) {
    numberField['notNumber']=true;
    this.hasError=true;
    return false;
  }else {
    numberField['notNumber']=false;
    this.hasError=false;
  }
  return true;
}

/*
* validate number
*/
isNumber(val: string): boolean {
  let pattern = /^\d+$/;
  return pattern.test(val);  
}

//transform array based on given property
transform = (dataArr:any,prop:string):Array<any> => dataArr.map(obj=> obj[prop]);

//generate self evolution assessment
generateRandomPracticeSet() {
  if(!this.qusLevel) {
    this.toastr.error("Level is required", 'Oops!');
    return;
  }
 /* if(this.hasError && this.qusLevel == this.levels[3]) { 
    this.toastr.error("Validate total question", 'Oops!');
    return;
  }*/
  let filter={};
  filter['limit']=this.totalQuestion.value;
  filter['courseId']=this.courseId;
  if(this.selectedSubTopics.length) {
    filter['subTopicId']=this.transform(this.selectedSubTopics,'id');
  }else if(this.selectedTopics.length) {
    filter['topicId']=this.transform(this.selectedTopics,'id');
  }
  if(this.qusLevel == this.levels[3]) {
    filter['counter_level']= [this.totalBasicLevelQus.value,this.totalItmLevelQus.value,this.totalAdvLevelQus.value];
  }else {
    filter['level']= this.qusLevel;
  }
  this.errorMessage='';
  this.messageService.showLoader.emit(true);
  this.assessmentService.generateRandomAssessment({level: this.qusLevel,courseId:this.courseId},filter)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data'] && response['data'].assessmentId) {
      this.clsRandomAssment.nativeElement.click();
      if(this.role==this.CONFIG.USER_STUDENT) {
        this.router.navigate(['/',this.urlPrefix,'course-details',this.courseId,'assessments','play-assessment',response['data'].assessmentId]);
      }else {
        this.router.navigate(['/', this.urlPrefix, 'courses', this.courseId, 'assessments', response['data'].assessmentId, 'play-assessment']);
      }
    }
  },error=> {
    this.errorMessage=error.json().msg;
    this.handleError(error);
  })
}

//navigate to result
viewResults(id,totalAttampts) {
  if(!totalAttampts) return;
  if(this.role==this.CONFIG.USER_STUDENT) {
    this.router.navigate(['/', this.urlPrefix, 'course-details', this.courseId, 'assessments', 'result',id]);
  }else {
    this.router.navigate(['/',this.urlPrefix, 'courses', this.courseId,'assessments', id, 'result']);
  }
}

//assessment details
setAssessmentDetails(id:string) {
  this.assessmentDetails=this.assessments.find(assessment=> assessment._id == id)
}

//on edit assessment
editAssessment(id: string) {
  if(this.nestedComp) {
    this.updateAssessment.emit({assessmentId: id})
  }else {
    this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId,'assessments','edit',id]);
  }

}

}
