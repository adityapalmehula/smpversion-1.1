import { Component, OnInit,Input,Output,EventEmitter,OnChanges,ViewContainerRef,ViewChild,ElementRef } from '@angular/core';
import { MessageService } from './../../../../../../../../services/common/message.service';
import { CommonConfig } from './../../../../../../../../config/common-config.constants';
import { MessageConfig } from './../../../../../../../../config/message-config.constants';
import { AppConfig } from './../../../../../../../../config/app-config.constants';
import * as $ from 'jquery';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.css']
})

export class QuestionFormComponent implements OnInit {
  @Input() qusType;
  @Input() qusDetails;
  @Output() addNewQuestion = new EventEmitter<Object>();
  @ViewChild('setOnClose') setOnClose;
  @ViewChild('closeModal') closeModal: ElementRef;

  public basePath = new CommonConfig().BASE_URL+CommonConfig.FOLDERS[6];
  public imgError: any;
  public imageChangedEvent: any;
  public croppedImage: any;
  public imageStatus=false;
  public picture: any;
  public qusCroppedIcon='';
  public solutionPicture: any;
  public solCroppedIcon='';
  config:any={};
  optionsConfig:any={};
  QUESTION_TYPE:any= CommonConfig.QUESTION_TYPE;
  formType:string = 'add';
  options:any=[];
  newQuestion:string="";
  newSolution:string="";
  hint:any={text:'',icon: ''};
  questionType:string="";
  correctAnswers:any=[];
  qusPicture: any;
  solPicture: any;
  imageFor:any;
  imgPath:any='';
  isQuestionIconChange: boolean=false;
  isSolutionIconChange: boolean=false;
  isHintIconChange: boolean=false;

  constructor(
    private vcr: ViewContainerRef,
    private messageService: MessageService,
    ) {
  }

  ngOnInit() {
    this.loadCkEditorConfig();
    this.options=[];
    for(let i=0;i<4;++i) this.options.push({value: "", img: "", opPicture: ""})
  }

