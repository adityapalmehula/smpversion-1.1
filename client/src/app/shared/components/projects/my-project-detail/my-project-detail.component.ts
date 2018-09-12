import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { ProjectService } from './../../../services/projects/project.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-project-detail',
  templateUrl: './my-project-detail.component.html',
  styleUrls: ['./my-project-detail.component.css'],
	providers: [ProjectService]

})
export class MyProjectDetailComponent implements OnInit {
	public role: string="";
	public urlPrefix: string="";
	public permissions = [];
	public projectId: any;
	public errMessage: any;
	public projectData: any={};
	public colors = ['#ba68c8','#7986cb','#81c784','#ffb74d','#e57373'];
	public epicsDetails : any = [];
	public stories : any =[];
  public showValidationError:boolean=true;
  constructor(
  	private authenticationService: AuthenticationService,
		private projectService: ProjectService,
		private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
		private router: Router,
		private route: ActivatedRoute
		) { }

  ngOnInit() {
  	this.role=this.authenticationService.userRole;
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.projectId = this.route.snapshot.params['projectId'];
		this.getProject();
  }

  
  // Get project on basis of projectId
  getProject() {
  	this.messageService.showLoader.emit(true);
  	this.projectService.getProjectData(this.projectId).subscribe(res => {
  			this.messageService.showLoader.emit(false);
        if(this.router.url.includes('validate-project') && this.role!==CommonConfig.USER_STUDENT) {
          this.getProjectValidationTracking(this.projectId);
        }
  			if(res.success) {
  				this.projectData=res['data'];
  				this.epicsDetails=this.projectData.epics;
  				this.stories=this.projectData.stories;
  			} else {
  				this.errMessage = res.msg
  			}
    },error=> {
      this.handleError(error);
    	let errMsg = error.json();
    	this.errMessage = errMsg.msg
    });
  }

  //get project validation tracking
getProjectValidationTracking(projectId:string) {
  this.messageService.showLoader.emit(true);
  this.projectService.getProjectValidationTracking(projectId).subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data'] && response['data'].validationTracking) {
      this.showValidationError=true;
      this.projectData.validationTracking=response['data'].validationTracking;
      // this.projectData=res['data'];
      this.epicsDetails=this.projectData.validationTracking.epics;
      this.stories=this.projectData.validationTracking.stories;
      // this.stories.map((story,s)=>{
      //   if(story.status=='Deleted' || story.status=='Drafted'){
      //               this.stories.splice(s,1);
      //   }else if(story.status=='Active'){
      //               story.tasks.map((task,t)=>{
      //                       if(task.status=='Deleted' || task.status =='Drafted'){
      //                           story.tasks.splice(t,1)
      //                       }
      //               });
      //   }
      // })
      //this.stories=this.projectData.validationTracking.stories;
      if(!this.projectData.status || this.projectData.status!= CommonConfig.CONTENT_STATUS[3] ) {
       // this.router.navigate(['/',this.urlPrefix,'projects',this.projectId,'project-preview']);
      }
    }
  },error=> {
    this.errMessage = error.json().msg;
    this.handleError(error);
  })
}

  	// Rotate the arrow icon
  rotate(id) {
    document.getElementById(id).classList.toggle('rotate-up');
    document.getElementById(id).classList.toggle('rotate-down');
  }
  // Rotate story arrow icon
  rotateStory(id) {
      document.getElementById(id).classList.toggle('rotate-down');
      document.getElementById(id).classList.toggle('rotate-up');
  }

 // Handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 }

}
