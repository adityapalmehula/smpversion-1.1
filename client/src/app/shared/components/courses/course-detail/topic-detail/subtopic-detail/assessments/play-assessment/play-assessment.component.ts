import { Component, OnInit,ViewContainerRef,ViewChild,OnDestroy,ElementRef } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { AssessmentService } from './../../../../../../../services/assessments/assessment.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';
import { AuthenticationService } from './../../../../../../../services/common/authentication.service';
import { CourseService } from './../../../../../../../services/courses/course.service';
import { MenuService } from './../../../../../../../services/common/menu.service';
import { CommonConfig } from './../../../../../../../config/common-config.constants';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import * as moment from 'moment';
import swal  from 'sweetalert2';

@Component({
  selector: 'app-play-assessment',
  templateUrl: './play-assessment.component.html',
  styleUrls: ['./play-assessment.component.css'],
  providers: [ AssessmentService, CourseService ]
})

export class PlayAssessmentComponent implements OnInit, OnDestroy {
  @ViewChild('close')close: ElementRef;
  @ViewChild('review')review: ElementRef;
  assessment: any = [];
  assessmentQuestions: any = [];
  questionNumber: any;
  selectedAnswers = [];
  questionIds: any = [];
  selectedAnswer: any = [];
  maxMarks: number;
  urlPrefix: string;
  courseId: string
  assessmentResultId: string;
  CONFIG:any=CommonConfig;
  questionsForReview:any=[];
  questionType:Array<string>=CommonConfig.ASSESSMENT.QUESTION_TYPE;
  questionStatus:Array<string>=CommonConfig.ASSESSMENT.TAKE_ASSESSMENT_QUESTION_STATUS;
  assessmentTypes:Array<string>=CommonConfig.ASSESSMENT.TYPES;
  assessmentDetails:any={};
  seconds:number;
  minutes:number;
  hours:number;
  timeTaken:string;
  count:number=0;
  counter:any;
  isFinished:boolean=false;
  qusIssueDescription:string;
  insAtStart:string;
  role:string="";
  assessmentId:string;
  isQusReview:boolean=false;
  currentReviewQusIndex: number= 0;
  isAssessmentFinished:boolean=false;
  isShowAssessmentResult:boolean=false;
  isResumeAssessment:boolean=false;
  assessmentResult:any={};
  reviewQusWarning:number=0;
  totalTimeTaken:number;
  isAssessmentStart:boolean=false;
  isAttamptLimitExceed:boolean= false;

  constructor(
    private assessmentService: AssessmentService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastsManager, 
    private _vcr: ViewContainerRef,
    private messageService: MessageService,
    private errorService: ErrorService,
    private menuService: MenuService,
    private courseService: CourseService,
    private authenticationService: AuthenticationService,
    ) {
    this.toastr.setRootViewContainerRef(_vcr);
  }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.menuService.sidebar.emit({hide:true, contentPage:'playContent'});
    this.role=this.authenticationService.userRole;
    if(this.role!==CommonConfig.USER_STUDENT) {
      this.courseId= this.route.snapshot.params['courseId'];
      if(!this.courseId) {
        this.router.navigate(['/', this.urlPrefix, 'courses']);
      }
    }else {
      this.courseId= this.route.snapshot.params['id'];
    }
    this.assessmentId= this.route.snapshot.params['assessmentId'];
    if(this.assessmentId) {
      this.getAssessment(this.assessmentId);
    }
  }

  //on next question
  getNextQuestion(qusCounter: any, isSave: boolean=false,isReview: boolean=false) {
    this.qusIssueDescription="";
    if(this.isQusReview ) {
      if(!isReview) {
        if(this.currentReviewQusIndex<0) this.currentReviewQusIndex=0;
        qusCounter= this.questionsForReview[this.currentReviewQusIndex]+1;
        ++this.currentReviewQusIndex;
      }else {
        if(this.questionsForReview.indexOf(qusCounter-1)!= -1) {
          this.currentReviewQusIndex=this.questionsForReview.indexOf(qusCounter-1)+1;
        }
      }
    }
    this.questionNumber=qusCounter;
    if(isSave) {
      this.saveAnswer(qusCounter-1);
    }
    this.assessment=this.assessmentQuestions[qusCounter-1];
    this.selectedAnswers=[];
    if(this.assessment.userAnswers.length) {
      this.selectedAnswers=this.assessment.userAnswers.map(ans=>ans.id);
    }
    if(this.isQusReview && !this.questionsForReview[this.currentReviewQusIndex] && !isReview) {
      this.questionNumber=this.assessmentQuestions.length;
    }
  }

  //previous question
  previousQuestion(qusNo: number) {
    if(qusNo>0) {
      if(this.isQusReview) {
        this.currentReviewQusIndex -= 2;
      }
      this.getNextQuestion(qusNo);
    }
  }

 //check for correct options
 isTrue(id:string):boolean {
   if(this.assessment.userAnswers.length>0) {
     let index= this.assessment.userAnswers.findIndex(ans=> ans.id == id);
     if(index>=0) {
       return true;
     }
     return false;
   }
 }

