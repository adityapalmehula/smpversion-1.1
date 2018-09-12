import { Component, OnInit, ViewChild, Inject, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup,FormBuilder,Validators} from '@angular/forms'
import { ProjectService } from './../../services/projects/project.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';
import { CommonConfig } from './../../config/common-config.constants';
import { AuthenticationService } from './../../services/common/authentication.service';
import { StudentService } from './../../services/students/student.service';
import { AppConfig } from './../../config/app-config.constants';

@Component({
	selector: 'app-projects',
	templateUrl: './projects.component.html',
	styleUrls: ['./projects.component.css'],
	providers : [ ProjectService ,StudentService ]
})
export class ProjectsComponent implements OnInit {

  // @Inject(FormBuilder)fb:FormBuilder;
  @ViewChild('closeModal') closeModal

  projectStatusFrom: FormGroup;
  private fb: FormBuilder;
  public projects : any ;
  public projectId:any
  public errMessage: any;
  public errorMessage: any;
  public colors :any;
  public urlPrefix : String;
  public permissions = [];
  public userFlow : boolean= false;
  public dataArray : any;
  CONFIG=CommonConfig;
  imgPath="./../../../../../assets/images/projects";
  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 8;
  courseImgPath:string='projects/';
  courseTypes:string[]=['My Projects','All Projects'];
  courseType:string=this.courseTypes[0];
  userId:string;
  role:string;
  message:string;
  projectActionStatus:any=[];
  status:string="";

  constructor(
    @Inject(FormBuilder)fb:FormBuilder,
    private projectService : ProjectService,
    private router : Router,
    private messageService : MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService : AuthenticationService,
    private studentService : StudentService
    ) { 
    this.fb=fb;
    this.initializeForm();
  }

  //intialize form
  initializeForm() {
      this.projectStatusFrom=this.fb.group({
      status: ['',[Validators.required]],
      message: ['',[Validators.required]]
    });
  }
  ngOnInit() {
    this.userId= localStorage.getItem("userId");
    if(!this.userId) {
      this.router.navigate(['/']);
    }
    this.role = this.authenticationService.userRole;
    this.urlPrefix = this.role.toLowerCase();
    this.userFlow = this.authenticationService.getUserFlow(this.role);
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.PROJECTS);
    let userType = this.authenticationService.getUserType();
		// if(roleCommonConfig.USER_STUDENT && userType===AppConfig.STUDENT_TYPE[1]) {
		// 	this.getAssignProjects(this.authenticationService.getUserId());
		// }else {
		// 	this.fetchProjects();
		// }
    if(this.role === CommonConfig.USER_INSTRUCTOR && this.courseType===this.courseTypes[0]) {
      this.getMyProjectsForInstructor();
    }else {
      this.fetchProjects();
    }
    this.colors = CommonConfig.colors;
  }

  /*pagination logic start here*/
  public setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }

  public pageChanged(event: any): void {
    this.currentPage = event.page;
    this.paginationData();
  }

  paginationData() {
    const indexOfLastItem = this.currentPage * this.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
    this.projects = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
  }
  /*pagination logic end here*/

  //on course type change
  courseTypeChange() {
    if(this.courseType===this.courseTypes[0]) {
      this.getMyProjectsForInstructor();
    }else {
      this.fetchProjects();
    }
  }

  //fetch projects
  fetchProjects(){
    this.messageService.showLoader.emit(true);
    this.projectService.fetchProjects().subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.projects = res.data;
      this.dataArray = res.data;
      this.totalItems= this.dataArray.length;
      this.paginationData();
    },  error => {
      this.handleError(error);
      let errMsg = error.json();
      this.errMessage = errMsg.msg
    });
  }

  //get my projects for instructor
  getMyProjectsForInstructor() {
    this.messageService.showLoader.emit(true);
    this.projectService.getMyProjectsForInstructor().subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.projects = res.data;
      this.dataArray = res.data;
      this.totalItems= this.dataArray.length;
      this.paginationData();
    },  error => {
      this.handleError(error);
      let errMsg = error.json();
      this.errMessage = errMsg.msg
    });
  }
  
  // Delete category
  deleteProject(courseId:any){
  	this.messageService.deleteConfirmation(()=>{
  		this.messageService.showLoader.emit(true);
  		return this.projectService.deleteProject(courseId).subscribe(data=>	{ 
        
  			if(data['success'])
  			{
  				this.messageService.showLoader.emit(false);
  				this.fetchProjects();
  				this.messageService.successMessage('Project', 'Successfully Deleted');
  			}
  		},(error:any)=>{
  			let errorObj = error.json();
        this.handleError(error);
  			if (errorObj.msg) {
  				this.errorMessage = errorObj.msg;
  			}
  		});
  	});
  }

