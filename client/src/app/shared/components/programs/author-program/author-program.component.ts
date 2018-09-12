import { Component, OnInit,Inject ,Input, ViewChild, ViewContainerRef } from '@angular/core';
import {FormGroup,	FormBuilder,	Validators,	FormControl} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DropEvent } from 'ng-drag-drop';
import { ValidationConfig } from './../../../../shared/config/validation-config.constants';
import { CommonConfig } from './../../../config/common-config.constants';
import { ProjectService } from './../../../services/projects/project.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CourseService } from './../../../services/courses/course.service';
import { ProgramService } from './../../../services/programs/program.service';
import {Config} from "./author-program.config";
import { AppConfig } from './../../../config/app-config.constants';
import { MessageConfig } from './../../../config/message-config.constants';
import { AuthenticationService } from './../../../../shared/services/common/authentication.service';

@Component({
	selector: 'app-author-program',
	templateUrl: './author-program.component.html',
	styleUrls: ['./author-program.component.css'],
	providers : [ ProgramService, MessageService, ProjectService,CourseService ]
})
export class AuthorProgramComponent implements OnInit {
	@ViewChild('setOnClose') setOnClose;
	public durations = CommonConfig.DURATIONS;
	public programForm: FormGroup;
	private fb: FormBuilder;
	public efforts = CommonConfig.EFFORTS;
	public projects : any ;
	public programId: string = "";
	public urlPrefix: String;
	public description: any;
	public programNeed: any;
	public imgPath:string="";
	public status : any = CommonConfig.STATUS.ACTIVE;
	public tags : any=[];
	public projectContent: any = [];
	public courseContent: any;
	public errorMessage : any;
	public backendErrorMsg : any = [];
	public learningData : any = [];
	public coursesData :  any = [];
	public projectList : any;
	public courseList : any;
	public selectedProjects : any = [];
	public selectedCourses : any = [];
	public projectsConfig : any;
	public coursesConfig : any;
	public courses : any ;
	public errMessage: any;
	public Config:any=Config;
	public alreadadd: boolean;
	public imgError: any;
  public imageChangedEvent: any;
  public croppedImage: any;
  public coursePicture: any;
  public projectCroppedIcon='';
  public imageStatus=false;
  

	constructor(
		@Inject(FormBuilder) fb: FormBuilder,
		private router: Router,
    private route: ActivatedRoute,
		private projectService: ProjectService,
		private programService: ProgramService,
		private courseService : CourseService,
		private messageService : MessageService,
		private errorService : ErrorService,
		private authenticationService: AuthenticationService,
		private _vcr : ViewContainerRef,
		) { 
		this.fb = fb;
    this.intializeForm();
	}

	ngOnInit() {
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  	this.programId = this.route.snapshot.params['id'];
  	if (this.programId !== '' && this.programId !== undefined) {
      this.getProgram(this.programId);
    }
		this.getAllProjects();		
		this.fetchCourses();
	}

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

