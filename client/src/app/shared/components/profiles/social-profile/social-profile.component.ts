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
import { AdminService } from './../../../services/admins/admins.service';

@Component({
  selector: 'app-social-profile',
  templateUrl: './social-profile.component.html',
  styleUrls: ['./social-profile.component.css'],
  providers : [StudentService, InstructorService,AdminService]
})
export class SocialProfileComponent implements OnInit {
	@Input() userSocialData: any = {} ;
	@Output() getDetailsFromChild = new EventEmitter();
	SocialProfileForm: FormGroup;
	public fb:FormBuilder;
	public errorMessage : any = '';
	public userData: any = {} ;
	public userId : any;
	public userRole : any;
	public currentUrl:any;
	public selectedurl:any;
	public selectedId:any;
	public selectURL:any;
  public platforms = CommonConfig.PLATFORMS.NAMES;

  constructor(
  	@Inject(FormBuilder)fb:FormBuilder,
		private profileService : ProfileService,
		private loginService: AuthenticationService,
		private studentService: StudentService,
		private instructorService : InstructorService,
		private messageService : MessageService,
    private adminService:AdminService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef
		) {
		this.fb=fb;
		this.intializeForm(fb);
   }
        intializeForm(fb:FormBuilder,data:any={}):void{
		this.SocialProfileForm=fb.group({
			platform: [data.platform || '',[Validators.required]],
			socialUrl: [data.socialUrl || '',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],    
		});
	}
  ngOnInit() {
  	this.userRole= this.loginService.userRole;
  	this.getUserDetail();
  }

  // update social profile data.
  socaialProfileData(data:any)
  {
  	let socailprofileData= {
  		platform:data.get('platform').value.trim(),
  		socialUrl:data.get('socialUrl').value.trim(),
  		role : this.userRole
  	          }

     this.messageService.showLoader.emit(true);
     this.profileService.socaialProfileData(socailprofileData).subscribe(response=>{
				if(response['success']) {
					this.messageService.showLoader.emit(false);
					this.messageService.successMessage('Profile Url', 'Successfully Add');
					this.getDetailsFromChild.emit();
				    this.getUserDetailMethod();
				}
				this.SocialProfileForm.reset();
			}, error=>{
				this.errorMessage=error.json().msg;
				this.handleError(error);
				this.SocialProfileForm.reset();
			});
  }

  // Delete socail profile url 
  deleteSocialUrl(deleteurl:any)
  {
  	let deletedurldata= {
  		socialUrl:deleteurl.socialUrl.trim(),
  		_id:deleteurl._id.trim(),
  		role : this.userRole
  	          }
     this.messageService.showLoader.emit(true);
     this.profileService.deleteSocialUrl(deletedurldata).subscribe(response=>{
				if(response['success']) {
					this.messageService.showLoader.emit(false);
					this.messageService.successMessage('Profile Url', 'Successfully Deleted');
				    this.getUserDetailMethod();
				}
			}, error=>{
				this.errorMessage=error.json().msg;
				this.handleError(error);
				this.SocialProfileForm.reset();
			});
  }

 // Edit socail url from modal
  editSocialUrl()
  {
   let updatedurldata= {
  		socialUrl:this.selectURL,
  		_id:this.selectedId,
  		role : this.userRole
  	          }
     this.messageService.showLoader.emit(true);

     this.profileService.editSocialUrl(updatedurldata).subscribe(response=>{
				if(response['success']) {
					this.messageService.showLoader.emit(false);
					this.messageService.successMessage('Profile Url', 'Successfully Changed');
				    this.getUserDetailMethod();
				}
				this.SocialProfileForm.reset();
			}, error=>{
				this.errorMessage=error.json().msg;
				this.handleError(error);
			});

  }
 // method to get selected url which user want to edit
  editUrl(geturl)
  {
  this.selectURL=geturl.socialUrl;
  this.selectedId=geturl._id;
  }

  // Get user information  by role 
   getUserDetail(){
   	this.userData=this.userSocialData;
					    this.currentUrl=this.userData.profileUrls;
			// let $userService= this.getUserInfo(this.userRole);
			// if($userService) {

			// 	$userService.subscribe(response=>{
			// 			this.profileService.updateProfile.emit(response.data);
			// 			this.userData=response.data;
			// 		    this.currentUrl=this.userData.profileUrls;				  
			// 	}, (error:any)=> {
			// 		this.errorMessage=error.json().msg; 
			// 		this.handleError(error);
			// 	});
			// }
		}
  // Get user information  by role 
   getUserDetailMethod(){
			let $userService= this.getUserInfo(this.userRole);
			if($userService) {
				$userService.subscribe(response=>{
						this.profileService.updateProfile.emit(response.data);
						this.userData=response.data;
					    this.currentUrl=this.userData.profileUrls;				  
				}, (error:any)=> {
					this.errorMessage=error.json().msg; 
					this.handleError(error);
				});
			}
		} 
    // switch to user service by role
	getUserInfo(role){
			let $userService;
			switch(role) {
				case CommonConfig.USER_INSTRUCTOR:
				$userService= this.instructorService.findInstructorInfo();
				break;
				case CommonConfig.USER_STUDENT:
				$userService= this.studentService.findStudentInfo();
				break;
        case CommonConfig.USER_ADMIN:
         $userService= this.adminService.findAdminInfo();
         break;
			}
			return $userService;
		}

  // error handler 
  handleError(error) {
 	this.messageService.showLoader.emit(false);
 	this.errorService.handleError(error, this._vcr);
 }
 
}
