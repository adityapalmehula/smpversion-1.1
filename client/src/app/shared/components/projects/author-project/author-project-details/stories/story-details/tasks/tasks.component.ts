import { Component, OnInit, Input, OnChanges, ViewContainerRef } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { CommonConfig } from './../../../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../../../services/common/authentication.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';
import { ProjectService } from './../../../../../../../services/projects/project.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  providers: [ ProjectService ]

})
export class TasksComponent implements OnInit, OnChanges {
	@Input() tasks;
	@Input() pId;
	@Input() sId;
	status: any = CommonConfig.STATUS;
  errMessage : any;
  urlPrefix: any;
  CONFIG:any=CommonConfig;
  public taskDetails: any;
  public projectId: any;
  public storyId: any;
  public projectData : any = {};
  public userId:String;
  public projectOwnerUserId:String;

  constructor(
  	private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService : AuthenticationService,
    private projectService : ProjectService,) { }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.userId= localStorage.getItem("userId");
    this.projectDetail(this.projectId);
  }

  ngOnChanges(){
  	this.taskDetails=this.tasks;
  	this.projectId=this.pId;
  	this.storyId=this.sId;

  }

  projectDetail(projectId : any) {
    this.projectService.getProjectData(projectId).subscribe(res=> {
      if(res['data']) {
        this.projectData = res['data'];
        if(this.projectData.createdBy && this.projectData.createdBy.id) {
            this.projectOwnerUserId= this.projectData.createdBy.id;
          }
        }
      },error => {
        let errMsg = error.json();
        this.errMessage = errMsg.msg;
        this.handleError(error);
      });
    }
  /* delete task from story*/
  delete(taskId: any ) {
    this.messageService.deleteConfirmation(()=>{
      return this.projectService.deleteTask(this.projectId,this.storyId, taskId).subscribe(data=> { 
        if(data['success']) {
          let index;
          this.taskDetails.map((data ,i)=>{ if(data['_id']==taskId){ index=i; return }  });
          this.taskDetails.splice(index,1);
          this.messageService.successMessage('Task', 'Successfully Deleted');
        }
      },(error:any)=>{
        let errorObj = error.json();
        this.handleError(error);
        if (errorObj.msg) {
          this.errMessage = errorObj.msg;
        }
      });
    });
  }

   // Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }

}