    this.programForm = this.fb.group({
      code: [data.code || '', [Validators.required,Validators.minLength(this.Config.code.minlength[0]),
      Validators.maxLength(this.Config.code.maxlength[0])]],
      version: [data.version || '', [Validators.required]],
      title: [data.title || '', [Validators.required,Validators.minLength(this.Config.title.minlength[0]),
      Validators.maxLength(this.Config.title.maxlength[0])]],
      activationMethod : [data.activationMethod || '', [Validators.required]],
      currency : [data.currency || '', [Validators.required]],
      duration: [data.duration || '', [Validators.required]],
      effort: [data.effort || '', [Validators.required]],
      actualPrice : [ actualPrice || '', [Validators.required,Validators.pattern(ValidationConfig.NUMBER_PATTERN)]],
      discount: [discount, [Validators.required, Validators.pattern(ValidationConfig.NUMBER_PATTERN),Validators.max(100)]],
      offeredPrice : [offeredPrice || '', [Validators.required, Validators.pattern(ValidationConfig.NUMBER_PATTERN)]],
      isPaid : [isPaid, [Validators.required]],
      //icon: [data.icon || ''],
    },{ validator: this.compareWithActualPrice });
    this.programForm.get('discount').valueChanges.subscribe(()=> {
      this.calculateOfferPrice();
    },error=>{
      this.handleError(error);
    });
    this.programForm.get('actualPrice').valueChanges.subscribe(()=>{
      this.calculateOfferPrice()
    },error=>{
      this.handleError(error);
    });
  }


 // Get project on basis of projectId
  getProgram(programId) {
  	this.programService.getProgramData(programId).subscribe(res => {
  	  	this.messageService.showLoader.emit(false);

       if(res.success==true){
       	this.coursesData=res.data.courseData;
       	this.learningData=res.data.projectData;
  			this.programNeed=res.data.programNeed;
  			this.description=res.data.description;
        this.status=res.data.status;
        // if(res.data && res.data.icon) {
        //   this.imgPath='programs/'+res.data.icon;
        // }        
        this.intializeForm(res.data);
      }
  	},error=> {
  	  this.handleError(error);
  		let errMsg = error.json();
  		this.errMessage = errMsg.msg
  	});
  }


  // Save Program data.
  saveProgram(data: any) {
    if(this.description==undefined || this.description==null || this.description==''){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.required)
    }
     else if(this.description.length<=this.Config.description.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
    } else if (this.description.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }

    if(this.programNeed==undefined || this.programNeed==null || this.programNeed==''){
    return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.required)
    }
   else if(this.programNeed.length<=this.Config.prerequisites.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.minlength[1]);
    } else if (this.programNeed.length>=this.Config.prerequisites.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.maxlength[1]);
    }
    
    if(this.tags.length<1) {
      return this.messageService.showErrorToast(this._vcr,this.Config.tags.required);
    }
    // if(!this.projectCroppedIcon || this.projectCroppedIcon==null){
    //   return this.messageService.showErrorToast(this._vcr,this.Config.icon.required);
    // }
    
   this.messageService.showLoader.emit(true);
    let programData={
    	//icon:this.projectCroppedIcon,
      code:data.get('code').value,
      version:data.get('version').value,
      title:data.get('title').value,
      duration:data.get('duration').value,
      effort:data.get('effort').value,
      description:this.description,
      programNeed:this.programNeed,
      activationMethod:data.get('activationMethod').value,
      currency:data.get('currency').value,
      actualPrice:data.get('actualPrice').value,
      offeredPrice:data.get('offeredPrice').value,
      discount:data.get('discount').value,
      isPaid:data.get('isPaid').value,
      tags:this.tags,
      status:this.status,
      projectData:this.learningData,
      courseData:this.coursesData
    }
   
    this.programService.addProgram(programData).subscribe((res: any) => {
      if(res['success']) {
      	this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Project', 'Successfully Saved');
        this.router.navigate(['/',this.urlPrefix, 'programs', ])
      }
    }, error => {
    	let errMsg = error.json();
    	this.errMessage = errMsg.msg;
    	this.messageService.showErrorToast(this._vcr, this.errMessage);
      this.handleError(error);
    })
  }


  // update Project
  updateProgram(data: any) {
    if(this.description==undefined || this.description==null || this.description==''){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.required)
    }
     else if(this.description.length<=this.Config.description.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
    } else if (this.description.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }

    if(this.programNeed==undefined || this.programNeed==null || this.programNeed==''){
    return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.required)
    }
   else if(this.programNeed.length<=this.Config.prerequisites.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.minlength[1]);
    } else if (this.programNeed.length>=this.Config.prerequisites.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.prerequisites.maxlength[1]);
    }
    
    if(this.tags.length<1) {
      return this.messageService.showErrorToast(this._vcr,this.Config.tags.required);
    }
    // if(!this.projectCroppedIcon || this.projectCroppedIcon==null){
    //   return this.messageService.showErrorToast(this._vcr,this.Config.icon.required);
    // }

    this.messageService.showLoader.emit(true);
    let programData={
    	//icon:this.projectCroppedIcon,
      code:data.get('code').value,
      version:data.get('version').value,
      title:data.get('title').value,
      duration:data.get('duration').value,
      effort:data.get('effort').value,
      description:this.description,
      programNeed:this.programNeed,
      activationMethod:data.get('activationMethod').value,
      currency:data.get('currency').value,
      actualPrice:data.get('actualPrice').value,
      offeredPrice:data.get('offeredPrice').value,
      discount:data.get('discount').value,
      isPaid:data.get('isPaid').value,
      tags:this.tags,
      status:this.status,
      projectData:this.learningData,
      courseData:this.coursesData
    }

    this.programService.updateProgram(programData, this.programId).subscribe((res: any) => {
      if (res['success']) {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Program', 'Successfully updated');
        this.router.navigate(['/',this.urlPrefix, 'programs', ])
      }
    }, (error: any) => {
    this.handleError(error);
    });
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
  let discount= this.programForm.get('discount').value || 0;
  let actualPrice= this.programForm.get('actualPrice').value || 0;
  let discountAmount= (parseInt(actualPrice)*parseInt(discount))/100;;
  let offerPrice=actualPrice-discountAmount;
  this.programForm.controls['offeredPrice'].setValue(offerPrice);
}

