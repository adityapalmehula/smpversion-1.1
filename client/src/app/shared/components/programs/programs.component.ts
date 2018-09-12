import { Component, OnInit, ViewChild, Inject, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup,FormBuilder,Validators} from '@angular/forms'
import { MessageService } from './../../services/common/message.service';
import { AuthenticationService } from './../../services/common/authentication.service';
import { ProgramService } from './../../services/programs/program.service';
import { ErrorService } from './../../services/common/error.service';
import { CommonConfig } from './../../config/common-config.constants';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css'],
  providers : [ ProgramService, MessageService ]
})
export class ProgramsComponent implements OnInit {
   @ViewChild('closeModal') closeModal

	programStatusFrom: FormGroup;
  private fb: FormBuilder;
  userId:string;
  role:string;
  public errorMessage: any;
  public programId:any
  public totalItems: number = 0;
  public programs : any ;
  public urlPrefix : String;
  public dataArray : any;
  CONFIG=CommonConfig;
  public errMessage: any;
  imgPath="./../../../../../assets/images/projects";
  programActionStatus:any=[];
  status:string="";

  constructor(
  	@Inject(FormBuilder)fb:FormBuilder,
    private router : Router,
    private messageService : MessageService,
    private programService: ProgramService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService : AuthenticationService,
    ) { 
  this.fb=fb;
  this.initializeForm();
  }
  //intialize form
  initializeForm() {
      this.programStatusFrom=this.fb.group({
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
  this.fetchPrograms();
  }

  // getting all programs from db
  fetchPrograms()
  {
  	this.messageService.showLoader.emit(true);
    this.programService.fetchPrograms().subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.programs = res.data;
      this.dataArray = res.data;
      this.totalItems= this.dataArray.length;
      this.paginationData();
    },  error => {
      this.handleError(error);
      let errMsg = error.json();
      this.errMessage = errMsg.msg
    });
  }

// set course action type based on role
setActionType(program) {
  this.initializeForm();
  this.programId=program._id;
if(this.role == CommonConfig.USER_ADMIN) {
  if (program.status === CommonConfig.CONTENT_STATUS[3]) {
    this.programActionStatus=[
    {'key': "Submit For Review", val: CommonConfig.CONTENT_STATUS[4] }
    ];
  } else if (program.status === CommonConfig.CONTENT_STATUS[4]) {
    this.programActionStatus=[
    {'key': CommonConfig.CONTENT_STATUS[0], val: CommonConfig.CONTENT_STATUS[0] }, 
    {'key': CommonConfig.CONTENT_STATUS[1], val: CommonConfig.CONTENT_STATUS[1] }, 
    {'key': CommonConfig.CONTENT_STATUS[2], val: CommonConfig.CONTENT_STATUS[2] }, 
    {'key': CommonConfig.CONTENT_STATUS[5], val: CommonConfig.CONTENT_STATUS[5] },
    {'key': CommonConfig.CONTENT_STATUS[3], val: CommonConfig.CONTENT_STATUS[3] }, 
    ];
  } else {
    this.programActionStatus=[
    {'key': CommonConfig.CONTENT_STATUS[0], val: CommonConfig.CONTENT_STATUS[0] }, 
    {'key': CommonConfig.CONTENT_STATUS[1], val: CommonConfig.CONTENT_STATUS[1] }, 
    {'key': CommonConfig.CONTENT_STATUS[2], val: CommonConfig.CONTENT_STATUS[2] }, 
    {'key': CommonConfig.CONTENT_STATUS[3], val: CommonConfig.CONTENT_STATUS[3] }, 
    ];
  }

}else {
  this.programActionStatus=[{'key': "Submit For Review", val: CommonConfig.CONTENT_STATUS[4] }]
  this.programStatusFrom.get('status').setValue(CommonConfig.CONTENT_STATUS[4]);
  this.programStatusFrom.get('status').disable();
}

}

// update the program id here -- 
submitProgramStatus() {
  if(this.programId) {
    let statusDetails={
      statusTo: this.programStatusFrom.get('status').value,
      message: this.programStatusFrom.get('message').value,
    }
    let idx=this.programs.findIndex(program=> program._id==this.programId);
    if(idx > -1) {
      if(this.programs[idx].status===statusDetails.statusTo) {
        let status=this.programActionStatus.find(sts=> sts.val==statusDetails.statusTo);
        return this.messageService.showErrorToast(this._vcr,`Program already ${status.key} !`);
      }
    }

    this.messageService.showLoader.emit(true);
    this.programService.updateProgramStatus(this.programId,statusDetails).subscribe((res: any)=> {
      this.messageService.showLoader.emit(false);
      if(res['isInvalid']) {
        this.closeModal.nativeElement.click();
      //  return this.router.navigate(['/',this.urlPrefix,'projects',this.projectId,'validate-project']);
      }
      if(res['data'] && res['data'].updatedStatus) {
        
          this.programs[idx].status=res['data'].updatedStatus;
     
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


// Delete Program by id
  deleteProgram(programId:any){
  	this.messageService.deleteConfirmation(()=>{
  		this.messageService.showLoader.emit(true);
  		return this.programService.deleteProgram(programId).subscribe(data=>	{ 
        
  			if(data['success'])
  			{
  				this.messageService.showLoader.emit(false);
  				this.fetchPrograms();
  				this.messageService.successMessage('Program', 'Successfully Deleted');
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

  // adding pagination on page
   paginationData() {
    // const indexOfLastItem = this.currentPage * this.itemsPerPage;
    // const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
    // this.projects = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
  }


  // Handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 }

}