  //load ckeditor config
  loadCkEditorConfig() {
    this.config.height='100px';
    this.config.toolbar = [
    { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source'] },
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
    { name: 'insert', items: [ 'Image', 'Table', 'HorizontalRule', 'SpecialChar', 'Iframe' ] },
    { name: 'editing', groups: ['spellchecker' ], items: [ '-', 'Scayt' ] },
    { name: 'forms', items: [ 'Checkbox', 'Radio' ] },
    { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
    { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
    { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
    { name: 'links', items: [ 'Link', 'Unlink','Preview'] },
    { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
    { name: 'others', items: [ '-' ] },
    ];

    this.optionsConfig.height='100px';
    this.optionsConfig.toolbar = [
    { name: 'document', groups: [ 'mode', 'document', 'doctools'] },
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting'] },
    { name: 'insert', items: [ 'Image', 'Table', 'SpecialChar'] },
    { name: 'editing', groups: ['spellchecker' ], items: [ '-', 'Scayt' ] },
    { name: 'colors', items: [ 'TextColor', 'BGColor','Maximize','Preview'] },
    ];
  }

  //life-cycle hook for changes
  ngOnChanges() {
    this.questionType = this.qusType;
    if(this.qusDetails && Object.keys(this.qusDetails).length) {
      this.formType='update';
      this.displayData();
    }else {
      this.formType='add';
      this.initializeForm();
    }
  }

   //view image in modal
   viewImage(imgUrl: string) {
     this.messageService.showImage(imgUrl,imgUrl);
   }

  //display data
  displayData() {
    this.newQuestion = this.qusDetails.question;
    this.newSolution = this.qusDetails.solution;
    if(this.qusDetails['hint'] && (this.qusDetails['hint']['text'] || this.qusDetails['hint']['icon'])) {
      this.hint = this.qusDetails.hint;
    }
    this.options= this.qusDetails.options.map(op=>{
      let option={value: op.text};
      if(op['icon']) {
        option['img']=this.basePath+op['icon'];
        option['icon']=op['icon'];
      }
      return option;
    });
    this.qusDetails.answers.forEach(ans=> {
      this.correctAnswers.push(+ans['id'])
    })
    if(this.qusDetails['qusIcon']) {
      this.qusCroppedIcon=this.basePath+this.qusDetails['qusIcon'];
    }
    if(this.qusDetails['solutionIcon']) {
      this.solCroppedIcon=this.basePath+this.qusDetails['solutionIcon'];
    }
  }

  //initilize form  
  initializeForm() {
    this.newQuestion="";
    this.newSolution="";
    this.hint['text']="";
    this.hint['icon']="";
    this.correctAnswers=[];
    this.options=[];
    this.qusCroppedIcon='';
    this.solCroppedIcon='';
    for(let i=0;i<4;++i) this.options.push({value: "", img: "", opPicture: ""});
  }

  //remove options on click
  removeOptions() {
    if(this.options.length>2){
      this.options.pop();
    }else {
      this.messageService.showErrorToast(this.vcr,'Minimum 2 options required', 'Oops!');
    }
  }

  //add new options in form on click
  addNewOptions() {
    this.options.push({value:'', img: '', opPicture:''});
  }

  //check for correct options
  isTrue(i:string):boolean {
    if(this.correctAnswers.length>0) {
      let index= this.correctAnswers.find(val=> val == i);
      if(index>=0) {
        return true;
      }
      return false;
    }
  }

  //add new question
  addQuestion() {
    let options=[];
    let answers=[];
    //if(!this.newQuestion) return this.messageService.showErrorToast(this.vcr,'Question is required', 'Oops!');
    if(this.qusType != this.QUESTION_TYPE[2]) {
      for(let i in this.options) {
        if(this.options[i].value || this.options[i].img) {
          let option={id: i};
          if(this.options[i].value) {
            option['text']=this.options[i].value;
          }
          if(this.options[i].img && this.options[i].isOpIconChange) {
            option['icon']=this.options[i].img;
          }
          if(this.formType=='update' && !this.options[i].isOpIconChange) {
            if(this.qusDetails['options'][i] && this.qusDetails['options'][i]['icon']) {
              option['icon']= this.qusDetails['options'][i]['icon'];
            }
          }
          option['isOpIconChange']=this.options[i].isOpIconChange || false;
          options.push(option);
        }else {
        //  this.messageService.showErrorToast(this.vcr,`Option can't be blank`, 'Oops!');
        // break;
      }
    }
  }else {
    options.push({text: 'True',id: 0});
    options.push({text: 'False',id: 1});
  }
  $.each($("input[name='answer']:checked"), function() { 
    answers.push({id: +$(this).val()});
  });

   // if(answers.length==0) return this.messageService.showErrorToast(this.vcr,'Please select the correct options', 'Oops!');

   let qusInfo = {
     question: this.newQuestion,
     options: options,
     answers: answers,
     solution: this.newSolution,
     isQuestionIconChange: this.isQuestionIconChange,
     isSolutionIconChange: this.isSolutionIconChange,
     isHintIconChange: this.isHintIconChange,
   }
   if(this.formType=='update') {
     if(this.qusCroppedIcon && this.isQuestionIconChange) {
       qusInfo['qusIcon'] = this.qusCroppedIcon;
     }else {
       qusInfo['qusIcon']= this.qusDetails['qusIcon'];
     }
     if(this.solCroppedIcon && this.isSolutionIconChange) {
       qusInfo['solutionIcon'] = this.solCroppedIcon;
     }else {
       qusInfo['solutionIcon']= this.qusDetails['qusIcon'];
     }
     if(this.hint['text'] || this.hint['icon']) {
       qusInfo['hint'] = this.hint;
       if(!this.isHintIconChange) {
         qusInfo['hint']['icon']= this.qusDetails['hint']['icon'];
       }
     }
   }else {
     if(this.qusCroppedIcon) {
       qusInfo['qusIcon'] = this.qusCroppedIcon;
     }
     if(this.solCroppedIcon) {
       qusInfo['solutionIcon'] = this.solCroppedIcon;
     }
     if(this.hint['text'] || this.hint['icon']) {
       qusInfo['hint'] = this.hint;
     }
   }
   qusInfo['status']= this.qusDetails['status'];
   this.addNewQuestion.emit({type: this.formType, data: qusInfo});
 }

// method to be called when file upload button is clicked
fileChangeEvent(event: any): void {
  this.imgError='';
  this.croppedImage=''; 
  this.imageChangedEvent = event;
}

/* method to be called when image cropped*/
imageCropped(image: string) {
  this.croppedImage = image;
}

/* method to be called when image failed*/
loadImageFailed(){
  this.imgError=MessageConfig.FILE_UPLOAD.FILE_TYPE_ERROR;
}

//set image details
setImage(){
  if(!this.croppedImage){
    this.imgError='';
    this.picture='';
    this.imageChangedEvent='';
    return this.imgError=MessageConfig.FILE_UPLOAD.SELECT_FILE;
  }
  let y=1;
  let last2=this.croppedImage.slice(-2);
  if(last2=='==') {
    y=2;
  }
  let size=(this.croppedImage.length*(3/4))-y;
  if(size>AppConfig.COURSE_IMAGE_SIZE[0]) {
    this.imgError=MessageConfig.FILE_UPLOAD.FILE_SIZE_ERROR + AppConfig.QUESTION_IMAGE_SIZE[1] +'KB';
    return this.imgError;
  }
  if(this.imageFor == 'question') {
    this.qusCroppedIcon=this.croppedImage;
    this.isQuestionIconChange=true;
    this.qusPicture=this.picture;
    this.intializeImageCropConfig();
  }
  if(this.imageFor == 'solution') {
    this.solCroppedIcon=this.croppedImage;
    this.isSolutionIconChange=true;
    this.solPicture=this.picture;
    this.intializeImageCropConfig();
  } 
  if(this.imageFor == 'hint') {
    this.hint['icon']=this.croppedImage;
    this.isHintIconChange=true;
   //this.hint['picture']=this.picture;
   this.intializeImageCropConfig();
 }
 if(typeof this.imageFor == "number") {
   this.options[+this.imageFor].img=this.croppedImage;
   this.options[+this.imageFor].opPicture=this.picture;
   this.options[+this.imageFor].isOpIconChange=true;
   this.intializeImageCropConfig();
 }
 this.imageStatus=true;
 this.setOnClose.nativeElement.click();
}

//initialize image config
intializeImageCropConfig(){this.hint['picture']
this.imgError='';
this.picture='';
this.imageChangedEvent='';
this.croppedImage='';
}

//upload image
uploadImage(imageFor:any) {
  this.imageFor=imageFor;
  if(this.imageFor == 'question' && this.qusCroppedIcon) {
    this.croppedImage=this.qusCroppedIcon;
    this.picture=this.qusPicture;
  }
  if(this.imageFor == 'solution' && this.solCroppedIcon) {
    this.croppedImage=this.solCroppedIcon;
    this.picture=this.solPicture;
  } 
  if(this.imageFor == 'hint' && this.hint && this.hint['icon']) {
    this.croppedImage=this.hint['icon'];
   //this.picture=this.hint['picture'];
 }
 if(typeof this.imageFor == "number" && this.options[+this.imageFor].img) {
   this.croppedImage=this.options[+this.imageFor].img;
   this.picture=this.options[+this.imageFor].opPicture;
 }
}
}
