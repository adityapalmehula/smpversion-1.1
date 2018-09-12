import { Component, OnInit,ViewContainerRef } from '@angular/core';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { ProjectService } from './../../../services/projects/project.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-preview-project',
	templateUrl: './project-preview.component.html',
	styleUrls: ['./project-preview.component.css'],
	providers:[ProjectService]
})
export class ProjectPreviewComponent implements OnInit {
	public role: string="";
	public urlPrefix: string="";
	public permissions = [];
	public projectId: any;
	public errMessage: any;
	public projectData: any={};
	public colors = ['#ba68c8','#7986cb','#81c784','#ffb74d','#e57373'];
	public epicsDetails : any = [];
	public stories : any =[];
  public studentTasks : any =[];

	constructor(
		private authenticationService: AuthenticationService,
		private projectService: ProjectService,
		private messageService: MessageService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef,
		private router: Router,
		private route: ActivatedRoute,
		) { }

	ngOnInit() {
		this.role=this.authenticationService.userRole;
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.projectId = this.route.snapshot.params['id'];
		this.getProject();
	}


  // Get project on basis of projectId
  getProject() {
  	this.messageService.showLoader.emit(true);
  	this.projectService.getProjectData(this.projectId).subscribe(res => {
  		this.messageService.showLoader.emit(false);
  		if(res.success) {
  			this.projectData=res.data;
  			this.epicsDetails=this.projectData.epics;
  			this.stories=this.projectData.stories;
         this.studentTasks=this.projectData.stories.tasks;
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
    // Rotate the arrow icon for task
    subproject(id) {
      if(document.getElementById(id)) {
      document.getElementById(id).classList.toggle('rotate-up');
      document.getElementById(id).classList.toggle('rotate-down');
       } 
    }

   // Handle error
   handleError(error) {
   	this.messageService.showLoader.emit(false);
   	this.errorService.handleError(error, this._vcr);
   }
}