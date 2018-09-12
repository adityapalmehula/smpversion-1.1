import { Component, OnInit, Inject, ViewContainerRef,Input,EventEmitter, Output} from '@angular/core';
import { FormGroup,FormBuilder,Validators} from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';
import { ProfileService } from './../../../services/profiles/profiles.service';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { ValidationConfig } from './../../../config/validation-config.constants';
import { MessageConfig } from './../../../config/message-config.constants';
import { AppConfig } from './../../../config/app-config.constants';
import { StudentService } from './../../../services/students/student.service';
import { InstructorService } from './../../../services/instructors/instructors.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { SwitchConfig } from './../../../config/switch-config.constants';
import { AdminService } from './../../../services/admins/admins.service';
import { CommonConfig } from './../../../config/common-config.constants';

@Component({
  selector: 'app-academic-details',
  templateUrl: './academic-details.component.html',
  styleUrls: ['./academic-details.component.css'],
  providers : [StudentService, InstructorService,AdminService]
})
export class AcademicDetailsComponent implements OnInit {
	@Input() userAcademicData: any = {} ;
	@Output() getDetailsFromChild = new EventEmitter();
	public currentApp = SwitchConfig.APP;
  public apps = SwitchConfig.APPS;
  public classes = CommonConfig.ACADEMIC.CLASSES;
  public degree = CommonConfig.ACADEMIC.DEGREE;
  public startsdate = CommonConfig.ACADEMIC.STARTSDATE;
  public endsdate = CommonConfig.ACADEMIC.ENDSDATE;
  academicForm: FormGroup;
  public fb:FormBuilder;
  public errorMessage : any = '';
  public userData: any = {} ;
  public userId : any;
  public userRole : any;

  constructor(
    @Inject(FormBuilder)fb:FormBuilder,
    private profileService : ProfileService,
    private loginService: AuthenticationService,
    private studentService: StudentService,
    private instructorService : InstructorService,
    private adminService:AdminService,
    private messageService : MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef
    ) { 
    this.fb=fb;
    this.intializeForm(fb);
  } 

  intializeForm(fb:FormBuilder,data:any={}):void{
    this.academicForm=fb.group({
      qualification: [data.qualification || '',[Validators.required]],
      instituteName: [data.instituteName || '',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
      instituteAddress: [data.instituteAddress || '',[Validators.required,Validators.minLength(5),Validators.maxLength(200)]],
      // startDate: [data.startDate || '',[Validators.required]],
      // endDate: [data.endDate || '',[Validators.required]],
      //fieldStudy: [data.fieldStudy || '',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
      //description: [data.description || '',[Validators.required,Validators.minLength(3),Validators.maxLength(200)]],
    });
  }

  ngOnInit() {
    this.userRole= this.loginService.userRole;
    this.getUserDetail();
  }

    // update academic details data.
    academicDetails(data:any)
    {
      let academicData= {
        qualification:data.get('qualification').value.trim(),
        instituteName:data.get('instituteName').value.trim(),
        instituteAddress:data.get('instituteAddress').value.trim(),
        // startDate:data.get('startDate').value.trim(),
        // endDate:data.get('endDate').value.trim(),
        // fieldStudy:data.get('fieldStudy').value.trim(),
        // description:data.get('description').value.trim(),
        role : this.userRole
      }
      this.messageService.showLoader.emit(true);
      this.profileService.academicDetails(academicData).subscribe(response=>{
        if(response['success']) {
          this.messageService.showLoader.emit(false);
          this.messageService.successMessage('Academic Details', 'Successfully Changed');
          this.getDetailsFromChild.emit();
        }
      }, error=>{
        this.errorMessage=error.json().msg;
        this.handleError(error);
      });
    }

    // Get user details .
    getUserDetail(){
    	this.userData=this.userAcademicData;
          this.intializeForm(this.fb,this.userData.academicDetails);
      // let $userService= this.getUserInfo(this.userRole);
      // if($userService) {
      //   $userService.subscribe(response=>{
      //     this.profileService.updateProfile.emit(response.data);
      //     this.userData=response.data;
      //     this.intializeForm(this.fb,this.userData.academicDetails);
      //   }, (error:any)=> {
      //     this.errorMessage=error.json().msg; 
      //     this.handleError(error);
      //   });
      // }
    }

    // get user details by role
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

    handleError(error) {
      this.messageService.showLoader.emit(false);
      this.errorService.handleError(error, this._vcr);
    }
  }
