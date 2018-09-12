import { Component, OnInit, ViewChild,ElementRef, OnDestroy, ViewContainerRef} from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from './../../../services/courses/course.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { MessageConfig } from './../../../config/message-config.constants';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { StudentService } from './../../../services/students/student.service';
import { AppConfig } from './../../../config/app-config.constants';
import { FacebookShareService } from './../../../services/common/facebookshare.service';
import { CategoryService } from './../../../services/categories/category.service';


@Component({
	selector: 'app-b2c-courses',
	templateUrl: './b2c-courses.component.html',
	styleUrls: ['./b2c-courses.component.css'],
	providers : [ CourseService, StudentService, FacebookShareService, CategoryService ]
})
export class B2cCoursesComponent implements OnInit {
	@ViewChild('close')close: ElementRef;
	public courses : any ;
	public errorMessage: any;
	public urlPrefix : String;
	public permissions = [];
	imgPath="./../../../../../assets/images/course";
	public studentInfo:any;
	public courseId:string;
	public learningStatus:any=CommonConfig.LEARNING_PROCESS_STATUS;
	public dataArray : any;
	public searchText : any;
	public courseDetails: any;
	public categoryDetails : any=[];

	public totalItems: number = 0;
	public currentPage: number = 1;
	public itemsPerPage: number = 10;
  courseImgPath:string='courses/';

	constructor(
		private courseService: CourseService,
		private router: Router,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
		private messageService: MessageService,
		private authenticationService: AuthenticationService,
		private studentService: StudentService,
		private facebookShareService: FacebookShareService,
		private categoryService: CategoryService
		) { 
    // Initailze FacebookService method. 
    this.facebookShareService.initFacebook();
  }

  ngOnInit() {
  	let role = this.authenticationService.userRole;
  	this.urlPrefix = role.toLowerCase();
  	this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.COURSES);
  	// this.getStudentDetails();
  	this.fetchCourses();

    /*let userType = this.authenticationService.getUserType();
    if(role=== CommonConfig.USER_STUDENT && userType===AppConfig.STUDENT_TYPE[1]) {
      this.getAssignCourses(this.authenticationService.getUserId());
    }else {
      
    }*/
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


  //fetch courses
  fetchCourses(){
  	this.errorMessage='';
  	this.messageService.showLoader.emit(true);
  	this.courseService.fetchCourses().subscribe((res: any) => {
  		this.messageService.showLoader.emit(false);
  		this.courseDetails=res.data;
  		this.courses = res.data;
  		this.courseDisplay(this.courses);
  		this.getCategories(this.courseDetails);
  	},error => {
  		this.messageService.showLoader.emit(false);
  		let errMsg = error.json();
  		this.errorMessage = errMsg.msg
      this.handleError(error);
  	});
  }

  /* get categories data*/
  getCategories(courseData: any) {
  	let category = courseData.map(elem => elem.category);
  	this.categoryService.categoryGet().subscribe(
  		res => {
  			if(res.data){      	
  				let categoryData=res.data;
  				this.categoriesData(categoryData,category)
  			}
  		},
  		error => {
  			let errMsg = error.json();
        this.handleError(error);
        // this.errMessage = errMsg.msg
      });

  }
   	//compare category for display
   	categoriesData(categoryData, studentCategory) {
   		this.categoryDetails= categoryData.filter(elem1 => studentCategory.some(elem2 => elem1._id == elem2));
   	}

   	/* display course*/
   	courseDisplay(coursesData: any){
   		this.dataArray = coursesData;
   		this.totalItems= this.dataArray.length;
   		this.paginationData();
   	}

  	// on text to search
  	// search(){
  	// 	if(this.searchText) {
  	// 		this.searchText=this.searchText.toLowerCase();
   //      console.log(this.searchText);
  	// 		this.courses= this.courseDetails.filter(elem=> {
  	// 			let title= elem.title.toLowerCase();
  	// 			let shortDescription= elem.shortDescription.toLowerCase();
  	// 			let longDescription= elem.longDescription.toLowerCase();
   //        console.log(shortDescription);
  	// 			return  (title.search(this.searchText) || shortDescription.search(this.searchText) || longDescription.search(this.searchText))
  	// 		})
  	// 	} else {
  	// 		this.courses=this.courseDetails;
  	// 	}
   // 		this.courseDisplay(this.courses);
  	// }

	 // filter data on press Enter
	 // handleKeyDown() {
	 // 	this.search();
	 // }

	 /* get courses on basis of category*/
	 getCourseBasisCategory(categoryId){
	 	this.courses=this.courseDetails.filter(elem=> elem.category==categoryId);
	 	this.courseDisplay(this.courses);
	 }

	 /*load all data*/ 
	 loadAllData(){
	 	this.courses=this.courseDetails;
	 }



	 /* get student details */
  // getStudentDetails() {
  // 	this.studentService.findStudentInfo().subscribe(response=> {
  // 		if(response['data']) {
  // 			this.studentInfo=response['data'];
  // 		} 
  // 	},error=>{
  // 		this.errorMessage=error.json().msg;
  // 	});
  // }

  //get assign course detail
  // getAssignCourses(studentId:string) {
  //   this.errorMessage='';
  //   this.messageService.showLoader.emit(true);
  //   this.studentService.getCourses(studentId)
  //   .subscribe(response=> {
  //     if(response['data']) { 
  //       this.messageService.showLoader.emit(false);
  //       this.courses=response['data'].map(ele=> ele.course);
  //     }
  //   },error=> {
  //     this.messageService.showLoader.emit(false);
  //     this.errorMessage=error.json().msg;
  //   });
  // }

//subscribe course 
// subscribeCourse(activationMethod: string,courseId: string,shareModal: any) {
// 	this.courseId=courseId;
// 	this.errorMessage='';
// 	if(activationMethod=== CommonConfig.COURSE_ACTIVATION_TYPE[0] && this.studentInfo) {
// 		if(this.studentInfo.isSubscribed){
// 			this.takeCourse(courseId,true);
// 		}else {
// 			shareModal.click();
// 		}
// 	}else if(activationMethod === CommonConfig.COURSE_ACTIVATION_TYPE[1]) {
// //add paid methods here
// }
// }

//share with social media
// socialMediaShare() {
// 	this.errorMessage='';
// 	this.facebookShareService.share((error, res)=> {
// 		if(error) {
// 			this.errorMessage=MessageConfig.SOMETHING_WENT_WRONG;
// 			this.close.nativeElement.click();
// 		}else if(res) {
// 			if(this.courseId) {
// 				this.takeCourse(this.courseId);
// 			}
// 		}else {
// 			this.close.nativeElement.click();
//       //this.errorMessage=MessageConfig.INTERNAL_ERROR_OCCURED;
//     }
//   });
// }

//assign course to student 
// takeCourse(courseId:string,byShare:boolean=false) {
// 	this.errorMessage='';
// 	let course=this.courses.find(course=> course._id===courseId);
// 	course['byShare']=byShare;
// 	this.studentService.assignCourse(course)
// 	.subscribe(response=>{
// 		this.close.nativeElement.click();
// 		if(response['success']){
// 			this.messageService.successMessage('Course', 'Assign successfully');
// 		}
// 	},error=>{
// 		this.errorMessage=error.json().msg;
// 		this.close.nativeElement.click();
// 	});
// }

//buy course 
// buyCourse() {
// 	this.errorMessage='';
// }

//called on component destroy 
// ngOnDestroy(){
// 	this.close.nativeElement.click();
// }

    // Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
    this.messageService.showLoader.emit(false);
  }
}
