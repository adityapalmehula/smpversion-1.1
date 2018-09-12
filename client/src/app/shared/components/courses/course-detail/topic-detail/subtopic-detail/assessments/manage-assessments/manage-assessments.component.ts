import { 
  Component, OnInit,OnChanges,OnDestroy,
  Input, Inject,Output,EventEmitter,
  AfterViewInit,ElementRef,ViewChild,ViewContainerRef, 
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { ValidationConfig } from './../../../../../../../config/validation-config.constants';
import { CourseService } from './../../../../../../../services/courses/course.service';
import { AssessmentService } from './../../../../../../../services/assessments/assessment.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';
import { CommonConfig } from './../../../../../../../config/common-config.constants';
import { AuthenticationService } from './../../../../../../../services/common/authentication.service';
import { MenuService } from './../../../../../../../services/common/menu.service';
import {IMyDrpOptions} from 'mydaterangepicker';

@Component({
  selector: 'app-manage-assessments',
  templateUrl: './manage-assessments.component.html',
  styleUrls: ['./manage-assessments.component.css'],
  providers: [ CourseService,AssessmentService ]
})

export class ManageAssessmentsComponent implements OnChanges,OnInit,AfterViewInit,OnDestroy {
  @ViewChild('close')close: ElementRef;
  @Input() assessmentConfig?: any;
  @Output() showAssessments = new EventEmitter<Object>();
  @Output() setAssessmentInfo = new EventEmitter<Object>();

  fb: FormBuilder;
  form: FormGroup;

  /*================== constants ===================*/
  ASSESSMENT_CONFIG= CommonConfig.ASSESSMENT;
  passPercentage:number= this.ASSESSMENT_CONFIG.PASS_PERCENTAGE;
  formType:string="add";
  types=this.ASSESSMENT_CONFIG.TYPES;
  levels: any= this.ASSESSMENT_CONFIG.ASSESSMENT_DIFFICULTY_LEVELS;
  marksForBasic:number=this.ASSESSMENT_CONFIG.MARKS_FOR_BASIC_LEVEL;
  marksForItm:number=this.ASSESSMENT_CONFIG.MARKS_FOR_ITM_LEVEL;
  marksForExp:number=this.ASSESSMENT_CONFIG.MARKS_FOR_ADV_LEVEL;
  qusLists:any=this.ASSESSMENT_CONFIG.QUESTION_LIST;
  qusTypes:any=this.ASSESSMENT_CONFIG.QUESTION_TYPE;
  insAtStart:any=this.ASSESSMENT_CONFIG.INSTRUCTIONS_AT_START;
  insAtTheEnd:any=this.ASSESSMENT_CONFIG.INSTRUCTIONS_AT_THE_END;
  maxAttempt: any=this.ASSESSMENT_CONFIG.MAX_ATTEMPTS;

  /* custom fields: which need a validations */
  minAppeared:any= {
    value: 0
  };
  totalQuestion: any= {
    value: this.ASSESSMENT_CONFIG.TOTAL_QUESTION,
  };
  totalBasicLevelQus: any= {
    value: this.ASSESSMENT_CONFIG.TOTAL_BASIC_QUESTION,
  }
  totalItmLevelQus:any= {
    value: this.ASSESSMENT_CONFIG.TOTAL_ITM_QUESTION,
  }
  totalAdvLevelQus:any= {
    value: this.ASSESSMENT_CONFIG.TOTAL_ADV_QUESTION,
  }
  qusLevels: any=this.ASSESSMENT_CONFIG.QUESTION_DIFFICULTY_LEVELS;
  status: any=this.ASSESSMENT_CONFIG.STATUS;
  showFeedbackAt: any=this.ASSESSMENT_CONFIG.SHOW_FEEDBACK_AT;
  showScoreAt: any=this.ASSESSMENT_CONFIG.SHOW_SCORE_AT;
  shuffleAns: any=this.ASSESSMENT_CONFIG.SHUFFLE_ANSWERS;
  visibility:string=CommonConfig.QUESTION_STATUS.PUBLIC;
  /*================= filters =================*/
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  options:any;
  daterange: any={};
  daterangeInput:any="";

  topicsConfig:any;
  subTopicsConfig:any;
  qusTypesConfig:any;

  selectedTopics:any=[];
  selectedSubTopics:any=[];
  selectedQusTypes:any=[];

  topicsList:any= [];
  subTopicsList:any= [];
  qusTypesList:any= [];
  masterSubTopicsList:any= [];

  totalMarks:number=0;

  queSelectionType: string=this.qusLists[2];
  /*=============================================================*/
  questions:any=[];
  bscQuestions:any=[];
  bscQusDataArr:any=[];
  itmQuestions:any=[];
  itmQusDataArr:any=[];
  advQuestions:any=[];
  advQusDataArr:any=[];
  qusDetails:any={};

  currentPage: number = 1;
  itemsPerPage: number = this.ASSESSMENT_CONFIG.QUESTION_PER_PAGE;
  qusDataArr:any= [];
  totalItems:number=this.questions.length;

  tags:any=[];
  urlPrefix : string;
  courseId : string;
  hasError: boolean=false;

  assessmentId:string;
  assessmentDetails:any;
  defaultPassPercentage: number=50;
  nestedComp:boolean=false;


  public basePath = new CommonConfig().BASE_URL+CommonConfig.FOLDERS[6];

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastsManager, 
    private _vcr: ViewContainerRef,
    private errorService: ErrorService,
    private courseService: CourseService,
    private assessmentService: AssessmentService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private menuService: MenuService,
    ){
    this.fb= fb;
    this.toastr.setRootViewContainerRef(_vcr);
    this.intializeForm(fb);
  }

/*
* intialize form
*/
intializeForm(fb:FormBuilder,data:any={}):void {
  if(data) {
    if(data.passPercentage) {
      this.passPercentage = data.passPercentage;
      this.defaultPassPercentage = data.passPercentage;
    }
    if(data.tags) {
      this.tags = data.tags;
    }
    if(data.insAtStart) {
      this.insAtStart = data.insAtStart;
    }
    if(data.insAtTheEnd) {
      this.insAtTheEnd = data.insAtTheEnd;
    }
    if(data.questions) {
      this.qusDataArr = data.questions;
     // this.questions=this.qusDataArr;
     this.totalItems=this.qusDataArr.length;
     this.paginationData();
     this.filterQuestionByLevel(this.qusDataArr);
     this.totalBasicLevelQus['value']=this.bscQusDataArr.length;
     this.totalItmLevelQus['value']=this.itmQusDataArr.length;
     this.totalAdvLevelQus['value']=this.advQusDataArr.length;
   }
   if(data.totalQuestion) {
     this.totalQuestion.value = data.totalQuestion;
   } 
   if(data.totalMarks) {
     this.totalMarks = data.totalMarks;
   }
   if(data.maxTime) {
     data.maxTime=this.secondsToHM(data.maxTime);
   }
 }
 this.form=fb.group({
   assessment: [data.assessment || '',[Validators.required]],
   type: [data.type || this.types[1],[Validators.required]],
   level: [data.level || this.levels[3],[Validators.required]],
   maxTime: [data.maxTime || this.ASSESSMENT_CONFIG.MAX_TIME,[]],
   showFeedbackAt: [data.showFeedbackAt || this.showFeedbackAt[0],[]],
   showScoreAt: [data.showScoreAt || this.showScoreAt[0],[]],
   shuffleAns: [data.shuffleAns || this.shuffleAns[0],[]],
   maxAttempts: [data.maxAttempts || this.ASSESSMENT_CONFIG.MAX_ATTEMPTS[0],[]],
   status: [data.status || this.status[0]],
   myDateRange: [''] 
 });
}

ngOnInit() {
  this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  if(!this.nestedComp) {
    this.courseId=this.route.snapshot.params['courseId'];
    this.assessmentId=this.route.snapshot.params['assessmentId'];
    this.menuService.sidebar.emit({hide:true, contentPage:'playContent'});
    if(this.assessmentId) {
      this.formType = 'edit';
      this.getAssessmentDetails();
    }
    this.applyFilter();
    this.getFiltersData(this.courseId);
  }else {
    if(this.formType!='edit') {
      this.applyFilter();
    }
  }
  this.configDropDown();
}

/*
* assign configration 
*/
configDropDown() {
  this.topicsConfig = { 
    singleSelection: false, 
    text:"Select topics",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
  }; 

  this.subTopicsConfig = { 
    singleSelection: false, 
    text:"Select sub-topics",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
  }; 

  this.qusTypesConfig = { 
    singleSelection: false, 
    text:"Select question type",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
  }; 
  
  this.options= {
    locale: { format: 'DD-MM-YYYY' },
    alwaysShowCalendars: false,
  };
  let date= new Date();
  this.myDateRangePickerOptions['disableUntil']= {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()-1
  }
}

ngOnChanges() {
  let assessmentDetails=this.assessmentConfig;
  if(assessmentDetails) {
    this.nestedComp=true;
    this.formType=assessmentDetails['formType'];
    this.courseId= assessmentDetails['courseId'];
    //this.topicId= assessmentDetails['topicId'];
    //this.subTopicId=assessmentDetails['subtopicId'];
    if(assessmentDetails['visibility']) {
      this.visibility=assessmentDetails['visibility'];
    }
    if(assessmentDetails['assessmentId']) {
      this.assessmentId=assessmentDetails['assessmentId'];
      this.formType='edit';
      this.getAssessmentDetails();
    }
  }
}

// set default date
setDateRange(fromDate: any, toDate:any): void {
  fromDate = new Date(fromDate);
  toDate = new Date(toDate);
  this.form.patchValue({myDateRange: {
    beginDate: {
      year: fromDate.getFullYear(),
      month: fromDate.getMonth() + 1,
      day: fromDate.getDate()
    },
    endDate: {
      year: toDate.getFullYear(),
      month: toDate.getMonth() + 1,
      day: toDate.getDate()
    }
  }});
}

//clear date range
clearDateRange(): void {
  this.form.patchValue({myDateRange: ''});
}

/*
* fetch filters data
*/
getFiltersData(courseId:string) {
  this.getTopicsAndSubtopics(courseId);
  this.qusTypesList=this.qusTypes.map(typ=> { return { id: typ, itemName: typ}});
}
/*
* de
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
onTopicsChange(topic: any) {
  this.subTopicsList=[]
  this.selectedTopics.forEach(t=> {
    let subtopics= this.masterSubTopicsList.filter(s=> s.topic==t.id);
    if(subtopics) {
      this.subTopicsList= this.subTopicsList.concat(subtopics);
    }
  });
}

/*
* date filter on change event
*/
selectedDate(value: any, datepicker?: any) {
  this.daterange['start']=new Date(value.start).toISOString();
  this.daterange['end']=new Date(value.end).toISOString();
}

/*
* get topics and suptopics based on course id
*/
getTopicsAndSubtopics(courseId:string) {
  this.messageService.showLoader.emit(true);
  this.courseService.getFilterTopics(courseId).subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data'] && response['data'].topics) {
      let topics = response['data'].topics;

      this.topicsList=topics.map(t=> {
        let subtopics=t.subtopics.map(s=> {
          return { id: s._id, itemName: s.title, topic: t._id};
        });
        if(subtopics) {
          this.subTopicsList= this.subTopicsList.concat(subtopics);
        }
        return { id: t._id, itemName: t.title};
      });
      this.masterSubTopicsList= this.subTopicsList;
    }
  },error=> {
    this.handleError(error);
  })
}

