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
import { SwitchConfig } from './../../../config/switch-config.constants'

@Component({
	selector: 'app-my-courses',
	templateUrl: './my-courses.component.html',
	styleUrls: ['./my-courses.component.css'],
	providers : [ CourseService, StudentService, FacebookShareService, CategoryService ]
})
export class MyCoursesComponent implements OnInit {
	@ViewChild('close')close: ElementRef;
	public currentApp = SwitchConfig.APP;
	public apps = SwitchConfig.APPS;
	public courses : any ;
	public coursesList : any ;
	public errorMessage: any;
	public urlPrefix : String;
	public permissions = [];
  public imgPath:string=new CommonConfig().STATIC_IMAGE_URL+'course';
	public studentInfo:any;
	public courseId:string;
	public learningStatus:any=CommonConfig.LEARNING_PROCESS_STATUS;
	public dataArray : any;
	public searchText : any;
	public courseDetails: any;
	public categoryDetails : any=[];
  public courseStatus= false;
  public classSelected : any;
  public totalItems: number;
  public currentPage: number = 1;
  public itemsPerPage: number = 10;
  courseImgPath:string=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[0];
  public selectedCategory='category';
  public textSelected : any; 
  public categoryDetailsdata : any;
  public subCategories: any;
  public selectedSubcategory = [];

  constructor(
    private courseService: CourseService,
    private router: Router,
    private messageService: MessageService,
    private errorService: ErrorService,
    private authenticationService: AuthenticationService,
    private studentService: StudentService,
    private _vcr: ViewContainerRef,
    private facebookShareService: FacebookShareService,
    private categoryService: CategoryService
    ) { 

    // Initailze FacebookService method. 
    // this.facebookShareService.initFacebook();
  }

  ngOnInit() {
  	let role = this.authenticationService.userRole;
  	this.urlPrefix = role.toLowerCase();
  	this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.COURSES);
  	// this.getStudentDetails();
  	this.getAssignedCourses();
    this.getCategoriesAll();
    /*let userType = this.authenticationService.getUserType();
    if(role=== CommonConfig.USER_STUDENT && userType===AppConfig.STUDENT_TYPE[1]) {
      this.getAssignCourses(this.authenticationService.getUserId());
    }else {
      
    }*/
  }


   /* get all categories data*/
  getCategoriesAll() {
  	this.categoryService.categoryGet()
    .subscribe(res => {
      if(res.data){        
        this.categoryDetailsdata=res.data;
      }
    },
    (error) => {
      this.handleError(error);
    });
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
  getAssignedCourses(){
  	this.errorMessage='';
  	this.messageService.showLoader.emit(true);
  	this.studentService.getCourses('assignCoursesInfo_q2').subscribe((res: any) => {
  		this.messageService.showLoader.emit(false);
      this.courseDetails=res.data;
      this.courses = res.data;
      this.dataArray = res.data;
      this.afterSuccess(this.dataArray)
      this.getCategories(this.courseDetails);
    },error => {
      this.handleError(error);
    });
  }
 
  // Format assigned courses response data
  processResponse(data) {
    return data.filter(ele=> ele.course)
    .map(ele=>ele.course);
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
        this.errorMessage = error.json().msg;
        this.handleError(error);
      });

  }
   	//compare category for display
   	categoriesData(categoryData, studentCategory) {
   		this.categoryDetails= categoryData.filter(elem1 => studentCategory.some(elem2 => elem1._id == elem2));
   	}

   	/* display course*/
   	courseDisplay(coursesData: any){
   		this.dataArray = coursesData;
       this.afterSuccess(this.dataArray)
     }

	 // /* get courses on basis of category*/
	 // getCourseBasisCategory(categoryId){
	 // 	this.courses=this.courseDetails.filter(elem=> elem.category==categoryId);
	 // 	this.courseDisplay(this.courses);
	 // }

	 // /*load all data*/ 
	 // loadAllData(){
	 // 	this.courses=this.courseDetails;
	 // }
  
   /* get courses on basis of category*/
  getCourseBasisCategory(categoryId,textSelected){
  	this.textSelected=textSelected;
    this.getSubCategories(categoryId)

  }

  // Get SUbcategories on basis of category id
  getSubCategories(categoryId) {
    this.messageService.showLoader.emit(true);
    this.categoryService.getSubCategories(categoryId).subscribe(
      data => {
        this.messageService.showLoader.emit(false);
         this.subCategories =data;
         this.getSubcategory();
        this.totalItems= this.dataArray.length;
        this.paginationData();
      },
      error => {  
      let errorObj = error.json();
      this.handleError(error);
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;
        }
        });
  }

getSubcategory(){
	const subcategoryObj=[];
	this.courseDetails.map((obj)=>{
     subcategoryObj.push(obj.subcategory.name);
	});
	const subcategoryName = [];
$.each(subcategoryObj, function(i, el){
    if($.inArray(el,subcategoryName) === -1) subcategoryName.push(el);
});
  this.selectedSubcategory=subcategoryName;
}
   /*load all data*/ 
   loadAllData(){
     this.dataArray=this.courseDetails;
     this.afterSuccess(this.dataArray);
     document.getElementById(this.selectedCategory).classList.remove('active');
     document.getElementById('category').classList.add('active');
     this.selectedCategory='category';
   }

   onSearching(searchText){
     this.dataArray=this.courseDetails.filter(course => {
       searchText=searchText||'';
       return course.title.toLowerCase().includes(searchText.toLowerCase()) || course.shortDescription.toLowerCase().includes(searchText.toLowerCase());
     });
     this.afterSuccess(this.dataArray)
     this.classSelected='';
    this.textSelected='';
   }
    // getting all category 
  getCategory(searchText)
  {
  	 this.searchText='';
  	 this.dataArray=this.courseDetails.filter(course => {
       searchText=searchText||'';
       return course.title.toLowerCase().includes(searchText.toLowerCase()) || course.shortDescription.toLowerCase().includes(searchText.toLowerCase());
     });
     this.afterSuccess(this.dataArray)
     // this.textSelected=searchText;
  	this.classSelected=searchText;
  	//this.onSearching(searchText);
  }

   /* after response pagination call*/
   afterSuccess(data){
     this.totalItems=data.length;
     if(this.totalItems==0){
       this.courseStatus=true;
     }
     this.setPage(1);
     this.paginationData();
   }

// Handle error
handleError(error) {
  this.messageService.showLoader.emit(false);
  this.errorService.handleError(error, this._vcr);
}
//navigate course
navigateCourse(courseId:string, status:string) {
  if(status===this.learningStatus[1]) {
    this.router.navigate(['/',this.urlPrefix,'course-details',courseId,'play-contents']);
  }else {
    this.router.navigate(['/',this.urlPrefix,'course-details',courseId]);
  }
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
}
