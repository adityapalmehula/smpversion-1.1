import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonConfig } from './../../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../../services/common/authentication.service';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { ProjectService } from './../../../../../../services/projects/project.service';

@Component({
	selector: 'app-story-details',
	templateUrl: './story-details.component.html',
	styleUrls: ['./story-details.component.css'],
	providers: [ProjectService]
})
export class StoryDetailsComponent implements OnInit {

	public projectId:any;
	public storyId='';
	public urlPrefix:any;
	public permissions:any;
	status: any = CommonConfig.STATUS;
	public storyDetail : any;
	public tasks: any;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private messageService: MessageService,
		private authenticationService : AuthenticationService,
		private projectService : ProjectService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef
		) { }

	ngOnInit() {
		this.projectId= this.route.snapshot.params.projectId;
		this.storyId= this.route.snapshot.params.storyId;
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES);
		this.getStoryById();
	}


// Get story data for display
getStoryById() {
	this.projectService.fetchStoryDetail(this.projectId,this.storyId).subscribe((res: any)=> {
		this.messageService.showLoader.emit(false);
		if(res['data'] && res['data'][0]) {
			this.storyDetail=res['data'][0];
			this.tasks=this.storyDetail.tasks.filter((task)=> task.status==CommonConfig.CONTENT_STATUS[0]);
		}
	},(error: any)=> {
		this.handleError(error);
	})
}

 // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }
}
