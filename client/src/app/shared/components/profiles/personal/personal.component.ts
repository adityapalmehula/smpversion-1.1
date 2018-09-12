import { Component, OnInit, Inject, ViewContainerRef,Input,EventEmitter, Output} from '@angular/core';
import { FormGroup,FormBuilder,Validators} from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';
import { ProfileService } from './../../../services/profiles/profiles.service';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { ValidationConfig } from './../../../config/validation-config.constants';
import { CommonConfig } from './../../../config/common-config.constants';
import { MessageConfig } from './../../../config/message-config.constants';
import { AppConfig } from './../../../config/app-config.constants';
import { StudentService } from './../../../services/students/student.service';
import { InstructorService } from './../../../services/instructors/instructors.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';


@Component({
	selector: 'app-personal',
	templateUrl: './personal.component.html',
	styleUrls: ['./personal.component.css'],
	providers : [StudentService, InstructorService]
})
export class PersonalComponent implements OnInit {
	@Input() userPersonalData: any = {} ;
	@Output() getDetailsFromChild = new EventEmitter();
	basicProfileForm: FormGroup;
	public fb:FormBuilder;
	public imgPath : any ;
	public errorMessage : any = '';
	public userData: any = {} ;
	public userId : any;
	public userRole : any;
	public imgError: any;
	public profilePicture ='';
	public imageChangedEvent: any = '';
	public croppedImage: any = '';
	public sizeOfCroppedImage: number;
	public userImgPath:string=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[2];
	public userDefaultImg:string=new CommonConfig().STATIC_IMAGE_URL+CommonConfig.DEFAULT_USER_IMAGE.PATH;


	constructor(
		@Inject(FormBuilder)fb:FormBuilder,
		private profileService : ProfileService,
		private loginService: AuthenticationService,
		private studentService: StudentService,
		private instructorService : InstructorService,
		private messageService : MessageService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef
		) {
		this.fb=fb;
		this.intializeForm(fb);
	}

	intializeForm(fb:FormBuilder,data:any={}):void{
		this.basicProfileForm=fb.group({
			name: [data.name || '',[Validators.required,Validators.pattern(ValidationConfig.LETTERS_PATTERN)]],
			email: [data.email || '',[Validators.required,Validators.pattern(ValidationConfig.EMAIL_PATTERN)]],
			mobile: [data.mobile || '',[Validators.required,Validators.maxLength(10),Validators.pattern(ValidationConfig.MOB_NO_PATTERN)]],
			gender: [data.gender || '',[Validators.required]],
		});
	}


	ngOnInit() {
		// this.userId = this.loginService.getUserId();
		this.userRole= this.loginService.userRole;
		this.getUserDetail();
		this.getUerInfo();
		this.getUserDetail();
	}

	// method to be called when file upload button is clicked

	fileChangeEvent(event: any): void {
		this.imgError='';
		this.imageChangedEvent='';
		this.croppedImage='';
		this.imageChangedEvent = event;
	}

	/* method to be called when image cropped*/
	imageCropped(image: string) {
		this.croppedImage = image;
	}

	/* method to be called when image failed*/
	loadImageFailed(){
		this.profilePicture='';
		this.imgError=MessageConfig.FILE_UPLOAD.FILE_TYPE_ERROR;
	}

   // method to be called when Upload button is clicked
   uploadFile(closeModal) {
     
   	let y=1;
   	let last2=this.croppedImage.slice(-2);
   	if(last2=='==') {
   		y=2;
   	}
   	let size=(this.croppedImage.length*(3/4))-y;
   	if(size>AppConfig.PROFILE_IMAGE_SIZE[0]){
   		this.imgError=MessageConfig.FILE_UPLOAD.FILE_SIZE_ERROR + AppConfig.PROFILE_IMAGE_SIZE[1] +'KB';
   		return this.imgError;
   	}
   	this.sizeOfCroppedImage=size
   	if(this.croppedImage){
   		let data={
   			image:this.croppedImage,
   			role:this.userRole
   		};
   		this.messageService.showLoader.emit(true);
   		this.profileService.uploadFile(data).subscribe(res=>{
   			this.messageService.showLoader.emit(false);
   			closeModal.click();
   			this.croppedImage='';
   			this.imageChangedEvent='';
   			this.messageService.successMessage('Profile', 'Successfully Updated');
   			this.getUserDetail();
   		},error => { 
   			this.messageService.showLoader.emit(false);
   			this.errorMessage=error.json().msg;
   			this.handleError(error);
   		})
   	}else {
   		this.profilePicture='';
   		this.imgError=MessageConfig.FILE_UPLOAD.SELECT_FILE;
   	}
   }
   getUerInfo(){
   	if(this.userPersonalData){
					this.userData=this.userPersonalData;
					if(this.userPersonalData.profilePic) {
						this.imgPath=this.userImgPath+this.userPersonalData.profilePic;
					} else {
						this.imgPath=this.userDefaultImg;
					}
					this.intializeForm(this.fb,this.userPersonalData);
				}
   	//this.userData=response.data;
				// 	if(response.data.profilePic) {
				// 		this.imgPath=this.userImgPath+response.data.profilePic;
				// 	} else {
				// 		this.imgPath=this.userDefaultImg;
				// 	}
				// 	this.intializeForm(this.fb,this.userData);
				// }
   }

		// Get user detail on basis of userId
		getUserDetail(){
			this.profileService.getDetails().subscribe((response)=>{
				if(response.data){
					this.profileService.updateProfile.emit(response.data);
					this.userData=response.data;
					if(response.data.profilePic) {
						this.imgPath=this.userImgPath+response.data.profilePic;
					} else {
						this.imgPath=this.userDefaultImg;
					}
					this.intializeForm(this.fb,this.userData);
				}
			}, (error)=>{
				this.errorMessage=error.json().msg; 
				this.handleError(error);
			})		
		}	

		// update user detail on basis of userId
		updateBasicForm(data:any){
			let basicInfo= {
				name: this.basicProfileForm.get('name').value,
				mobile: this.basicProfileForm.get('mobile').value,
				gender: this.basicProfileForm.get('gender').value,
				role : this.userRole
			}
			this.messageService.showLoader.emit(true);
			this.profileService.updateBasicInfo(basicInfo).subscribe(response=>{
				if(response['success']) {
					this.messageService.showLoader.emit(false);
					this.messageService.successMessage('Profile', 'Successfully Changed');
					this.getDetailsFromChild.emit();
					this.getUserDetail();
				}
			}, error=>{
				this.errorMessage=error.json().msg;
				this.handleError(error);
			});
		}
		close(){
			this.imgError='';
			this.profilePicture='';
			this.imageChangedEvent='';
			this.croppedImage='';
		}

 // Handle error
 handleError(error) {
 	this.messageService.showLoader.emit(false);
 	this.errorService.handleError(error, this._vcr);
 }
}