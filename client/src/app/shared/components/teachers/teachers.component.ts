import { Component, OnInit, OnDestroy,ViewChild,ElementRef, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherService } from './../../services/teachers/teacher.service';
import { AuthenticationService } from './../../services/common/authentication.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';
import { CommonConfig } from './../../config/common-config.constants';
import { SwitchConfig } from './../../config/switch-config.constants';
import { DaterangePickerComponent } from 'ng2-daterangepicker';
import { CategoryService } from './../../services/categories/category.service';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css'],
  providers: [TeacherService,CategoryService]
})

export class TeachersComponent implements OnInit {
  @ViewChild('close')close: ElementRef;
  @ViewChild('closeModal')closeModal: ElementRef;
  @ViewChild(DaterangePickerComponent)
  private picker: DaterangePickerComponent;
  public role: string="";
  public dataArr: any;
  public permissions = [];
  public selectedTeacher : any = [];
  public configStatus = CommonConfig.CONTENT_STATUS.slice(0,3);
  public errorMessage: string="";
  public urlPrefix: string="";
  public teachers:any=[];
  public teacherDetails: any={};
  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 8;
  SWITCH_CONFIG = SwitchConfig;
  daterange: any={};
  daterangeInput: any="";
  options:any;
  searchText: string;
  statusConfig:any;
  selectedStatus:any=[];
  statusList:any= [];
  selectAllCheckbox:boolean=false;
  
  categoriesConfig:any;
  categories:any= [];
  selectedCategories:any=[];

  subCategoriesConfig:any;
  subCategories:any= [];
  selectedSubCategories:any=[];
  subCategoriesMaster:any=[];
  teacherId:string;

  constructor(
    private teacherService: TeacherService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService: AuthenticationService,
    private categoryService: CategoryService,
    private router: Router
    ) { }

  ngOnInit() {
    this.role=this.authenticationService.userRole;
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.TEACHERS);
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.initializeStatusFilter();
    this.applyFilter();
    this.getCatSubCatData();
  }

  //initialte status filter configrations
  initializeStatusFilter() {
    this.options= {
      locale: { format: 'DD-MM-YYYY' },
      alwaysShowCalendars: false,
    };
    this.statusConfig = { 
      singleSelection: false, 
      text:"Select Status",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
    };
    this.categoriesConfig = { 
      singleSelection: false, 
      text:"Select board",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
    }; 
    this.subCategoriesConfig = { 
      singleSelection: false, 
      text:"Select classes",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 6,
    };
    this.statusList=CommonConfig.CONTENT_STATUS.slice(0,3).map(s=> {return {id: s,itemName: s}})
    this.selectedStatus=[this.statusList[0]];
  }

  //get category and sub category
  getCatSubCatData() {
    this.messageService.showLoader.emit(true);
    this.categoryService.getCategoriesAndSubCategories()
    .subscribe(response=> { 
      this.messageService.showLoader.emit(false);
      if(response['data'] && response['data'].categories && response['data'].subCategories) {
        this.categories = response['data'].categories.map(ele=> ({id: ele._id,itemName: ele.name}));
        this.subCategoriesMaster = response['data'].subCategories.map(ele=> ({id: ele._id,itemName: ele.name, categoryId: ele.categoryId}));
      }
    },error=>{
      this.handleError(error);
    });
  }

  //on category filer change
  onCategoriesFilterChange(categoryId:any) {
    this.subCategories=[]
    this.selectedCategories.forEach(cat=> {
      let subCategories= this.subCategoriesMaster.filter(s=> s.categoryId==cat.id);
      if(subCategories) {
        this.subCategories= this.subCategories.concat(subCategories);
      }
    });

  }
  //on category deselect all
  onCategoryDeSelectAll($event:any) {
    this.selectedSubCategories=[];
  }

  //set teacher id
  setTeacherId(id: string) {
    this.teacherId=id;
  }
  
  //assign class
  assignClass() {
    if(this.selectedSubCategories.length) {
      this.messageService.showLoader.emit(true);
      let classes= this.selectedSubCategories.map(ele=>ele.id);
      this.teacherService.assignClasses(this.teacherId,{classes})
      .subscribe(response=>{ 
        this.messageService.showLoader.emit(false);
        if(response['success']) {
          this.messageService.showSuccessToast(this._vcr,'Assign class successfully');
          this.clearAssignClassFilters();
          this.closeModal.nativeElement.click();
        }
      },error=>{
        this.handleError(error);
      });
    }
  }

  //clear assign class filters
  clearAssignClassFilters() {
    this.selectedCategories=[];
    this.subCategories=[];
    this.selectedSubCategories=[];
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
    this.teachers = this.dataArr.slice(indexOfFirstItem, indexOfLastItem);
  }
  /*pagination logic end here*/