/*
* set time and status for question
*/
/*setTimeAndStatus(qusCounter) {
  if(qusCounter>1) {
    if(this.assessmentQuestions[qusCounter-2].userAnswers.length==0) {
      this.assessmentQuestions[qusCounter-2]['status']=this.questionStatus[2];
    }
    if(this.assessmentDetails['type'] === this.assessmentTypes[1]) {
      this.assessmentQuestions[qusCounter-2]['maxTime']=this.assessmentDetails['maxTime'];
      //updateAssessmentInfo['timeTaken']= this.calculateTotalTimeTaken();
      this.assessmentQuestions[qusCounter-2]['assessmentTimeTaken']= this.getCurrentTime();
    }
  } 
}*/

/*
* set ansewer for multiple choice type questions
*/
setMultipleChoiceAnswers(value:any, status:boolean) {
  if(this.selectedAnswers.indexOf(value) === -1 && status) {
    this.selectedAnswers.push(value);
  }else if(!status) {
    this.selectedAnswers.splice(this.selectedAnswers.indexOf(value), 1);
  }
}

/*
* set ansewer for single choice type questions
*/
setSingleChoiceAnswers(value:string) {
  this.selectedAnswers=[value];
}

/*
* on save answer - for each question
*/
saveAnswer(questionNumber:any) {
  if(this.assessmentQuestions[questionNumber-1]) {
    if(!this.selectedAnswers.length) {
      this.assessmentQuestions[questionNumber-1]['status']=this.questionStatus[2];
    }else {
      this.assessmentQuestions[questionNumber-1].status=this.questionStatus[1];
      this.assessmentQuestions[questionNumber-1].userAnswers=this.selectedAnswers.map(ans=>({id: ans}));
    }
    let assessmentDetails= {
      questions: this.assessmentQuestions,
      lastSaveQuestion: questionNumber-1,
      questionsForReview: this.questionsForReview
    }
    if(this.assessmentDetails['type'] === this.assessmentTypes[1]) {
      this.totalTimeTaken=this.assessmentDetails['maxTime']-this.getCurrentTime();
      assessmentDetails['timeTaken']=this.totalTimeTaken;
    }
    sessionStorage.setItem(this.assessmentResultId,JSON.stringify(assessmentDetails));
  }
}

  /*
  * get assessment details
  * persist assessment details for user
  */
  getAssessment(assessmentId) {
    this.isAttamptLimitExceed=false;
    this.messageService.showLoader.emit(true);
    this.assessmentService.getAssessmentInfo(assessmentId)
    .subscribe(response=> {
      this.messageService.showLoader.emit(false);
      if(response['data']) {
        if(response['data'].isAttamptLimitExceed) {
          this.isAttamptLimitExceed = true;
        }else {
          this.insAtStart=response['data'].insAtStart;
        }
      }
    },error=> {
      this.handleError(error);
    });
  }

  //start Assessment
  startAssessment() {
    this.isAssessmentStart=true;
    this.assessmentService.saveTakeAssessment({_id: this.assessmentId})
    .subscribe(res=> {
      this.messageService.showLoader.emit(false);
      if(res['data'] && res['data']._id) {
        let assessmentInfo=res['data'];
        this.initiateAssessment(assessmentInfo);
      }else {
        this.messageService.showLoader.emit(false);
        this.toastr.error('Something went wrong!', 'Oops!');
      }
    },error=>{this.handleError(error)});
  }
