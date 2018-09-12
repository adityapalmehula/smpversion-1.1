import { Component, OnInit,ViewContainerRef } from '@angular/core';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { ProgramService } from './../../../services/programs/program.service';

@Component({
  selector: 'app-program-preview',
  templateUrl: './program-preview.component.html',
  styleUrls: ['./program-preview.component.css'],
  providers : [ ProgramService, MessageService ]
})
export class ProgramPreviewComponent implements OnInit {
	public role: string="";
  public programId: any;
  public programData: any={};
  public coursesData : any = [];
  public projectsData : any = [];;
  public colors = ['#ba68c8','#7986cb','#81c784','#ffb74d','#e57373'];
  public errMessage: any;
  public projectData : any = [];
  public courseData : any = [];
  public dataDetails : any = [];
  public courseDescription : any = [];
  public projectDescription : any = [];
  public coursesDetails : any = [];
  public urlPrefix: String;

  constructor(
  	private authenticationService: AuthenticationService,
		private messageService: MessageService,
		private errorService: ErrorService,
		private programService: ProgramService,
		private _vcr : ViewContainerRef,
		private router: Router,
		private route: ActivatedRoute,
  	) { }

  ngOnInit() {
  	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  	this.role=this.authenticationService.userRole;
  	this.programId = this.route.snapshot.params['id'];
  	this.getProgram();
  	this.getProjectsAndCourses();
  }

  // get project by given id 
  getProjectsAndCourses()
  {
  	let item;
  this.messageService.showLoader.emit(true);
  	  this.programService.getProjectsAndCourses(this.programId).subscribe(res => {
  		this.messageService.showLoader.emit(false);
  		if(res.success) {
  			this.dataDetails=res.data[0].projectData;
        this.coursesDetails=res.data[0].courseData;
  			 
  		} else {
  			this.errMessage = res.msg
  		}
  	},error=> {
  	  this.handleError(error);
  		let errMsg = error.json();
  		this.errMessage = errMsg.msg
  	});
 
  }


  // get program by id 
  getProgram()
  {
      this.messageService.showLoader.emit(true);
  	  this.programService.getProgramData(this.programId).subscribe(res => {
  		this.messageService.showLoader.emit(false);
  		if(res.success) {
  			this.programData=res.data;
  			this.coursesData=this.programData.courseData;
  			this.projectsData=this.programData.projectData;
  		} else {
  			this.errMessage = res.msg
  		}
  	},error=> {
  	  this.handleError(error);
  		let errMsg = error.json();
  		this.errMessage = errMsg.msg
  	});
  }
  
// Rotate the arrow icon
  	rotate(id) {
  		document.getElementById(id).classList.toggle('rotate-down');
  		document.getElementById(id).classList.toggle('rotate-up');
  	}

 // Handle error
   handleError(error) {
   	this.messageService.showLoader.emit(false);
   	this.errorService.handleError(error, this._vcr);
   }

}
