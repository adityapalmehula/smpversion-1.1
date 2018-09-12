import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from './../../services/common/authentication.service';
import { CommonConfig } from './../../config/common-config.constants';
import { InstructorService } from './../../services/instructors/instructors.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';


@Component({
	selector: 'app-instructor',
	templateUrl: './instructor.component.html',
	styleUrls: ['./instructor.component.css'],
	providers:[InstructorService]
})
export class InstructorComponent implements OnInit {
	public role: string="";
	public urlPrefix: string="";
	public permissions = [];
	public errorMessage : any;
	public instructors: any;
	constructor(
		private authenticationService: AuthenticationService,
		private instructorService : InstructorService,
		private messageService : MessageService,
		private errorService: ErrorService,
		private _vcr: ViewContainerRef

		) { }

	ngOnInit() {
		this.role=this.authenticationService.userRole;
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.getAllInstructor();
	}


	/* get all instructor request*/
	getAllInstructor(){
		this.instructorService.findAll().subscribe((response)=>{
			this.instructors=response;
		},error=>{
			this.errorMessage=error.json().msg;
			this.handleError(error);
		})
	}

	// Handle error
handleError(error) {
  this.errorService.handleError(error, this._vcr);
}

/* delete request of instructor on basis of id*/
	delete(insId){
		this.messageService.deleteConfirmation(()=>{
    this.messageService.showLoader.emit(true);
		this.instructorService.deleteInstructor(insId).subscribe((response)=>{
			this.messageService.showLoader.emit(false);
			this.messageService.successMessage('Course', response.msg);
			this.getAllInstructor();
		},(error:any)=>{
        this.errorMessage=error.json().msg;
        this.handleError(error);
      });
		})
	}

}