/*
* initilize assessment details
*/
initiateAssessment(assessmentInfo:any) {
  this.assessmentDetails['type']=assessmentInfo['type'];
  if(assessmentInfo['type'] && assessmentInfo['type'] == this.assessmentTypes[1] && assessmentInfo['maxTime']) {
    this.startTimer(assessmentInfo['maxTime']-assessmentInfo['timeTaken']);
    this.assessmentDetails['maxTime']=assessmentInfo['maxTime'];
  }
  this.assessmentResultId= assessmentInfo['_id'];
  this.timeTaken= assessmentInfo['timeTaken'];
  if(assessmentInfo['questionsForReview'].length) {
    this.questionsForReview=assessmentInfo['questionsForReview'];
  }
  if(assessmentInfo['totalMarks']) {
    this.maxMarks= assessmentInfo['totalMarks'];
  }
  this.assessmentQuestions= assessmentInfo['questions'];
  let qusIdx = assessmentInfo['lastSaveQuestion'] || 0;
  let assessmentHistory=JSON.parse(sessionStorage.getItem(this.assessmentResultId));
  if(assessmentHistory) {
    if(assessmentHistory.questions) {
      this.assessmentQuestions=assessmentHistory.questions;
    }
    if(assessmentHistory.lastSaveQuestion) {
      qusIdx= +assessmentHistory.lastSaveQuestion || 0;
    } 
    if(assessmentHistory.questionsForReview) {
      this.questionsForReview= assessmentHistory.questionsForReview || [];
    }
    if(assessmentHistory.timeTaken && assessmentInfo['type'] && assessmentInfo['type'] == this.assessmentTypes[1]) {
      this.timeTaken= assessmentHistory['timeTaken'];
      this.startTimer(assessmentInfo['maxTime']-assessmentHistory['timeTaken']);
    }
  }
  this.assessmentQuestions.forEach(obj=> {
    obj.options= this.shuffleOptions(obj.options);
  });
  if(qusIdx<assessmentInfo['questions'].length) {
    ++qusIdx
  }
  this.getNextQuestion(qusIdx);
}

 //view image in modal
 viewImage(imgUrl: string, imageAlt:string) {
   this.messageService.showImage(imgUrl,imageAlt);
 }

  //on exit assesment
  exit() {
    let text= 'Are you sure?';
    this.messageService.confirmation(text,"Confirm",()=> {
      this.navigate();
    },'Confirmation');
  }

/*
* on assessment submit
*/
submitAssessment(qusCounter:any) {
  this.saveAnswer(this.questionNumber);
  let text= 'Once you submit, you will no longer be able to change your answers for this attempt';
  if(this.questionsForReview.length > 0 && this.reviewQusWarning<1) {
    text= 'Before submitting assessment would you like to review questions ?';
    this.messageService.confirmation(text,"Confirm",()=> {
      this.currentReviewQusIndex=0;
      this.isQusReview=true;
      this.review.nativeElement.click();
      ++this.reviewQusWarning;
      this.getNextQuestion(this.questionsForReview[0]);
    },'You have marked questions for review!',()=> {
      this.finishAndSubmit();
    });
  }else {
    this.messageService.confirmation(text,"Confirm",()=> {
      this.finishAndSubmit();
    },'Confirmation');
  }
}

/*
* finish and submit assessment result
*/
finishAndSubmit() {
  this.isFinished=true;
  let assessmentResult={ questions:this.assessmentQuestions };
  if(this.assessmentDetails['type'] == this.assessmentTypes[1]) {
    assessmentResult['totalTimeTaken'] = this.totalTimeTaken;
  }
  this.assessmentService.finishAssessment(this.assessmentResultId,assessmentResult)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['success']) {
      this.messageService.successMessage("Assessment","Submit successfully ",()=> {
        sessionStorage.removeItem(this.assessmentResultId);
        if(response['data']) {
          this.assessmentResult=response['data'];
          this.isAssessmentFinished=true;
        }
      });
    }
  },error=> {
    this.handleError(error);
  });
}

updateUserAnswers() {
  this.isFinished=true;
  let assessmentResult={
    questions: this.assessmentQuestions,
    questionsForReview: this.questionsForReview,
  }
  if(this.assessmentDetails['type'] == this.assessmentTypes[1]) {
    assessmentResult['totalTimeTaken'] = this.totalTimeTaken;
  }
  this.messageService.showLoader.emit(true);
  this.assessmentService.updateUserAnswers(this.assessmentResultId,assessmentResult)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['success']) {
      sessionStorage.removeItem(this.assessmentResultId);
    }
  },error=> {
    this.handleError(error);
  });
}

/*
* shuffle options
*/
shuffleOptions(options: any) {
  let remain=options.length,temp,rIdx;
  while(remain>1) {
    let rIdx=Math.floor(Math.random()*remain--);
    if(rIdx!=remain) {
      temp=options[remain];
      options[remain]=options[rIdx];
      options[rIdx]=temp;
    }
  }
  return options;
}

/*
* save or update answer for question on save
*/
saveOrUpdateAnswer(qusDetails:any) {
  this.messageService.showLoader.emit(true);
  this.assessmentService.saveOrUpdateUserAnswer(this.assessmentResultId,qusDetails)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
  },error=> {
    this.handleError(error);
  })
}

/*
* on finish assessment 
*/
finishAssessment() {
  let text= 'Once you finish, you will no longer be able to change your answers for this attempt';
  this.messageService.confirmation(text,"Confirm",()=> {
    this.finishAndSubmit();
  });
}

