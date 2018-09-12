import { Component, OnInit, OnDestroy,ViewChild,ElementRef, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolService } from './../../services/schools/school.service';
import { AuthenticationService } from './../../services/common/authentication.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';
import { CommonConfig } from './../../config/common-config.constants';
import { SwitchConfig } from './../../config/switch-config.constants';
import { DaterangePickerComponent } from 'ng2-daterangepicker';

@Component({
  selector: 'app-schools',
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.css'],
  providers: [SchoolService]
})

export class SchoolsComponent implements OnInit,OnDestroy {
  @ViewChild('close')close: ElementRef;
  @ViewChild(DaterangePickerComponent)
  private picker: DaterangePickerComponent;

  public role: string="";
  public dataArr: any;
  public permissions = [];
  public selectedSchool : any = [];
  public configStatus = CommonConfig.CONTENT_STATUS.slice(0,3);
  public errorMessage: string="";
  public urlPrefix: string="";
  public schools:any=[];
  public schDetails: any={};
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

  constructor(
    private schoolService: SchoolService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService: AuthenticationService,
    private router: Router
    ) { }

  ngOnInit() {
    this.role=this.authenticationService.userRole;
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.SCHOOLS);
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.initializeStatusFilter();
    this.applyFilter();
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
    this.statusList=CommonConfig.CONTENT_STATUS.slice(0,3).map(s=> {return {id: s,itemName: s}})
    this.selectedStatus=[this.statusList[0]];
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
    this.schools = this.dataArr.slice(indexOfFirstItem, indexOfLastItem);
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
  this.getSchools(filter);
  }
  //delete school based on id
  delete(_id:string):void {
    this.messageService.deleteConfirmation(()=>{
      this.messageService.showLoader.emit(true);
      this.schoolService.deleteSchool(_id)
      .subscribe(data=>{
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('School', 'Successfully Deleted');
        this.getSchools();
      },(error:any)=>{
        this.errorMessage=error.json().msg;
        this.handleError(error);
      });
    })
  }

 //get school data based on id
 getSchoolDetails(id:string,i:number) {
   this.schDetails=this.schools.find(ele=>ele._id === id);
   this.schDetails['index']=i;
 }

//get all schools
getSchools(filter: any={}) {
  this.messageService.showLoader.emit(true);
  this.schoolService.getSchools(filter)
  .subscribe(response=>{ 
    this.messageService.showLoader.emit(false);
    if(response['success'] && response['data']) {
      this.schools=response['data'];
      this.dataArr=response['data'];;
      this.totalItems=response['data'].length;
      this.paginationData();
    }
  },error=>{
    this.errorMessage=error.json().msg;
    this.handleError(error);
  });
}

//redirect to school website
redirectToWebsite(url: string){
  if(!url.startsWith('http')) {
    url='https://'+url;
  }
  window.open(url, "_blank");
}


/* select student on click studentcheckbox*/
selectSchool(e,schoolInfo) {
  if(e.target.checked && !this.selectedSchool.includes(schoolInfo._id)) this.selectedSchool.push(schoolInfo._id);
  else if(this.selectedSchool.includes(schoolInfo._id))  this.selectedSchool.splice(this.selectedSchool.indexOf(schoolInfo._id),1);
}

/* select all student on all click checkbox */
selectAllSchool(e){
  if(e.target.checked){
    this.selectedSchool=[];
    this.schools.map((school)=>{
      school.selected = e.target.checked;
      this.selectedSchool.push(school._id) 
    });
  } else {
    this.doAllUncheck(e.target.checked);
  }
}


/* do uncheck all checkbox*/
doAllUncheck(status) {
  this.schools.map((schools)=>{
    schools.selected = status;
  });
  this.selectedSchool=[];
}

/* Set status of schools*/
setStatus(e){
  if(!e.target.value){
    return this.messageService.showErrorToast(this._vcr,"Please select status");
  } 
  if(this.selectedSchool.length>0){
    let status= e.target.value;
    let school= {
      users: this.selectedSchool,
      role: CommonConfig.USER_SCHOOL,
      updateDetails: {
        status: status
      }
    };
    this.updateSchoolActivityStatus(school);
  } else {
    e.target.value="";
    return this.messageService.showErrorToast(this._vcr,"Select any one school");
  }
}

//update school activity status
updateSchoolActivityStatus(schoolsDetails: any) {
  this.authenticationService.updateStatus(schoolsDetails)
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
sendWelcomeMail(school:any) {
  this.messageService.confirmation(`Send mail to '${school.email}'`,'Send Mail',()=> {
    this.messageService.showLoader.emit(true);
    this.authenticationService.sendWelcomeMail({id: school._id,role: CommonConfig.USER_SCHOOL})
    .subscribe(response => {
      this.messageService.showLoader.emit(false);
      if(response['msg']) {
        school.isMailSend=true;
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
  this.daterange['start']=new Date(value.start).toISOString();
  this.daterange['end']=new Date(value.end).toISOString();
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