/*
* on apply filter 
*/
applyFilter() {
  let filter={};
  if(this.hasError && this.form.get('level').value == this.levels[3]) { 
    window.scrollTo(0,300);
    this.toastr.error("Validate filter", 'Oops!');
    return;
  }
  filter['limit']=this.totalQuestion.value;
  if(this.courseId) {
    filter['courseId']=this.courseId;
  }
  if(this.selectedSubTopics.length) {
    filter['subTopicId']=this.transform(this.selectedSubTopics,'id');
  }else if(this.selectedTopics.length) {
    filter['topicId']=this.transform(this.selectedTopics,'id');
  }
  if(this.daterange) {
    if(this.daterange['start']){
      filter['startDate']=this.daterange['start'];
    }
    if(this.daterange['end']){
      filter['endDate']=this.daterange['end'];
    }
  }
  if(this.selectedQusTypes.length) {
    filter['qusType']=this.transform(this.selectedQusTypes,'id');
  }
  if(this.form.get('level').value !== this.levels[3]) {
    filter['level']= this.form.get('level').value;
  }
  if(this.queSelectionType === this.qusLists[1]) {
    filter['orderby_creationDate']=1;
  }else if(this.queSelectionType === this.qusLists[2]) {
    filter['orderby_creationDate']=-1;
  }
  if(this.form.get('level').value == this.levels[3]) {
    filter['counter_level']= [this.totalBasicLevelQus.value,this.totalItmLevelQus.value,this.totalAdvLevelQus.value];
  }
  this.getQuestions(filter);
}

