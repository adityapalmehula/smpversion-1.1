import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ViewContainerRef} from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from './../../services/students/student.service';
import { SchoolService } from './../../services/schools/school.service';
import { AuthenticationService } from './../../services/common/authentication.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';
import { CommonConfig } from './../../config/common-config.constants';
import { SwitchConfig } from './../../config/switch-config.constants';
import { DaterangePickerComponent } from 'ng2-daterangepicker';

@Component({
	selector: 'app-students',
	templateUrl: './students.component.html',
	styleUrls: ['./students.component.css'],
	providers: [StudentService,SchoolService]
})
export class StudentsComponent implements OnInit {
	@ViewChild('close')close: ElementRef;
  @ViewChild(DaterangePickerComponent)
  private picker: DaterangePickerComponent;

  public role: string="";
  public urlPrefix: string="";
  public errorMessage: string="";
  public schools:any=[];
  public students: any;
  public classes:any=[];
  public dataArr: any;
  public stuDetails: any={};
  public permissions = [];
  CONFIG:any=CommonConfig;
  public selectedStudent : any = [];
  public configStatus = CommonConfig.CONTENT_STATUS.slice(0,3);
  SWITCH_CONFIG = SwitchConfig;

  daterange: any={};
  daterangeInput: any="";
  options:any;
  searchText: string;
  userId:string;
 /* 
  public selectedStudent: string="";
  public selectedClass: string="";
  public selectedSchoolId: string="";*/
  
  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 25;
  statusConfig:any;
  selectedStatus:any=[];
  statusList:any= [];
  selectAllCheckbox:boolean=false;
  public colors: any;

  constructor(
  	private studentService: StudentService,
  	private schoolService: SchoolService,
  	private messageService: MessageService,
    private errorService: ErrorService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private _vcr : ViewContainerRef,

    ) { }

  ngOnInit() {
  	this.role=this.authenticationService.userRole;
    this.userId= localStorage.getItem("userId");
    if(!this.userId) {
      this.router.navigate(['/']);
    }
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    if(this.role==CommonConfig.USER_ADMIN || this.role==CommonConfig.USER_INSTRUCTOR) {
      this.getSchools();
    }
    this.initializeStatusFilter();
    this.getStudents();
    this.colors = CommonConfig.colors;
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
  this.students = this.dataArr.slice(indexOfFirstItem, indexOfLastItem);
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
  this.fetchAllStudents(filter);
}

  //get all students
  fetchAllStudents(filter: any={}) {
    this.messageService.showLoader.emit(true);
    this.studentService.findAll(filter)
    .subscribe(response => { 
      this.messageService.showLoader.emit(false);
      if(response['data']){
        let data = response['data'];
        this.students=data;
        this.dataArr=data;
        this.classes=this.dataArr.map(ele=>ele.class);
        this.classes= Array.from(new Set(this.classes));
        this.totalItems=data.length;
        this.paginationData();
      } else {
      }
    },error=>{
      this.messageService.showLoader.emit(false);
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });
  }

  //fetch students login user role
  getStudents() {
  	if(this.role === CommonConfig.USER_SCHOOL) {
    	// let schId = this.authenticationService.getUserId();
    	/*this.getSchool((schoolId)=>{
    		this.getStudentsBySchoolCode(schoolId);
    	});*/
    } else {
    }
    this.applyFilter();
  }

/*  //get schools data for school id 
  getSchool(callback:(any)=> void) {
  	this.schoolService.getSchoolData().subscribe(
  		data=>{
  			if(data) {
  				callback(data.schoolId);
  			}
  		},error=>{
  			this.errorMessage=error.json().msg;
        this.handleError(error);
      });
    }*/

  //get all student based on school id
/*  getStudentsBySchoolCode(schoolId) {
    this.messageService.showLoader.emit(true);
    this.studentService.findBySchoolCode(schoolId).subscribe(
      data=>{ 
        this.messageService.showLoader.emit(false);
        this.dataArr=data;
        this.students=data;
        this.classes=this.dataArr.map(ele=>ele.class);
        this.classes= Array.from(new Set(this.classes));
        this.totalItems=data.length;
        this.paginationData();
      },error=>{
        this.messageService.showLoader.emit(false);
        this.errorMessage=error.json().msg;
        this.handleError(error);
      });
    }*/
/*
  applyStuFilter(){
    let id= this.selectedStudent;
    this.students=this.dataArr.filter(ele=>ele._id===id);
  }*/

