import { Component, OnInit, ViewChild, Inject, ViewContainerRef,OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup,FormBuilder,Validators} from '@angular/forms'
import { CourseService } from './../../../services/courses/course.service';
import { MessageService } from './../../../services/common/message.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { StudentService } from './../../../services/students/student.service';
import { ErrorService } from './../../../services/common/error.service';
import { AppConfig } from './../../../config/app-config.constants';

@Component({
	selector: 'app-author-courses',
	templateUrl: './author-courses.component.html',
	styleUrls: ['./author-courses.component.css'],
	providers : [ CourseService,StudentService ]
})

export class AuthorCoursesComponent implements OnInit, OnDestroy {
  @ViewChild('closeModal') closeModal
  courseStatusFrom: FormGroup;
  private fb: FormBuilder;
  public courses : any ;
  public errMessage: any;
  public errorMessage: any;
  public colors :any;
  public urlPrefix : String;
  public permissions = [];
  public userFlow : boolean= false;
  public dataArray : any;
  CONFIG=CommonConfig;
  public imgPath:string = new CommonConfig().STATIC_IMAGE_URL+'course';
  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 8;
  courseImgPath:string = new CommonConfig().BASE_URL+CommonConfig.FOLDERS[0];
  courseTypes:string[]=['My Courses','All Courses'];
  courseType:string=this.courseTypes[0];
  userId:string;
  role:string;
  message:string;
  courseActionStatus:any=[];
  status:string="";
  courseId:string;

  constructor(
    @Inject(FormBuilder)fb:FormBuilder,
    private courseService : CourseService,
    private router : Router,
    private messageService : MessageService,
    private errorService: ErrorService,
    private authenticationService : AuthenticationService,
    private studentService : StudentService,
    private _vcr : ViewContainerRef,
    ) { 
    this.fb=fb;
    this.initializeForm();
  }

  //intialize form
  initializeForm() {
    this.courseStatusFrom=this.fb.group({
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
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.COURSES);
    let userType = this.authenticationService.getUserType();
		// if(role=== CommonConfig.USER_STUDENT && userType===AppConfig.STUDENT_TYPE[1]) {
		// 	this.getAssignCourses(this.authenticationService.getUserId());
		// }else {
		// 	this.fetchCourses();
		// }
    if(this.role === CommonConfig.USER_INSTRUCTOR && this.courseType===this.courseTypes[0]) {
      this.getMyCoursesForInstructor();
    }else {
      this.fetchCourses();
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
    this.courses = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
  }
  /*pagination logic end here*/

  //on course type change
  courseTypeChange() {
    if(this.courseType===this.courseTypes[0]) {
      this.getMyCoursesForInstructor();
    }else {
      this.fetchCourses();
    }
  }

  //fetch courses
  fetchCourses(){
    this.messageService.showLoader.emit(true);
    this.courseType=this.courseTypes[1];
    this.courseService.fetchCourses().subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      
      this.courses = res.data;
      this.dataArray = res.data;
      this.totalItems= this.dataArray.length;
      this.paginationData();
    },  error => {
      let errMsg = error.json();
      this.errMessage = errMsg.msg;
      this.handleError(error);
    });
  }

  //get my courses for instructor
  getMyCoursesForInstructor() {
    this.messageService.showLoader.emit(true);
    this.courseService.getMyCoursesForInstructor().subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      if(res.data && res.data.length>0) {
        this.courses = res.data;
        this.dataArray = res.data;
        this.totalItems= this.dataArray.length;
        this.paginationData();
      }else {
        this.fetchCourses();
      }
    },  error => {
      let errMsg = error.json();
      this.errMessage = errMsg.msg;
      this.handleError(error);
    });
  }
  
  // Delete category
  deleteCourse(courseId:any){
  	this.messageService.deleteConfirmation(()=>{
  		this.messageService.showLoader.emit(true);
  		return this.courseService.deleteCourse(courseId).subscribe(data=>	{ 
  			if(data['success'])
  			{
  				this.messageService.showLoader.emit(false);
  				this.getMyCoursesForInstructor();
  				this.messageService.successMessage('Course', 'Successfully Deleted');
  			}
  		},(error:any)=>{
  			let errorObj = error.json();
  			if (errorObj.msg) {
  				this.errorMessage = errorObj.msg;
          this.handleError(error);
        }
        this.handleError(error);
      });
  	});
  }

