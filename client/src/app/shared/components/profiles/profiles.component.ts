import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from './../../services/common/authentication.service';
import { ProfileService } from './../../services/profiles/profiles.service';
import { CommonConfig } from './../../config/common-config.constants';
import { StudentService } from './../../services/students/student.service';
import { InstructorService } from './../../services/instructors/instructors.service';
import { AdminService } from './../../services/admins/admins.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css'],
  providers : [StudentService, InstructorService,AdminService]
})
export class ProfilesComponent implements OnInit {
public sidebar =['Profile', 'Change password','Address','academic details','social profile'];
public icons =['fa fa-lock', 'fa fa-key'];
public profileSection='Profile';
public userRole : any;
public userData: any = {} ;
public errorMessage : any = '';

  constructor(
  	private profileService : ProfileService,
  	private loginService: AuthenticationService,
  	private studentService: StudentService,
    private adminService:AdminService,
		private instructorService : InstructorService,
		private messageService : MessageService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef,
  	) {
  
  }
  ngOnInit() {
  	this.userRole= this.loginService.userRole;
  	this.getUserDetail()
  	//this.changeProfileSection();
  //	this.getByChild();
  }
  getByChild(){
  	this.getUserDetail();
  }
   getUserDetail(){
      let $userService= this.getUserInfo(this.userRole);
      if($userService) {
        $userService.subscribe(response=>{
          if(response.data){
            this.profileService.updateProfile.emit(response.data);
            this.userData=response.data;
            console.log("-->"+JSON.stringify(this.userData))
            }
          else {}
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

	changeProfileSection() {
		 this.profileSection='Profile';
	}
	// click on tab password
	changeProfilepassword() {
		this.profileSection='Change password';
	}
	// click on tab profile address
	profileAddress()
	{
		this.profileSection='Address';
	}
	// click on tab acadmicdetails
	academicDetails()
	{
       this.profileSection='academic details';
	}
	// click on tab social profile
	socialProfileDetails()
	{
		this.profileSection='social profile';
	}
	 handleError(error) {
    	this.messageService.showLoader.emit(false);
    	this.errorService.handleError(error, this._vcr);
    }
}
