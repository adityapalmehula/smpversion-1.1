import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from './../../../services/courses/course.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { StudentService } from './../../../services/students/student.service';
import { AppConfig } from './../../../config/app-config.constants';

@Component({
  selector: 'app-b2b-courses',
  templateUrl: './b2b-courses.component.html',
  styleUrls: ['./b2b-courses.component.css'],
  providers: [CourseService,StudentService]
})

export class B2bCoursesComponent implements OnInit {

  public courses : any ;
  public errMessage: any;
  public errorMessage: any;
  public colors :any;
  public urlPrefix : String;
  public permissions = [];
  public userFlow : boolean= false;

  constructor(
    private courseService : CourseService,
    private router : Router,
    private messageService : MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService : AuthenticationService,
    private studentService : StudentService
    ) { 
  }

  ngOnInit() {
    let role = this.authenticationService.userRole;
    this.urlPrefix = role.toLowerCase();
    this.userFlow = this.authenticationService.getUserFlow(role);
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.COURSES);
    let userType = this.authenticationService.getUserType();
    // if(role=== CommonConfig.USER_STUDENT && userType===AppConfig.STUDENT_TYPE[1]) {
    //   this.getAssignCourses(this.authenticationService.getUserId());
    // }else {
    //   this.fetchCourses();
    // }
    this.getAssignCourses();
    this.colors = CommonConfig.colors;
  }

  //fetch courses
  // fetchCourses(){

  //   this.messageService.showLoader.emit(true);
  //   this.courseService.fetchCourses().subscribe((res: any) => {
  //     this.messageService.showLoader.emit(false);
  //     this.courses = res.data;
  //   },  error => {
  //     this.messageService.showLoader.emit(false);
  //     let errMsg = error.json();
  //     this.errMessage = errMsg.msg
  //   });
  // }

  // delete course
  // deleteCourse(courseId:any){
  //   this.messageService.deleteConfirmation(()=>{
  //     this.messageService.showLoader.emit(true);
  //     return this.courseService.deleteCourse(courseId).subscribe(data=>
  //     { 
  //       if(data['success']) {
  //         this.messageService.showLoader.emit(false);
  //         this.fetchCourses();
  //         this.messageService.successMessage('Course', 'Successfully Deleted');
  //       }
  //     },(error:any)=>{
  //       this.messageService.showLoader.emit(false);
  //       let errorObj = error.json();
  //       if (errorObj.msg) {
  //         this.errorMessage = errorObj.msg;
  //       }
  //     });
  //   });
  // }

  //get student details
  getAssignCourses() {
    this.messageService.showLoader.emit(true);
    this.studentService.getCourses(CommonConfig.COURSESFLAG.ONE)
    .subscribe(response=> {
      if(response['data']) { 
        this.messageService.showLoader.emit(false);
        this.courses=response['data'].filter(ele=> ele.course).map(ele=>ele.course);
      }
    },error=>{
      this.errorMessage=error.json().msg;
       this.handleError(error);
    });
  }

    // Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
    this.messageService.showLoader.emit(false);
  }
}