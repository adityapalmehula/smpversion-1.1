import { Component, OnInit, Input, OnChanges, ViewContainerRef } from '@angular/core';
import { CommonConfig } from './../../../../../config/common-config.constants';
import { MessageService } from './../../../../../services/common/message.service';
import { ErrorService } from './../../../../../services/common/error.service';
import { ProjectService } from './../../../../../services/projects/project.service';

@Component({
	selector: 'app-stories',
	templateUrl: './stories.component.html',
	styleUrls: ['./stories.component.css']
})
export class StoriesComponent implements OnInit, OnChanges  {
	@Input() stories;
	@Input() projectId;
	@Input() url;
	public projectData : any = {};
	public storiesData: any;
	public userId:String;
	public projectOwnerUserId:String;
	public pId: any;
	public urlPrefix: any
	CONFIG:any=CommonConfig;
	public errMessage : any;

	constructor( 
		private messageService : MessageService,
		private projectService : ProjectService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef,
		) { }

	ngOnInit() {
		this.userId= localStorage.getItem("userId");
        this.projectDetail(this.pId);
	}

	ngOnChanges(){
		this.storiesData=this.stories;
		this.pId= this.projectId;
		this.urlPrefix=this.url;
		
	}
	projectDetail(projectId : any) {
    this.projectService.getProjectData(projectId).subscribe(res=> {
      if(res['data']) {
        this.projectData = res['data'];
        // this.stories = this.projectData.stories;
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
	deleteStory(storyId : any ) {
		this.messageService.deleteConfirmation(()=>{
			return this.projectService.deleteStory(this.projectId,storyId).subscribe(data=> { 
				if(data['success']) {
					let index;
					this.storiesData.map((data ,i)=>{ if(data['_id']==storyId){ index=i; return }  });
					this.storiesData.splice(index,1);
					this.messageService.successMessage('Epic', 'Successfully Deleted');
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