//apply filter
applyFilter() {
  let filter={};
  if(this.daterange) {
    if(this.daterange['start']){
      filter['startDate']=this.daterange['start'];
    }
    if(this.daterange['end']){
      filter['endDate']=this.daterange['end'];
    }
  }
  if(this.selectedStatus.length) {
    filter['status']=this.selectedStatus.map(s=>s.id);
  }
  if(this.searchText) {
    filter['full_text_search']=this.searchText;
  }
  this.currentPage=1;
  debugger
  this.getTeachers(filter);
}
  //delete teacher based on id
  delete(_id:string):void {
    this.messageService.deleteConfirmation(()=>{
      this.messageService.showLoader.emit(true);
      this.teacherService.deleteTeacher(_id)
      .subscribe(data=>{
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('teacher', 'Successfully Deleted');
        this.getTeachers();
      },(error:any)=>{
        this.errorMessage=error.json().msg;
        this.handleError(error);
      });
    })
  }

 //get teacher data based on id
 getTeacherDetails(id:string,i:number) {
   this.teacherDetails=this.teachers.find(ele=>ele._id === id);
   this.teacherDetails['index']=i;
 }

//get all teachers
getTeachers(filter: any={}) {
  this.messageService.showLoader.emit(true);
  this.teacherService.getTeachers(filter)
  .subscribe(response=>{ 
    this.messageService.showLoader.emit(false);
    if(response['success'] && response['data']) {
      this.teachers=response['data'];
      this.dataArr=response['data'];;
      this.totalItems=response['data'].length;
      this.paginationData();
    }
  },error=>{
    this.errorMessage=error.json().msg;
    this.handleError(error);
  });
}

//redirect to teacher website
redirectToWebsite(url: string){
  if(!url.startsWith('http')) {
    url='https://'+url;
  }
  window.open(url, "_blank");
}


/* select student on click studentcheckbox*/
selectTeacher(e,teacherInfo) {
  if(e.target.checked && !this.selectedTeacher.includes(teacherInfo._id)) this.selectedTeacher.push(teacherInfo._id);
  else if(this.selectedTeacher.includes(teacherInfo._id))  this.selectedTeacher.splice(this.selectedTeacher.indexOf(teacherInfo._id),1);
}

/* select all student on all click checkbox */
selectAllTeacher(e){
  if(e.target.checked){
    this.selectedTeacher=[];
    this.teachers.map((teacher)=>{
      teacher.selected = e.target.checked;
      this.selectedTeacher.push(teacher._id) 
    });
  } else {
    this.doAllUncheck(e.target.checked);
  }
}


/* do uncheck all checkbox*/
doAllUncheck(status) {
  this.teachers.map((teachers)=>{
    teachers.selected = status;
  });
  this.selectedTeacher=[];
}

/* Set status of teachers*/
setStatus(e){
  if(!e.target.value){
    return this.messageService.showErrorToast(this._vcr,"Please select status");
  } 
  if(this.selectedTeacher.length>0){
    let status= e.target.value;
    let teacher= {
      users: this.selectedTeacher,
      role: CommonConfig.USER_TEACHER,
      updateDetails: {
        status: status
      }
    };
    this.updateTeacherActivityStatus(teacher);
  } else {
    e.target.value="";
    return this.messageService.showErrorToast(this._vcr,"Select any one teacher");
  }
}

//update teacher activity status
updateTeacherActivityStatus(teachersDetails: any) {
  this.authenticationService.updateStatus(teachersDetails)
  .subscribe(response => {
    this.doAllUncheck(false);
    this.selectAllCheckbox=false;
    this.applyFilter();
    return this.messageService.showSuccessToast(this._vcr,response.msg);
  }, error=>{
    this.errorMessage=error.json().msg;
    this.handleError(error);
  })
}


//send welcome mail
sendWelcomeMail(teacher:any) {
  this.messageService.confirmation(`Send mail to '${teacher.email}'`,'Send Mail',()=> {
    this.messageService.showLoader.emit(true);
    this.authenticationService.sendWelcomeMail({id: teacher._id, role: CommonConfig.USER_TEACHER})
    .subscribe(response => {
      this.messageService.showLoader.emit(false);
      if(response['msg']) {
        teacher.isMailSend=true;
        this.messageService.showSuccessToast(this._vcr,response.msg)
      }
    },error=>{
      this.messageService.showLoader.emit(false);
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });
  });
}

/*
* date filter on change event
*/
selectedDate(value: any, datepicker?: any) {
  this.daterange['start'] = new Date(value.start).toISOString();
  this.daterange['end'] = new Date(value.end).toISOString();
  this.applyFilter();
}

//on status filter changes
onStatusChange(event:any) {
  this.applyFilter();
}

//search user
searchUser(event:any) {
  if(event && event.key === "Enter") {
    this.applyFilter();
  }
}

//on search key change
searchInputChange() {
  if(this.searchText.length==0) {
    this.applyFilter();
  }
}

//clear search input
clearSearch() {
  if(this.searchText) {
    this.searchText='';
    this.applyFilter();
  }
}

//clear search input
clearDateFilter() {
  if(Object.keys(this.daterange).length ) {
    this.picker.datePicker.setStartDate(new Date());
    this.picker.datePicker.setEndDate(new Date());
    this.daterange={};
    this.applyFilter();
  }
}

//called on component destroy 
ngOnDestroy(){
  if(this.close) {
    this.close.nativeElement.click();
  }
}

// Handle error
handleError(error) {
  this.messageService.showLoader.emit(false);
  this.errorService.handleError(error, this._vcr);
}

}
