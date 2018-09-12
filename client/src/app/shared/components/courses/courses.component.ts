import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormGroup,	FormBuilder,	Validators,	FormControl} from '@angular/forms';
import { CourseService } from './../../services/courses/course.service';
import { MessageService } from './../../services/common/message.service';
import { CommonConfig } from './../../config/common-config.constants';
import { AuthenticationService } from '../../services/common/authentication.service';
import { StudentService } from './../../services/students/student.service';
import { AppConfig } from './../../config/app-config.constants';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
  providers : [ CourseService,StudentService ]
})

export class CoursesComponent implements OnInit {
	public courses : any ;
	public errMessage: any;
  public errorMessage: any;
  public colors :any;
  public urlPrefix : String;
  public role : String;
  public userType : String;
  public permissions = [];
  public userFlow : boolean= false;
  public description: any;

  constructor(
  	private courseService : CourseService,
  	private router : Router,
    private messageService : MessageService,
    private authenticationService : AuthenticationService,
    private studentService : StudentService
    ) { 
  }
  
  ngOnInit() {
    this.role = this.authenticationService.userRole;
    this.userType = this.authenticationService.getUserType();
  }
  
 /* 
    this.urlPrefix = role.toLowerCase();
    this.userFlow = this.authenticationService.getUserFlow(role);
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.COURSES);
    if(role=== CommonConfig.USER_STUDENT && userType===AppConfig.STUDENT_TYPE[1]) {
      this.getAssignCourses(this.authenticationService.getUserId());
    }else {
      this.fetchCourses();
    }
    this.colors = CommonConfig.colors;
  }

  //fetch courses
  fetchCourses(){
   
    this.messageService.showLoader.emit(true);
    this.courseService.fetchCourses().subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.courses = res.data;
    },  error => {
      this.messageService.showLoader.emit(false);
      let errMsg = error.json();
      this.errMessage = errMsg.msg
    });
  }

  // Delete category
  deleteCourse(courseId:any){
    this.messageService.deleteConfirmation(()=>{
      this.messageService.showLoader.emit(true);
      return this.courseService.deleteCourse(courseId).subscribe(data=>
      { 
        if(data['success'])
        {
          this.messageService.showLoader.emit(false);
          this.fetchCourses();
          this.messageService.successMessage('Course', 'Successfully Deleted');
        }
      },(error:any)=>{
        this.messageService.showLoader.emit(false);
        let errorObj = error.json();
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;
        }
      });
    });
  }

  //get student details
  getAssignCourses(studentId:string) {
    this.messageService.showLoader.emit(true);
    this.studentService.getCourses(studentId)
    .subscribe(response=> {
      if(response['data']) { 
        this.messageService.showLoader.emit(false);
        this.courses=response['data'].map(ele=>ele.course);
      }
    },error=>{
      this.messageService.showLoader.emit(false);
      this.errorMessage=error.json().msg;
    });
  }*/

}