// set course action type based on role
setActionType(project) {
  this.initializeForm();
  this.projectId=project._id;
if(this.role == CommonConfig.USER_ADMIN) {
  if (project.status === CommonConfig.CONTENT_STATUS[3]) {
    this.projectActionStatus=[
    {'key': "Submit For Review", val: CommonConfig.CONTENT_STATUS[4] }
    ];
  } else if (project.status === CommonConfig.CONTENT_STATUS[4]) {
    this.projectActionStatus=[
    {'key': CommonConfig.CONTENT_STATUS[0], val: CommonConfig.CONTENT_STATUS[0] }, 
    {'key': CommonConfig.CONTENT_STATUS[1], val: CommonConfig.CONTENT_STATUS[1] }, 
    {'key': CommonConfig.CONTENT_STATUS[2], val: CommonConfig.CONTENT_STATUS[2] }, 
    {'key': CommonConfig.CONTENT_STATUS[5], val: CommonConfig.CONTENT_STATUS[5] },
    {'key': CommonConfig.CONTENT_STATUS[3], val: CommonConfig.CONTENT_STATUS[3] }, 
    ];
  } else {
    this.projectActionStatus=[
    {'key': CommonConfig.CONTENT_STATUS[0], val: CommonConfig.CONTENT_STATUS[0] }, 
    {'key': CommonConfig.CONTENT_STATUS[1], val: CommonConfig.CONTENT_STATUS[1] }, 
    {'key': CommonConfig.CONTENT_STATUS[2], val: CommonConfig.CONTENT_STATUS[2] }, 
    {'key': CommonConfig.CONTENT_STATUS[3], val: CommonConfig.CONTENT_STATUS[3] }, 
    ];
  }

}else {
  this.projectActionStatus=[{'key': "Submit For Review", val: CommonConfig.CONTENT_STATUS[4] }]
  this.projectStatusFrom.get('status').setValue(CommonConfig.CONTENT_STATUS[4]);
  this.projectStatusFrom.get('status').disable();
}

}



  submitProjectStatus() {
  if(this.projectId) {
    let statusDetails={
      statusTo: this.projectStatusFrom.get('status').value,
      message: this.projectStatusFrom.get('message').value,
    }
    let idx=this.projects.findIndex(project=> project._id==this.projectId);
    if(idx > -1) {
      if(this.projects[idx].status===statusDetails.statusTo) {
        let status=this.projectActionStatus.find(sts=> sts.val==statusDetails.statusTo);
        return this.messageService.showErrorToast(this._vcr,`Project already ${status.key} !`);
      }
    }

      // if(project.status===statusDetails.statusTo) {
      //   let status=this.projectActionStatus.find(sts=> sts.val==statusDetails.statusTo);
      //   return this.messageService.showErrorToast(this._vcr,`Project already ${status.key} !`);
      // }
   // }
    this.messageService.showLoader.emit(true);
    this.projectService.updateProjectStatus(this.projectId,statusDetails).subscribe((res: any)=> {
      this.messageService.showLoader.emit(false);
      if(res['isInvalid']) {
        this.closeModal.nativeElement.click();
        return this.router.navigate(['/',this.urlPrefix,'projects',this.projectId,'validate-project']);
      }
      if(res['data'] && res['data'].updatedStatus) {
        // if(idx >= 0) {
          this.projects[idx].status=res['data'].updatedStatus;
        // }/
      }
        this.messageService.showSuccessToast(this._vcr,res.msg);
       //this.messageService.showErrorToast(this._vcr,res.msg);
      this.closeModal.nativeElement.click();
    },  error => {
      this.messageService.showErrorToast(this._vcr,error.json().msg);
      this.handleError(error);
    });
  }

  }


   // Handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 }

}
