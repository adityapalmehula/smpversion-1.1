import { Component, OnInit, ViewChild,ElementRef, OnDestroy, ViewContainerRef} from '@angular/core';
import { Router } from '@angular/router';
import { ReleaseCourseService } from './../../../services/courses/release-course.service';
import { MessageService } from './../../../services/common/message.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { MessageConfig } from './../../../config/message-config.constants';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { StudentService } from './../../../services/students/student.service';
import { ErrorService } from './../../../services/common/error.service';
import { AppConfig } from './../../../config/app-config.constants';
import { FacebookShareService } from './../../../services/common/facebookshare.service';
import { CategoryService } from './../../../services/categories/category.service';
import { SwitchConfig } from './../../../config/switch-config.constants'

@Component({
	selector: 'app-all-courses',
	templateUrl: './all-courses.component.html',
	styleUrls: ['./all-courses.component.css'],
	providers : [ ReleaseCourseService, StudentService, FacebookShareService, CategoryService ]
})

export class AllCoursesComponent implements OnInit {
	@ViewChild('close')close: ElementRef;
	public currentApp = SwitchConfig.APP;
	public apps = SwitchConfig.APPS;
	public courses : any ;
	public coursesList : any ;
	public errorMessage: any;
	public urlPrefix : String;
	public permissions = [];
	public assignCourses:any=[];
  public imgPath:string=new CommonConfig().STATIC_IMAGE_URL+'course';
	public courseId:string;
	public learningStatus:any=CommonConfig.LEARNING_PROCESS_STATUS;
	public searchText : any;
	public categories : any = [];
	public categoriesList : any = [];
	public categoriesConfig : any;
	public selectedCategories : any = [];
	courseImgPath:string=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[0];
	public categoriesData : any;
	public categoryDetails: any;
	public selectedCategory='category';
  public courseStatus=false;
  public subCategories: any;
  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 12;
  public dataArray : any;
  public textSelected : any;
  public classSelected : any;
  public classSelectedType : boolean;
  public showOption: boolean;

  constructor(
    private releaseCourseService: ReleaseCourseService,
    private router: Router,
    private messageService: MessageService,
    private errorService: ErrorService,
    private authenticationService: AuthenticationService,
    private studentService: StudentService,
    private _vcr : ViewContainerRef,
    private facebookShareService: FacebookShareService,
    private categoryService: CategoryService,
    ) { 
    // Initailze FacebookService method. 
    this.facebookShareService.initFacebook();
  }

  ngOnInit() {
  	let role = this.authenticationService.userRole;
  	this.urlPrefix = role.toLowerCase();
  	this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.COURSES);
  	this.getStudentDetails();
  	// this.fetchCourses();
  	this.configDropDown();
  	this.getCategories();
  }

  // Multiselect configuraton
  configDropDown() {
  	this.categoriesConfig = { 
  		singleSelection: false, 
  		text:"Select Categories",
  		selectAllText:'Select All',
  		unSelectAllText:'UnSelect All',
  		enableSearchFilter: true,
  	}; 
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


  /*
  * Categories drop down on change event for Select/ Deselect
  */
  onCategoriesChange(event) {
  	if(this.selectedCategories.length > 0) {
  		this.courses = [];
  		this.selectedCategories.forEach(t=> {
  			let tempCourseArr = this.coursesList.filter(s=> s.category==t.id);
  			if(tempCourseArr) {
  				this.courses= this.courses.concat(tempCourseArr);
  			}
  		});
  	} else {
  		this.courses = this.coursesList;
  	}
  }

  /*
  * Categories drop down on change event for Select All/ Deselect All
  */
  onAllCategoriesChange(event) {
  	this.courses = this.coursesList;
  }
  getStudentDetails() {
  	this.studentService.getCourses('assignCoursesInfo').subscribe(response=> {
  		if(response['data']) {
  			this.assignCourses=response['data'];
        this.fetchCourses();
      } 
    },error=>{
      this.handleError(error);
    });
  }
  //fetch courses
  fetchCourses(){
  	this.errorMessage='';
  	this.messageService.showLoader.emit(true);
  	this.releaseCourseService.getReleaseCourses('courseInfo').subscribe((res: any) => {
  		this.messageService.showLoader.emit(false);
      this.assignCourses.forEach(elem=> {
        let found = res.data.find(element=>{
          if (elem.courseId === element.courseId) {
            element['isAssigned'] = true;
            return element;
          }
        });
      });
      this.courses = res.data;
      this.coursesList=res.data;
      this.dataArray = res.data;
      this.afterSuccess(this.dataArray)
      this.totalItems=this.dataArray.length;
      this.setPage(1);
      this.paginationData();
    },error => {
      this.handleError(error);
    });
  }

  /* get all categories data*/
  getCategories() {
  	this.categoryService.categoryGet()
    .subscribe(res => {
      if(res.data){        
        this.categoryDetails=res.data;
      }
    },
    (error) => {
      this.handleError(error);
    });
  }

  /* get courses on basis of category*/
  getCourseBasisCategory(categoryId,textSelected){
  	this.searchText='';
  	this.textSelected=textSelected;
    this.dataArray=this.coursesList.filter(elem=> elem.category_id==categoryId);
    this.getSubCategories(categoryId)
    this.afterSuccess(this.dataArray)
    // document.getElementById(this.selectedCategory).classList.remove('active');
   // document.getElementById(categoryId).classList.add('active');
    this.selectedCategory=categoryId;
  }

  // Get SUbcategories on basis of category id
  getSubCategories(categoryId) {
    this.messageService.showLoader.emit(true);
    this.categoryService.getSubCategories(categoryId).subscribe(
      data => {
        this.messageService.showLoader.emit(false);
         this.subCategories =data;
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

  /*load all data*/ 
  loadAllData(){
  	this.dataArray=this.coursesList;
    this.afterSuccess(this.dataArray)
    document.getElementById(this.selectedCategory).classList.remove('active');
    document.getElementById('category').classList.add('active');
    this.selectedCategory='category';
  }

  onSearching(searchText){
    this.dataArray=this.coursesList.filter((course)=>{
      searchText=searchText||'';
      if(course) {
        return course.title.toLowerCase().includes(searchText.toLowerCase()) || course.shortDescription.toLowerCase().includes(searchText.toLowerCase());
        
      }
    });
    this.afterSuccess(this.dataArray)
    this.classSelected='';
    this.textSelected='';
    //this.courseStatus=false;
  }

 // getting all category 
  getCategory(searchText)
  {
  	this.searchText='';
  	this.classSelected=searchText;
  	this.dataArray=this.coursesList.filter((course)=>{
      searchText=searchText||'';
      if(course) {
        return course.title.toLowerCase().includes(searchText.toLowerCase()) || course.shortDescription.toLowerCase().includes(searchText.toLowerCase());        
      }
    });
    this.afterSuccess(this.dataArray)
     this.courseStatus=false;
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

}