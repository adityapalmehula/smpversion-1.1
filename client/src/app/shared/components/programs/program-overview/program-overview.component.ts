import { Component, OnInit , ViewChild, Inject, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from './../../../services/common/message.service';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { ProgramService } from './../../../services/programs/program.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';

@Component({
  selector: 'app-program-overview',
  templateUrl: './program-overview.component.html',
  styleUrls: ['./program-overview.component.css'],
  providers : [ ProgramService, MessageService ]
})
export class ProgramOverviewComponent implements OnInit {
	public errorMessage: any;
  public programId:any
  public totalItems: number = 0;
  public programs : any ;
  public urlPrefix : String;
  public errMessage: any;
  public more: boolean = true;
  public less: boolean = false;
  public lessPrograms : any;
  public AllPrograms : any;

  constructor(
  	private router : Router,
    private messageService : MessageService,
    private programService: ProgramService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService : AuthenticationService,
    ) { }

  ngOnInit() {
  	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.fetchPrograms();
  }

// getting all programs from db
  fetchPrograms()
  {
  	
  	this.messageService.showLoader.emit(true);
    this.programService.fetchPrograms().subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.programs = res.data;
      this.lessPrograms=this.programs.slice(0,3);
      this.AllPrograms=this.AllPrograms.slice(3, this.programs.length);
    },  error => {
      this.handleError(error);
      let errMsg = error.json();
      this.errMessage = errMsg.msg
    });
  }

// see less and more data show
seeMore(){
  this.more=false;
  this.less=true;
}
seeLess(){
  this.more=true;
  this.less=false;
}

   // Handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 }

}