/*
* change event for assessment level
* fetch question based on question level 
*/
getLevelBasedQuestion(){
  let filter={};
  if(this.form.get('level').value !== this.levels[3]) {
    filter['level']= this.form.get('level').value;
    filter['limit']=this.totalQuestion;
    this.getQuestions(filter);
  }
}

/*
* get questions 
*/
getQuestions(filter:any={}) {
  if(this.courseId) {
    filter['courseId']=this.courseId;
  }
  this.messageService.showLoader.emit(true);
  this.courseService.getQuestions(filter)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      let questions= response['data'];
      this.filterQuestionByLevel(questions);
    }
  },error=> {
    this.handleError(error);
  })
}

/*
* filter questions based on question level 
*/
filterQuestionByLevel(questions) {
  this.bscQuestions=this.filterData(questions,'level',this.qusLevels[0]).map(qus=> {
    qus['marks']=this.marksForBasic;
    return qus;
  });
  this.itmQuestions=this.filterData(questions,'level',this.qusLevels[1]).map(qus=> {
    qus['marks']=this.marksForItm;
    return qus;
  });
  this.advQuestions=this.filterData(questions,'level',this.qusLevels[2]).map(qus=> {
    qus['marks']=this.marksForExp;
    return qus;
  });
  this.bscQusDataArr=this.bscQuestions;
  this.itmQusDataArr=this.itmQuestions;
  this.advQusDataArr=this.advQuestions;
}