/*
* navigatation to assessment list
*/
navigate() {
  let from, queryParams = this.router.parseUrl(this.router.url).queryParams;
  if(queryParams) {
    from  = queryParams.from;
  }
  if(this.authenticationService.userRole === CommonConfig.USER_STUDENT) {
    this.router.navigate(['/', this.urlPrefix, 'course-details',this.courseId,'assessments']);
  }else {
    if(from == 'play-content') {
      this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId, 'play-contents']);

    }else {
      this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId],{queryParams: { tab:"assessments"}});
    }
  } 
}
/*
* on mark for Review 
*/
markForReview() {
  if(!this.questionsForReview.includes(this.questionNumber-1)) {
    this.questionsForReview.push(this.questionNumber-1);
    this.toastr.success('Question mark for review','success');
  }
}

/*
* start time counter for specific time period
*/
startTimer(maxTime:number) {
  this.count=maxTime;
  this.convertTime();
  this.counter=setInterval(this.convertTime(),1000);
}

/*
* convert time in hours, mintue, seconds
*/
convertTime() {
  return ()=> {
    --this.count;
    if(this.count == -1) {
      clearInterval(this.counter);
      this.onTimeOver();
      return;
    }
    this.seconds = this.count % 60;
    this.minutes = Math.floor(this.count / 60);
    this.hours = Math.floor(this.minutes / 60);
    this.minutes %= 60;
    this.hours %= 60;
  }
}

/*
* called on time over
*/
onTimeOver() {
  swal({
    timer: 1540,
    type: 'error',
    title: 'Timeout',
    text: 'You are out of time',
    showConfirmButton: false,
  }).then(()=>{},
  (dismiss)=>{
    if (dismiss === 'timer') {
      this.finishAndSubmit();
    }
  });
}

/*
* on report issue submission
*/
saveReportIssue() {
  if(this.assessment && this.assessment.qusId) {
    this.courseService.submitIssue(this.assessment.qusId, { description: this.qusIssueDescription })
    .subscribe(response=> {
      this.qusIssueDescription="";
      this.close.nativeElement.click();
      this.messageService.successMessage("Question","Issue submitted successfully");
    },error=> {
      this.handleError(error);
    })
    
  }
}

/*
* get total seconds
*/
getSeconds(maxTime:string):number {
  let timeArr=maxTime.split(':');
  let sec= parseInt(timeArr[2]) || 0;
  return parseInt(timeArr[0])*60*60+parseInt(timeArr[1])*60+sec;
}

/*
* calculate total time to solve question
*/
calculateTotalTimeTaken():number {
  let maxTime=this.assessmentDetails['maxTime'];
  let currentTime=this.getCurrentTime();
  return maxTime-currentTime;
}

  /*let seconds,minutes,hours, totalTimeTaken= this.getSeconds(maxTime)-currentTime;
  seconds = totalTimeTaken % 60;
  minutes = Math.floor(totalTimeTaken / 60);
  hours = Math.floor(this.minutes / 60);
  minutes %= 60;
  hours %= 60;
  let hoursStr=(hours<10)?'0'+hours:hours;
  let minutesStr=(minutes<10)?'0'+minutes:minutes;
  let secondsStr=(seconds<10)?'0'+seconds:seconds;
  return hoursStr+':'+minutesStr+':'+secondsStr;*/

//get current time in seconds
getCurrentTime():number {
  return this.hours*60*60+this.minutes*60+this.seconds;
}

/*
* update time and status for question
* update overall time taken
*/
/*updateTimeAndStatus(questionInfo:any,callback:()=>void=null) {
  this.messageService.showLoader.emit(true);
  this.assessmentService.updateTimeAndStatus(this.assessmentResultId,questionInfo)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['success']) {
      if(callback) {
        callback();
      }
    }
  },error=> {
    this.handleError(error);
  })
}*/

/*
* on component destroy
*/
ngOnDestroy() {
  if(this.counter) {
    clearInterval(this.counter);
  }
  if(!this.isFinished && this.assessmentResultId) {
    this.updateUserAnswers();
  }
 /* if(!this.isFinished && this.questionsForReview.length>0) {
    this.assessmentService.updateMarkReview(this.assessmentResultId,{
      questionsForReview:this.questionsForReview
    }).subscribe(res=>{},error=> {
      this.handleError(error);
    })
  }*/
  this.close.nativeElement.click();
  this.menuService.sidebar.emit({hide:false, contentPage:'playContent'});
}


  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.toastr.error('Something went wrong!', 'Oops!');
    this.errorService.handleError(error, this._vcr);
  }

  displayAssessmentResult() {
    this.isShowAssessmentResult=true;
  }

//get student assessment status 
getStudentAssessmentStatus(assessmentId:string) {
  this.isResumeAssessment=false;
  this.messageService.showLoader.emit(true);
  this.assessmentService.getStudentAssessmentStatus(assessmentId)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data'] && response['data']['isIncomplete'] ) {
      this.isResumeAssessment=response['data']['isIncomplete'];
      if(this.isResumeAssessment) {
        //this.startAssessment();
      } 
    }
  },err=> this.handleError(err));
}
}