// Project content drop into main Project added list
	onProjectContentDrop(e:DropEvent) {
		let data= {
			"contentId":e.dragData._id,
			"title":e.dragData.title
		}

     this.alreadadd=false;
		let found = this.learningData.some(function (obj) {
    return obj.contentId === data.contentId;
  });
   if(found){
   	 // this.alreadadd=true; 
   	 this.messageService.showErrorToast(this._vcr,`Project already added`);
     this.projectContent=[];
   }else{
     this.projectContent=data;
   }
   

	}

// add items here()
addProject(){
	this.learningData.push(this.projectContent);
	this.projectContent=[];
}

// courses content drop into Courses added list
onCourseContentDrop(e:DropEvent){
	let data= {
			"contentId":e.dragData._id,
			"title":e.dragData.title
		}
		
		 this.alreadadd=false;
		let found = this.coursesData.some(function (obj) {
    return obj.contentId === data.contentId;
  });
   if(found){
   	 this.messageService.showErrorToast(this._vcr,`Course already added`);
     this.courseContent=[];
   }else{
     this.courseContent=data;
   }
}


// add courses data to list
addCourse()
{
  this.coursesData.push(this.courseContent);
  this.courseContent=[];
}
configDropDown() {
	this.projectsConfig = {
		singleSelection: false,
		text:"Select Catogiries",
		selectAllText:'Select All',
		unSelectAllText:'UnSelect All',
		enableSearchFilter: true,
	};
	this.coursesConfig={
		singleSelection: false,
		text:"Select Catogiries",
		selectAllText:'Select All',
		unSelectAllText:'UnSelect All',
		enableSearchFilter: true,
	};
}

/* to get all project request */
getAllProjects(){
	this.projectService.fetchProjects().subscribe((response)=>{
		if(response.data){
			this.projects = response.data;
			
			this.projectList= this.projects.map((projects, index)=>{
				let data = {
					"_id":projects._id,
					"itemName":projects.title
				}
        
				return data;
			})
		}
	},error=>{
		this.errorMessage=error.json().msg;
		this.handleError(error);
	})
	
}
// to get all courses request
fetchCourses()
{
	 this.messageService.showLoader.emit(true);
		this.courseService.fetchCourses().subscribe((res: any) => {
			this.messageService.showLoader.emit(false);
			
			this.courses = res.data;
			
			 this.courseList= this.courses.map((courses, index)=>{
				let data = {
					"id":index,
					"itemName":courses.title
				}
				return data;
			})
		},  error => {
			let errMsg = error.json();
			this.errMessage = errMsg.msg;
			this.handleError(error);
		});
}
// remove data from array of project
removeProjectContentData(id)
{
	this.learningData = this.learningData.filter(function( obj ) {
  return obj.contentId !== id;
});

  
}
// remove data from array of courses
removeCoursesContentData(id)
{
	this.coursesData = this.coursesData.filter(function( obj ) {
  return obj.contentId !== id;
});
  
}

// Rotate the arrow icon
rotate(id) {
	document.getElementById(id).classList.toggle('rotate-up');
	document.getElementById(id).classList.toggle('rotate-down');
}

// Handle error
	handleError(error) {
		this.messageService.showLoader.emit(false);
		if(error.status===500) {
			this.backendErrorMsg= this.errorService.iterateError(error);
		} else {
			this.errorService.handleError(error, this._vcr);
		}
	}

//File crops functions
onFileChange(event) {
   if(event.target.files.length > 0) {
     let file = event.target.files[0];
     if(file.size>AppConfig.COURSE_IMAGE_SIZE[0])  {
       this.programForm.get('icon').setValue('');
       return this.messageService.showErrorToast(this._vcr,MessageConfig.FILE_UPLOAD.FILE_SIZE_ERROR + AppConfig.COURSE_IMAGE_SIZE[1] +" kb");
     }else {
       this.programForm.get('icon').setValue(file);
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
}