  //class filter
  /*applyClassFilter() {
    let stuClass= this.selectedClass;
    this.students=this.dataArr.filter(ele=>ele.class === +stuClass);
  }*/

  //school filter
  /*applySchoolFilter() {
    let schoolId= this.selectedSchoolId;
    this.students=this.dataArr.filter(ele=>ele.schoolId === schoolId);
  }*/

   //delete student based on id
   delete(_id:string):void {
   	this.messageService.deleteConfirmation(()=>{
       this.messageService.showLoader.emit(true);
       this.studentService.deleteRecord(_id).subscribe(data=>{
         this.messageService.showLoader.emit(false);
         this.messageService.successMessage('Student', 'Successfully Deleted');
         this.getStudents();
       },(error:any)=> {
         this.messageService.showLoader.emit(false);
         this.errorMessage=error.json().msg;
         this.handleError(error);
       });
     })
   }

  //get all schools
  getSchools() {
    this.messageService.showLoader.emit(true);
    this.schoolService.getSchools().subscribe(
      response=>{ 
        this.messageService.showLoader.emit(false);
        if(response['success'] && response['data']) {
          this.schools=response['data'];
        }
      },error=>{
        this.messageService.showLoader.emit(false);
        this.errorMessage=error.json().msg;
        this.handleError(error);
      });
  }

//get student data based on id
getStudentDetails(id:string) {
	this.stuDetails=this.students.find(ele=>ele._id === id);
	if(this.role!==CommonConfig.USER_SCHOOL) {
		let school=this.schools.find(sch=>sch['schoolId'] == this.stuDetails['schoolId']);
		this.stuDetails['schoolName']=school.schoolName;
	}
}

/* select student on click studentcheckbox*/
selectStudent(e,studentInfo) {
  if(e.target.checked && !this.selectedStudent.includes(studentInfo._id)) this.selectedStudent.push(studentInfo._id);
  else if(this.selectedStudent.includes(studentInfo._id))  this.selectedStudent.splice(this.selectedStudent.indexOf(studentInfo._id),1);
}

/* select all student on all click checkbox */
selectAllStudent(e){
  if(e.target.checked){
    this.selectedStudent=[];
    this.students.map((students)=>{
      students.selected = e.target.checked;
      this.selectedStudent.push(students._id) 
    });
  } else {
    this.doAllUncheck(e.target.checked);
  }
}


/* do uncheck all checkbox*/
doAllUncheck(status) {
  this.students.map((students)=>{
    students.selected = status;
  });
  this.selectedStudent=[];
}

/* Set status of students*/
setStatus(e){
  if(!e.target.value){
    return this.messageService.showErrorToast(this._vcr,"Please select status");
  } 
  if(this.selectedStudent.length>0){
    let status= e.target.value;
    let studentObject= {
      students: this.selectedStudent,
      updateDetails: {
        status: status
      }
    };
    this.updateStudentActivityStatus(studentObject);
  } else {
    e.target.value="";
    return this.messageService.showErrorToast(this._vcr,"Select any one student");
  }
}

//update student activity status
updateStudentActivityStatus(studentsDetails: any) {
  this.studentService.changeStatus(studentsDetails)
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

//update flock join status
updateFlockJoinStatus() {
  if(this.selectedStudent.length>0){
    let studentsDetails= {
      students:this.selectedStudent,
      updateDetails: {
        isFlockJoined: true
      }
    };
    this.updateStudentActivityStatus(studentsDetails);
  } else {
    return this.messageService.showErrorToast(this._vcr,"Select any one student");
  }
}
  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }

//send welcome mail
sendWelcomeMail(student:any) {
  this.messageService.confirmation(`Send mail to '${student.email}'`,'Send Mail',()=> {
    this.messageService.showLoader.emit(true);
    this.authenticationService.sendWelcomeMail({id: student._id,role: CommonConfig.USER_STUDENT})
    .subscribe(response => {
      this.messageService.showLoader.emit(false);
      if(response['msg']) {
        student.isMailSend=true;
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
  this.close.nativeElement.click();
}

}