/*
* transform array based on given property
*/
transform(dataArr:any,prop:string):Array<any>{
  return dataArr.map(obj=> obj[prop]);
} 

/*
* filter array based on given property
*/
filterData(dataArr:any,prop:string,val:string):Array<any> {
  return dataArr.filter(obj=> obj[prop] === val);
} 

/*
* get question details
*/
getQuestionDetails(id:string,type:string) {
  switch(type) {
    case this.qusLevels[0]: {
      this.qusDetails=this.bscQuestions.find(e=> e._id === id);
      break;
    }
    case this.qusLevels[1]: {
      this.qusDetails=this.itmQuestions.find(e=> e._id === id);
      break;
    }
    case this.qusLevels[2]: {
      this.qusDetails=this.advQuestions.find(e=> e._id === id);
      break;
    }
    default: {
      this.qusDetails=this.qusDataArr.find(e=> e._id === id);
      break;
    }
  }
}

/*
* add and remove questions from question list based on id
*/
addAndRemove(arr:any,id:string):any {
  let i=arr.findIndex(e=> e._id === id);
  let obj=arr[i];
  arr.splice(i,1);
  return obj;
}

/*
* add question to question list
*/
addToList(id:any,i:any) {
  let question:any ={};
  if(i===0) {
    question=this.addAndRemove(this.bscQuestions,id)
  }else if(i===1) {
    question=this.addAndRemove(this.itmQuestions,id);
  }else {
    question=this.addAndRemove(this.advQuestions,id);
  }
  if(question) {
    if(this.qusDataArr.findIndex(q=> q._id==question._id)>=0) {
      return this.toastr.error("Question already added !", 'Oops!');
    }else {
      this.totalMarks += +question.marks;
      this.qusDataArr.unshift(question);
      this.questions=this.qusDataArr;
      this.totalItems=this.qusDataArr.length;
      this.paginationData();
    }
  }
    /*let lastPage=Math.ceil(this.getLastPage());
    this.pageChanged({
      itemsPerPage: this.itemsPerPage,
      page: lastPage
    });

    if(this.currentPage > 1) {
      this.addPagination= true;
    }*/
    /*$('.pagination-page')[lastPage-1].classList.remove('active');
    $('.pagination-page')[lastPage].classList.add('active'); */
  }