// set course action type based on role
setActionType(course) {
  this.courseId= course._id;
  this.initializeForm();
// CONTENT_STATUS = ['Active','Inactive','Deleted','Drafted','Submitted','Rejected'];

if(this.role == CommonConfig.USER_ADMIN) {
  if (course.status === CommonConfig.CONTENT_STATUS[3]) {
    this.courseActionStatus=[
    {'key': "Submit For Review", val: CommonConfig.CONTENT_STATUS[4] }
    ];
  } else if (course.status === CommonConfig.CONTENT_STATUS[4]) {
    this.courseActionStatus=[
    {'key': CommonConfig.CONTENT_STATUS[0], val: CommonConfig.CONTENT_STATUS[0] }, 
    {'key': CommonConfig.CONTENT_STATUS[1], val: CommonConfig.CONTENT_STATUS[1] }, 
    {'key': CommonConfig.CONTENT_STATUS[2], val: CommonConfig.CONTENT_STATUS[2] }, 
    {'key': CommonConfig.CONTENT_STATUS[5], val: CommonConfig.CONTENT_STATUS[5] },
    {'key': CommonConfig.CONTENT_STATUS[3], val: CommonConfig.CONTENT_STATUS[3] }, 
    ];
  } else {
    this.courseActionStatus=[
    {'key': CommonConfig.CONTENT_STATUS[0], val: CommonConfig.CONTENT_STATUS[0] }, 
    {'key': CommonConfig.CONTENT_STATUS[1], val: CommonConfig.CONTENT_STATUS[1] }, 
    {'key': CommonConfig.CONTENT_STATUS[2], val: CommonConfig.CONTENT_STATUS[2] }, 
    {'key': CommonConfig.CONTENT_STATUS[3], val: CommonConfig.CONTENT_STATUS[3] }, 
    ];
  }

}else {
  this.courseActionStatus=[{'key': "Submit For Review", val: CommonConfig.CONTENT_STATUS[4] }]
  this.courseStatusFrom.get('status').setValue(CommonConfig.CONTENT_STATUS[4]);
  this.courseStatusFrom.get('status').disable();
}
}

//get student details
// getAssignCourses(studentId:string) {
  // 	this.messageService.showLoader.emit(true);
  // 	this.studentService.getCourses(studentId)
  // 	.subscribe(response=> {
  // 		if(response['data']) { 
  // 			this.messageService.showLoader.emit(false);

  // 			this.courses=response['data'].map(ele=>ele.course);
  // 		}
  // 	},error=>{
  // 		this.messageService.showLoader.emit(false);
  // 		this.errorMessage=error.json().msg;
  // 	});
  // }

//submit course status
submitCourseStatus() {
  if(this.courseId) {
    let statusDetails={
      statusTo: this.courseStatusFrom.get('status').value,
      message: this.courseStatusFrom.get('message').value,
    }
    let idx=this.courses.findIndex(course=> course._id==this.courseId);
    if(idx > -1) {
      if(this.courses[idx].status===statusDetails.statusTo) {
        let status=this.courseActionStatus.find(sts=> sts.val==statusDetails.statusTo);
        return this.messageService.showErrorToast(this._vcr,`Course already ${status.key} !`);
      }
    }
    this.messageService.showLoader.emit(true);
    this.courseService.updateCourseStatus(this.courseId,statusDetails).subscribe((res: any)=> {
      this.messageService.showLoader.emit(false);
      if(res['isInvalid']) {
        this.closeModal.nativeElement.click();
        return this.router.navigate(['/',this.urlPrefix,'courses',this.courseId,'validate-course']);
      }
      if(res['data'] && res['data'].updatedStatus) {
        if(idx >= 0) {
          this.courses[idx].status=res['data'].updatedStatus;
        }
      }
      this.messageService.showSuccessToast(this._vcr,'Course status updated successfully !');
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

  ngOnDestroy() {
    this.closeModal.nativeElement.click();
  }
}
