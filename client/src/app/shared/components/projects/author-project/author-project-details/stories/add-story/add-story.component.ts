	import { Component, OnInit, ViewContainerRef,Inject } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonConfig } from './../../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../../services/common/authentication.service';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { ProjectService } from './../../../../../../services/projects/project.service';
import {Config} from "./add-story.config";
@Component({
	selector: 'app-add-story',
	templateUrl: './add-story.component.html',
	styleUrls: ['./add-story.component.css'],
	providers: [ ProjectService ]

})
export class AddStoryComponent implements OnInit {
	public projectId:any;
	public storyId='';
	public urlPrefix:any;
	public permissions:any;
	public epicsList:any=[];
	status: any = CommonConfig.STATUS;
	fb: FormBuilder;
	formStory: FormGroup;
	storyDescription:any;
	public Config:any=Config;

	constructor(
		@Inject(FormBuilder) fb: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private _vcr : ViewContainerRef,
		private messageService: MessageService,
		private errorService: ErrorService,
		private authenticationService : AuthenticationService,
		private projectService : ProjectService,
		) {
		 this.fb = fb;
    this.intializeForm();
     }

	ngOnInit() {
		this.projectId= this.route.snapshot.params.projectId;
		this.storyId= this.route.snapshot.params.storyId;
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES);
			if(this.projectId!=null && this.projectId!=''){
				this.getEpicsListByProjectId(this.projectId);  
			}
		if(this.storyId) {
			this.getStoryById(this.storyId);
		}
	}

  //intialze form
  intializeForm(data:any={}):void {
  	this.formStory = this.fb.group({
  		epicId:[data.epicId || ''],
  		storyTitle:  [data.storyTitle || '', [Validators.required,Validators.minLength(this.Config.title.minlength[0]),
      Validators.maxLength(this.Config.title.maxlength[0])]],
  		statusCheck: [ CommonConfig.STATUS.ACTIVE ]
  	});
  	this.storyDescription= "";
  }

// Save story 
saveStory(data : any) {
    if(this.storyDescription==undefined || this.storyDescription==null || this.storyDescription==''){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.required);
    }else if(this.storyDescription.length<=this.Config.description.minlength[0]){
        return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
      } else if (this.storyDescription.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }

	let storyData = {
		epicId: data.get('epicId').value,
		title: data.get('storyTitle').value,
		description: this.storyDescription,
		status: CommonConfig.STATUS.ACTIVE,
		projectId: this.projectId
	}
	this.messageService.showLoader.emit(true);
	this.projectService.addStory(this.projectId,storyData).subscribe((res: any)=> {
		this.messageService.showLoader.emit(false);
		this.messageService.successMessage('Story', 'Successfully saved',()=> {
			debugger;
			this.router.navigate(['/', this.urlPrefix, 'projects',this.projectId]);
		});
	},(error: any) => {
		this.handleError(error);
	})
}

// update story data
updateStory(data : any ){
    if(this.storyDescription==undefined || this.storyDescription==null || this.storyDescription==''){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.required);
    }else if(this.storyDescription.length<=this.Config.description.minlength[0]){
        return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
      } else if (this.storyDescription.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }
	let storyData = {
		epicId: data.get('epicId').value,
		title: data.get('storyTitle').value,
		description: this.storyDescription,
		status: data.get('statusCheck').value,
		projectId:this.projectId
	}
	this.messageService.showLoader.emit(true);
	this.projectService.updateStory(this.projectId,storyData,this.storyId).subscribe((res: any)=> {
		this.messageService.showLoader.emit(false);
		this.messageService.successMessage('Story', 'Successfully updated',()=> {
			this.router.navigate(['/', this.urlPrefix, 'projects',this.projectId]);
		});
	},(error: any)=> {
  this.handleError(error);
	})
}

// Get story data for update
getStoryById(storyId: string) {
	this.projectService.fetchStoryDetail(this.projectId,storyId).subscribe((res: any)=> {
		this.messageService.showLoader.emit(false);
		if(res['data'] && res['data'][0]) {
			let story=res['data'][0];
			this.formStory = this.fb.group({
				storyTitle: [story.title, [Validators.required]],
				statusCheck: [story.status],
				epicId:[story.epicId || ''],
			});
			this.storyDescription=story.description;
		}
	},(error: any)=> {
		this.handleError(error);
	})
}
// Get Epics list by projectId
getEpicsListByProjectId(projectId: string) {

  this.projectService.getEpicListByProjectId(this.projectId).subscribe((res: any)=> {
    this.messageService.showLoader.emit(false);
    console.log(JSON.stringify(res));
    if(res['data']) {
		this.epicsList=res['data']
    }
  },(error: any)=> {
    this.handleError(error);
  })
}

 // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.messageService.showErrorToast(this._vcr,error.json().msg);
    this.errorService.handleError(error, this._vcr);
  }

}