/*
* remove question from list
*/
removeFromList(id:any,level:string) {
  let qus=this.addAndRemove(this.qusDataArr,id);
  this.questions=this.qusDataArr;
  this.totalItems=this.qusDataArr.length;
  this.paginationData();
  if(qus && qus.level) {
    if(qus.level===this.qusLevels[0]) {
      this.bscQuestions.unshift(qus);
    } else if(qus.level===this.qusLevels[1]) {
      this.itmQuestions.unshift(qus);
    }else if(qus.level===this.qusLevels[2]) {
      this.advQuestions.unshift(qus);
    }
    this.totalMarks -= +qus.marks;
  }
}

/*
* get last page for pagination
*/
getLastPage():number {
  return (this.totalItems/this.itemsPerPage);
}

/*
* pagination event handler methods start here
* set current page on change event
* page change event 
* apply pagination on data
*/
setPage(pageNo: number): void {
  this.currentPage = pageNo;
}

pageChanged(event: any): void {
  this.currentPage = event.page;
  this.paginationData();
}

paginationData() {
  const indexOfLastItem = this.currentPage * this.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
  this.questions = this.qusDataArr.slice(indexOfFirstItem, indexOfLastItem);
}
/* pagination event handler methods ends here */

ngAfterViewInit(){
  $(".irs-min").remove();
  $(".irs-max").remove();
}

/*
* change event for percentage slider
*/
handleChange(event) {
  this.passPercentage = event.from;
}

/*
* on form submit event
*/
save() {
  /*if(this.hasError) { 
    window.scrollTo(0,600);
    this.toastr.error("Validate form", 'Oops!');
    return;
  }*/
  if(!this.isValid()) { return; }
  let assessmentDetails= this.getFormValue();
  this.messageService.showLoader.emit(true);
  this.assessmentService.saveAssessment(assessmentDetails)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['success']) {
      this.messageService.successMessage('Assessment', 'Added successfully',()=> {
        if(!this.nestedComp) {
          this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId],{queryParams:{'tab':'assessments'}});
        }else {
          this.showAssessments.emit();
        }
      });
    }
  },error=>{
    this.handleError(error);
  })
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
* sum marks of selcted question
*/
sumMarks() {
  let total=this.qusDataArr.reduce((prvQus,curQus)=>{
    return { marks:prvQus.marks+curQus.marks }
  });
  this.totalMarks= total.marks;
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
* verify custom validation
*/
/*verifyCustomValidation() {
  let isValid=true;
  if(this.totalBasicLevelQus['required']) {}
  return isValid;
}*/

/*
* validate number
*/
isNumber(val: string): boolean {
  let pattern = /^\d+$/;
  return pattern.test(val);  
}

/*
* validate forms 
* checking for custom validations
*/
isValid(): boolean {
  if(this.nestedComp) {
    if(!this.courseId) {
      this.messageService.showErrorToast(this._vcr,'Course is required');
      return false;
    }
  }
  let maxTime= this.form.get('maxTime').value;
  if( this.form.get('type').value == this.types[1]) {
    if(!maxTime) {
      window.scrollTo(0,0);
      this.toastr.error("Max time is required", 'Oops!');
      return false;
    }else if(maxTime) {
      let time=maxTime.split(':');
      if(time[0] && parseInt(time[0])<=0 && time[1] && parseInt(time[1])<=0 ) {
        window.scrollTo(0,0);
        this.toastr.error("Max time can't be 00:00 ", 'Oops!');
        return false;
      }
    }
  }
  if( this.form.get('type').value == this.types[2]) {
    let myDateRange=this.form.get('myDateRange').value;
    if(!myDateRange || !myDateRange['beginJsDate'] || !myDateRange['endJsDate']) {
      window.scrollTo(0,0);
      this.toastr.error("Date is required", 'Oops!');
      return false;
    }
  }
  if(!this.qusDataArr.length) {
    this.toastr.error("Your question list is empty", 'Oops!');
    return false;
  }
  if(this.totalQuestion.value !=this.qusDataArr.length) {
    this.toastr.error("Selected question not match to total question", 'Oops!');
    return false;
  }
  return true;
}

/*
* get form value
*/
getFormValue():any {
  this.qusDataArr=this.qusDataArr.map(q=> { 
    q['qusId']=q._id;
    return q;
  });
  let assessmentDetails = {
    courseId:this.courseId,
    assessment: this.form.get('assessment').value,
    type: this.form.get('type').value,
    level: this.form.get('level').value,
    passPercentage: this.passPercentage,
    tags: this.tags,
    maxTime: this.form.get('maxTime').value,
    insAtStart: this.insAtStart,
    insAtTheEnd: this.insAtTheEnd,
    showFeedbackAt: this.form.get('showFeedbackAt').value,
    showScoreAt: this.form.get('showScoreAt').value,
    shuffleAns: this.form.get('shuffleAns').value,
    maxAttempts: this.form.get('maxAttempts').value,
    questions: this.questions,
    totalQuestion: this.totalQuestion.value,
    status: this.form.get('status').value
  }

  if( this.form.get('type').value == this.types[2]) {
    let myDateRange=this.form.get('myDateRange').value;
    if(myDateRange && myDateRange['beginJsDate'] && myDateRange['endJsDate']) {
      assessmentDetails['beginDate']=myDateRange['beginJsDate'].toISOString();
      assessmentDetails['expireDate']=myDateRange['endJsDate'].toISOString();
    }
  }
  assessmentDetails['visibility']= this.visibility;
  assessmentDetails['topics']= this.questions.map(q=> q.topicId);
  assessmentDetails['subTopics']= this.questions.map(q=> q.subTopicId);
  return assessmentDetails;
}

  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
   // this.toastr.error(error.json().msg, 'Oops!');
   this.errorService.handleError(error, this._vcr);
 }

