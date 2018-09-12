import { Component, OnInit, Inject, ViewChild,ElementRef,ViewContainerRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { ValidationConfig } from './../../../../../../../../config/validation-config.constants';
import { CourseService } from './../../../../../../../../services/courses/course.service';
import { MessageService } from './../../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../../services/common/error.service';
import { CommonConfig } from './../../../../../../../../config/common-config.constants';
import { AuthenticationService } from './../../../../../../../../services/common/authentication.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-true-false-question',
  templateUrl: './true-false-question.component.html',
  styleUrls: ['./true-false-question.component.css'],
  providers: [ CourseService ]
})
export class TrueFalseQuestionComponent implements OnInit {
  @ViewChild('imgUpload') imgUpload: ElementRef;
  @ViewChild('imgInput') imgInput: ElementRef;
  fb: FormBuilder;
  questionForm: FormGroup;
  urlPrefix : String;
  errorMessage: string="";
  formType:string="add";
  levels: any= CommonConfig.QUESTION_DIFFICULTY_LEVELS;
  subTopicId:string;
  status: any =CommonConfig.STATUS;
  questionId:string;
  correctAnswers=[];
  courseId: string;
  topicId: string;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private authenticationService: AuthenticationService,
    private toastr: ToastsManager, 
    private _vcr: ViewContainerRef,
    ){
    this.fb= fb;
    this.toastr.setRootViewContainerRef(_vcr);
    this.intializeForm(fb);
  }

  ngOnInit() {
    this.courseId= this.route.snapshot.params['courseId'];
    this.topicId= this.route.snapshot.params['topicId'];
    this.subTopicId= this.route.snapshot.params['subtopicId'];
    if(this.subTopicId) {
      this.subTopicId=this.subTopicId.split('?')[0];
    }
    this.questionId= this.route.snapshot.params['qusId'];
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    if(this.questionId) {
      this.questionId=this.questionId.split('?')[0];
      this.getQuestion(this.questionId);
      this.formType="edit";
    }
  }

   //intialize form 
   intializeForm(fb:FormBuilder,data:any={}):void {
     this.questionForm=fb.group({
       level: ['',[Validators.required]],
       question: ['',[Validators.required]],
       options: this.fb.array([
         new FormControl('True',Validators.required),
         new FormControl('False',Validators.required),
         ]),
       answer: [''],
       solution: [''],
       status: [ CommonConfig.STATUS.ACTIVE ] 
     });
   }

/*
open image based popup
*/
openImgPopup(optNo:number) {
  this.imgUpload.nativeElement.click();
}

// on modal close
closeModal() {}
uploadFile() {}
/*
* on form submit
*/
addQuestion() {
  let question= this.getFormValues();
  if(!question['subTopicId']){return}
    this.courseService.saveQuestion(question).subscribe(response=> {
      if(response['success']) {
        this.messageService.successMessage('Question', 'Added successfully',()=> {
          this.router.navigate(['/', this.urlPrefix, 'courses', this.courseId , 'topics', this.topicId,'subtopics',this.subTopicId],{queryParams:{'tab':'questions'}});
        });
      }
    },error=> {
      this.errorMessage = error.json().msg;
      this.handleError(error);
    })
}
/*
* get form value
*/
getFormValues() {
  let answers=[],options=this.questionForm.get('options').value
  $.each($("input[name='answer']:checked"), function() { 
    answers.push(options[+$(this).val()]);
  });
  if(answers.length===0) {
    return this.toastr.error('Please check the correct answers!', 'Oops!');
  }
  return {
    subTopicId: this.subTopicId,
    options: options,
    qusType: CommonConfig.QUESTION_TYPE[2],
    level: this.questionForm.get('level').value,
    question: this.questionForm.get('question').value,
    answers: answers,
    solution: this.questionForm.get('solution').value,
    status: this.questionForm.get('status').value
  }
}
/*
* get question based on question id
*/
getQuestion(id:string){
  this.messageService.showLoader.emit(true);
  this.courseService.getQuestionById(id)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data']) {
      this.subTopicId=response['data'].subTopicId;
      this.displayData(response['data']);
    }
  },error=> {
    this.messageService.showLoader.emit(false);
    this.errorMessage = error.json().msg;
    this.handleError(error);
  })
}
/*
* populate form data
*/
displayData(data:any) {
  let optionControls=[];
  data['options'].forEach(opt=> {
    optionControls.push(new FormControl(opt,Validators.required));
  });
  data['answers'].forEach(ans=> {
    let index=data['options'].findIndex(opt=> opt===ans);
    if(index>=0){
      this.correctAnswers.push(index)
    }
  })
  this.questionForm=this.fb.group({
    level: [data.level || '',[Validators.required]],
    question: [data.question || '',[Validators.required]],
    options: this.fb.array(optionControls),
    answer: [''],
    solution: [data.solution || ''],
    status: [data.status || CommonConfig.STATUS.ACTIVE ] 
  });
/*
  $.each(this.correctAnswers, (i, val)=> {
    $("input[value='"+val+"']").prop('checked', true);
  });*/
}
/*
* on checkbox value checked
*/
isTrue(i:string):boolean {
  if(this.correctAnswers.length>0) {
    let index= this.correctAnswers.find(val=> val == i);
    if(index>=0) {
      return true;
    }
    return false;
  }
}
/*
* submit update form value
*/
update() {
  let question= this.getFormValues();
  this.courseService.updateQuestion(this.questionId,question).subscribe(response=> {
    if(response['success']) {
      this.messageService.successMessage('Question', 'Updated successfully',()=> {
        this.router.navigate(['/', this.urlPrefix, 'courses', this.courseId , 'topics', this.topicId,'subtopics',this.subTopicId],{queryParams:{'tab':'questions'}});
      });
    }
  },error=> {
    this.errorMessage = error.json().msg;
    this.handleError(error);
  })
}

 // Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }
}

