import { Component, OnInit, AfterViewInit,ViewChild, Inject,ViewContainerRef } from '@angular/core';
import {FormGroup,	FormBuilder,	Validators,	FormControl} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationConfig } from './../../../../shared/config/validation-config.constants';
import { ProjectService } from './../../../services/projects/project.service';
import { ErrorService } from './../../../services/common/error.service';
import { AuthenticationService } from './../../../../shared/services/common/authentication.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { SkillService } from './../../../services/skills/skill.service';
import {InstructorService} from './../../../services/instructors/instructors.service';
import { AppConfig } from './../../../config/app-config.constants';
import { MessageService } from './../../../services/common/message.service';
import { MessageConfig } from './../../../config/message-config.constants';
import {Config} from "./author-project.config";

@Component({
	selector: 'app-author-project',
	templateUrl: './author-project.component.html',
	styleUrls: ['./author-project.component.css'],
	providers: [ ProjectService, MessageService, SkillService, InstructorService]
})

export class AuthorProjectComponent implements OnInit, AfterViewInit {
  @ViewChild('setOnClose') setOnClose;
	public projectForm: FormGroup;
	public errMessage: any;
	public errorMessage: any;
	private fb: FormBuilder;
	public projectId: string = "";
	public urlPrefix: String;
	public isPaid =false;
	public activationMethod = false;
	public description: any;
	public prerequisites: any;
	public status : any = CommonConfig.STATUS.ACTIVE;
  public selectedSkills:any=[];
  // public technologies:any=[];
  public imgPath:string="";
  public levels = CommonConfig.LEVELS;
  public tenures = CommonConfig.TENURES;
  public skillsConfig : any;
//  offeredPrice:number;
  // public skillList : any=[];
	public tags : any=[];
	// public coordinators : any=[];
  public imgError: any;
  public imageChangedEvent: any;
  public croppedImage: any;
  public coursePicture: any;
  public projectCroppedIcon='';
  public imageStatus=false;
  public Config:any=Config
constructor(
  @Inject(FormBuilder) fb: FormBuilder,
  private router: Router,
  private route: ActivatedRoute,
  private projectService: ProjectService,
  private errorService: ErrorService,
  private messageService: MessageService,
  private skillService: SkillService,
  private instructorService : InstructorService,
  private authenticationService: AuthenticationService,
  private _vcr : ViewContainerRef,
  ) {
  this.fb = fb;
  this.getInstructors();
  this.getSkills();
  this.intializeForm();
}

// Get skills to be used for projects
getSkills() {
	/* commentted by sanjay 13/08/2018018
  this.messageService.showLoader.emit(true);
	this.skillService.listAll().subscribe((res) => {
		this.messageService.showLoader.emit(false);
  	this.skillList = res.data.map((skill, index)=>{
        let data = {
          "id":skill.title,
          "itemName":skill.title
        }
        return data;
      });
  }, (error) => {
		this.handleError(error);
  });
  */
}

// Get instructors to be used for projects
getInstructors() {
	/* Commentted by sanjay 13/07/2018
  this.messageService.showLoader.emit(true);
	this.instructorService.listAll().subscribe((res) => {
		this.messageService.showLoader.emit(false);
  	this.coordinators = res.data;
		console.log(this.coordinators);
  }, (error) => {
		this.handleError(error);
  });*/
}

//File crops functions
onFileChange(event) {
   if(event.target.files.length > 0) {
     let file = event.target.files[0];
     if(file.size>AppConfig.COURSE_IMAGE_SIZE[0])  {
       this.projectForm.get('icon').setValue('');
       return this.messageService.showErrorToast(this._vcr,MessageConfig.FILE_UPLOAD.FILE_SIZE_ERROR + AppConfig.COURSE_IMAGE_SIZE[1] +" kb");
     }else {
       this.projectForm.get('icon').setValue(file);
     }
   }
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
setImage(){
  if(!this.croppedImage){
    this.imgError='';
    this.coursePicture='';
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
    this.imgError=MessageConfig.FILE_UPLOAD.FILE_SIZE_ERROR + AppConfig.COURSE_IMAGE_SIZE[1] +'KB';
    return this.imgError;
  }
  this.projectCroppedIcon=this.croppedImage;
  this.imageStatus=true;
  this.setOnClose.nativeElement.click();
}

close(){
  this.imgError='';
  this.coursePicture='';
  this.imageChangedEvent='';
  this.croppedImage='';
}
//end

  //intialize form
  intializeForm(data: any={}): void {
  	let offeredPrice ="";
    let actualPrice ="";
    let isPaid ="";
    let discount:number =0;
    if(data.isPaid!=null && data.isPaid!= undefined) {
      isPaid=data.isPaid;
    }

    if(data.price) {
      if(data.price.offered) {
        offeredPrice =data.price.offered;
      }
      if(data.price.actual) {
        actualPrice =data.price.actual;
      }
      if(data.price.discount) {
        discount =data.price.discount;
      }
    }
    if(data.tags) {
      this.tags=data.tags || [];
    }

    this.projectForm = this.fb.group({
      code: [data.code || '', [Validators.required,Validators.minLength(this.Config.code.minlength[0]),
      Validators.maxLength(this.Config.code.maxlength[0])]],
      version: [data.version || '', [Validators.required]],
      title: [data.title || '', [Validators.required,Validators.minLength(this.Config.title.minlength[0]),
      Validators.maxLength(this.Config.title.maxlength[0])]],
      level: [data.level || '', [Validators.required]],
      tenure: [data.tenure || '', [Validators.required]],
      activationMethod : [data.activationMethod || '', [Validators.required]],
      currency : [data.currency || '', [Validators.required]],
      actualPrice : [ actualPrice || '', [Validators.required,Validators.pattern(ValidationConfig.NUMBER_PATTERN)]],
      discount: [discount, [Validators.required, Validators.pattern(ValidationConfig.NUMBER_PATTERN),Validators.max(100)]],
      offeredPrice : [offeredPrice || '', [Validators.required, Validators.pattern(ValidationConfig.NUMBER_PATTERN)]],
      isPaid : [isPaid, [Validators.required]],
      icon: [data.icon || ''],
    },{ validator: this.compareWithActualPrice });
    this.projectForm.get('discount').valueChanges.subscribe(()=> {
      this.calculateOfferPrice();
    },error=>{
      this.handleError(error);
    });
    this.projectForm.get('actualPrice').valueChanges.subscribe(()=>{
      this.calculateOfferPrice()
    },error=>{
      this.handleError(error);
    });
  }

  ngOnInit() {
  	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  	this.projectId = this.route.snapshot.params['id'];
  	this.configDropDown();
    if (this.projectId !== '' && this.projectId !== undefined) {
      this.getProject(this.projectId);
    }
  }

//price validation
compareWithActualPrice(group: FormGroup) {
  let offeredPrice= group.controls.offeredPrice,
  actualPrice = group.controls.actualPrice;
  if(parseInt(offeredPrice.value) > parseInt(actualPrice.value)) {
    return offeredPrice.setErrors({ maxOfferPrice: true })
  }else {
    return offeredPrice.setErrors(null);
  }
}

//calculate offer price
calculateOfferPrice():any {
  let discount= this.projectForm.get('discount').value || 0;
  let actualPrice= this.projectForm.get('actualPrice').value || 0;
  let discountAmount= (parseInt(actualPrice)*parseInt(discount))/100;;
  let offerPrice=actualPrice-discountAmount;
  this.projectForm.controls['offeredPrice'].setValue(offerPrice);
}

ngAfterViewInit() {

}

// Multiselect configuraton
configDropDown() {
     /*
    Removed skils from screen by sanjay 13/07/2018*/
  // this.skillsConfig = {
  //   singleSelection: false,
  //   text:"Select Technologies",
  //   selectAllText:'Select All',
  //   unSelectAllText:'UnSelect All',
  //   enableSearchFilter: true,
  // };
}

  // Save Project
  saveProject(data: any) {
    if(this.description==undefined || this.description==null || this.description==''){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.required)
    }
     else if(this.description.length<=this.Config.description.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
    } else if (this.description.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }

    if(this.prerequisites==undefined || this.prerequisites==null || this.prerequisites==''){
    return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.required)
    }
   else if(this.prerequisites.length<=this.Config.prerequisites.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.minlength[1]);
    } else if (this.prerequisites.length>=this.Config.prerequisites.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.maxlength[1]);
    }
    
    if(this.tags.length<1) {
      return this.messageService.showErrorToast(this._vcr,this.Config.tags.required);
    }
    if(!this.projectCroppedIcon || this.projectCroppedIcon==null){
      return this.messageService.showErrorToast(this._vcr,this.Config.icon.required);
    }



    this.messageService.showLoader.emit(true);
    let projectData={
      icon:this.projectCroppedIcon,
      code:data.get('code').value,
      version:data.get('version').value,
      title:data.get('title').value,
      level:data.get('level').value,
      tenure:data.get('tenure').value,
      description:this.description,
      prerequisites:this.prerequisites,
      activationMethod:data.get('activationMethod').value,
      currency:data.get('currency').value,
      actualPrice:data.get('actualPrice').value,
      offeredPrice:data.get('offeredPrice').value,
      discount:data.get('discount').value,
      isPaid:data.get('isPaid').value,
      tags:this.tags,
      status:this.status

    }
    this.projectService.addProject(projectData).subscribe((res: any) => {
      if(res['success']) {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Project', 'Successfully Saved');
        this.router.navigate(['/',this.urlPrefix, 'projects', ])
      }
    }, error => {
        this.handleError(error);
      let errMsg = error.json();
      this.errMessage = errMsg.msg;
    })
  }

  // Get project on basis of projectId
  getProject(projectId) {
  	this.projectService.getProjectData(projectId).subscribe(res => {
  	  	this.messageService.showLoader.emit(false);
        if(res.success==true){
  			this.prerequisites=res.data.prerequisites;
  			this.description=res.data.description;
        this.status=res.data.status;
        if(res.data && res.data.icon) {
          this.imgPath='projects/'+res.data.icon;
        }        
        this.intializeForm(res.data);
      }
      // });
  	},error=> {
  	  this.handleError(error);
  		let errMsg = error.json();
  		this.errMessage = errMsg.msg
  	});
  }


  // update Project
  updateProject(data: any) {
    if(this.description==undefined || this.description==null || this.description==''){
    return this.messageService.showErrorToast(this._vcr,this.Config.description.required)
    }
   else if(this.description.length<=this.Config.description.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
    } else if (this.description.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }

    if(this.prerequisites==undefined || this.prerequisites==null || this.prerequisites==''){
    return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.required)
    }
   else if(this.prerequisites.length<=this.Config.prerequisites.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.minlength[1]);
    } else if (this.prerequisites.length>=this.Config.prerequisites.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.maxlength[1]);
    }
    
    if(this.tags.length<1) {
      return this.messageService.showErrorToast(this._vcr,this.Config.tags.required);
    }
    if(!this.projectCroppedIcon || this.projectCroppedIcon==null){
      return this.messageService.showErrorToast(this._vcr,this.Config.icon.required);
    }

    this.messageService.showLoader.emit(true);
  let projectData={
      icon:this.projectCroppedIcon,
      code:data.get('code').value,
      version:data.get('version').value,
      title:data.get('title').value,
      level:data.get('level').value,
      tenure:data.get('tenure').value,
      description:this.description,
      prerequisites:this.prerequisites,
      activationMethod:data.get('activationMethod').value,
      currency:data.get('currency').value,
      actualPrice:data.get('actualPrice').value,
      offeredPrice:data.get('offeredPrice').value,
      discount:data.get('discount').value,
      isPaid:data.get('isPaid').value,
      tags:this.tags,
      status:this.status

    }
    this.projectService.updateProject(projectData, this.projectId).subscribe((res: any) => {
      if (res['success']) {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Project', 'Successfully updated');
        this.router.navigate(['/',this.urlPrefix, 'projects', ])
      }
    }, (error: any) => {
    this.handleError(error);
    });
  }

 // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
        this.messageService.showErrorToast(this._vcr,error.json().msg);
    this.errorService.handleError(error, this._vcr);
  }

}