//get assessment details based on assessment id
getAssessmentDetails() {
  this.messageService.showLoader.emit(true);
  this.assessmentService.getAssessmentById(this.assessmentId)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      this.assessmentDetails = response['data'];
      if(this.nestedComp  && this.assessmentDetails['courseId']) {
        this.courseId=this.assessmentDetails['courseId'];
        this.applyFilter();
        this.setAssessmentInfo.emit(this.assessmentDetails);
      }
      this.intializeForm(this.fb,this.assessmentDetails);
      if(this.assessmentDetails['type']==this.types[2] 
        && this.assessmentDetails['beginDate'] && this.assessmentDetails['expireDate']) {
        this.setDateRange(this.assessmentDetails['beginDate'],this.assessmentDetails['expireDate']);
    }
  }
},error=>{
  this.handleError(error);
})
}
//convert seconds to hour:mintue format
secondsToHM(d: number) {
  let hours = Math.floor(d / 3600);
  let minutes = Math.floor(d % 3600 / 60);
  let hoursStr=(hours<10)?'0'+hours:hours;
  let minutesStr=(minutes<10)?'0'+minutes:minutes;
  return hoursStr+':'+minutesStr; 
}

//update assessment details
update() {
  if(!this.isValid()) { return; }
  let assessmentDetails= this.getFormValue();
  this.messageService.showLoader.emit(true);
  this.assessmentService.updateAssessment(this.assessmentId,assessmentDetails)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['success']) {
      this.messageService.successMessage('Assessment', 'Updated successfully',()=> {
        if(!this.nestedComp) {
          this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId],{queryParams:{'tab':'assessments'}});
        }else {
          this.showAssessments.emit();
        }
      });
    }
  },error=>{
    this.handleError(error);
  })
}

//on cancel button click
cancel() {
  if(!this.nestedComp) {
    this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId],{queryParams:{'tab':'assessments'}});
  }else {
    this.showAssessments.emit();
  }
}

//on component destroy
ngOnDestroy() {
  this.menuService.sidebar.emit({hide:false, contentPage:'playContent'});
}

}
