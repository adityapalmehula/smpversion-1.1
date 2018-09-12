import { Component, OnInit, ViewContainerRef,Inject } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonConfig } from './../../../../../../../../config/common-config.constants';
import { ValidationConfig } from './../../../../../../../../../shared/config/validation-config.constants';
import { AuthenticationService } from '../../../../../../../../services/common/authentication.service';
import { MessageService } from './../../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../../services/common/error.service';
import { ProjectService } from './../../../../../../../../services/projects/project.service';
import{Config} from "./add-task.config";
@Component({
	selector: 'app-add-task',
	templateUrl: './add-task.component.html',
	styleUrls: ['./add-task.component.css'],
	providers: [ProjectService]
})
export class AddTaskComponent implements OnInit {
	public projectId:any;
	public storyId='';
	public urlPrefix:any;
	public permissions:any;
	status: any = CommonConfig.STATUS;
	fb: FormBuilder;
	formTask: FormGroup;
	public actionsConfig:any={}
	public actionsTypesList:any=[];
	public taskDescription: any;
	public selectedActionTypes:any=[];
	public taskId: any;
 	public Config:any=Config;
	constructor(
		@Inject(FormBuilder) fb: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private _vcr : ViewContainerRef,
		private messageService: MessageService,
		private errorService: ErrorService,
		private authenticationService : AuthenticationService,
		private projectService : ProjectService ) 
	{
		this.fb = fb;
		this.intializeForm(); }

		ngOnInit() {
			this.projectId = this.route.snapshot.params.projectId;
			this.storyId = this.route.snapshot.params.storyId;
			this.taskId = this.route.snapshot.params.taskId;
			this.urlPrefix = this.authenticationService.userRole.toLowerCase();
			this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES);  
			if(this.projectId && this.storyId && this.taskId) {
				this.getTaskById();
			}
			this.actionsConfig = { 
		    singleSelection: false, 
		    text:"Select action type",
		    selectAllText:'Select All',
		    unSelectAllText:'UnSelect All',
		    enableSearchFilter: true,
		  }; 
  		this.actionsTypesList = Config.actionsConfig;
		}


 //intialze form
 intializeForm(data:any={}):void {
 	this.formTask = this.fb.group({
 		taskTitle: [data.taskTitle || '', [Validators.required,Validators.minLength(this.Config.title.minlength[0]),
        Validators.maxLength(this.Config.title.maxlength[0])]],
 		doneCriteria: ['',[Validators.required]],
 		statusCheck: [ CommonConfig.STATUS.ACTIVE ],
 		duration: ['', [Validators.required, Validators.pattern(ValidationConfig.NUMBER_PATTERN)]]


 	});
 	this.taskDescription= "";
 	this.setActions([]);

 }
// duration : [data.duration || '', [Validators.required,Validators.pattern(ValidationConfig.NUMBER_PATTERN), Validators.min(this.Config.duration.min[0]),Validators.max(this.Config.duration.max[0])]],
// Save Task 
saveTask(data : any) {
    if(this.taskDescription==undefined || this.taskDescription==null || this.taskDescription==''){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.required);
    }else if(this.taskDescription.length<=this.Config.description.minlength[0]){
        return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
      } else if (this.taskDescription.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }
	 if(this.getActions().length<1){
	 	return this.messageService.showErrorToast(this._vcr,this.Config.actions.required);
	 }

	let taskData = {
		title: data.get('taskTitle').value,
		description: this.taskDescription,
		duration: data.get('duration').value,
		doneCriteria: data.get('doneCriteria').value,
		actions: this.getActions(),
		status: CommonConfig.STATUS.ACTIVE,
	}
	this.messageService.showLoader.emit(true);
	this.projectService.addTask(this.projectId, this.storyId, taskData).subscribe((res: any)=> {
		this.messageService.showLoader.emit(false);
		this.messageService.successMessage('Task', 'Successfully saved',()=> {
			this.router.navigate(['/', this.urlPrefix, 'projects',this.projectId, 'stories', this.storyId]);
		});
	},(error: any) => {
	this.handleError(error);
	})
}

// update Task data
updateTask(data : any ){
    if(this.taskDescription==undefined || this.taskDescription==null || this.taskDescription==''){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.required);
    }else if(this.taskDescription.length<=this.Config.description.minlength[0]){
        return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
      } else if (this.taskDescription.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }
	 if(this.getActions().length<1){
	 	return this.messageService.showErrorToast(this._vcr,this.Config.actions.required);
	 }
	let taskData = {
		title: data.get('taskTitle').value,
		description: this.taskDescription,
		status: data.get('statusCheck').value,
		doneCriteria: data.get('doneCriteria').value,
		actions: this.getActions(),
		duration:data.get('duration').value,
	}
	this.messageService.showLoader.emit(true);
	this.projectService.updateTask(this.projectId,this.storyId, this.taskId, taskData).subscribe((res: any)=> {
		this.messageService.showLoader.emit(false);
		this.messageService.successMessage('Task', 'Successfully updated',()=> {
			this.router.navigate(['/', this.urlPrefix, 'projects',this.projectId, 'stories', this.storyId]);
		});
	},(error: any)=> {
	this.handleError(error);
	})
}

// Get Task data for update
getTaskById() {
	this.projectService.fetchTaskDetail(this.projectId, this.storyId,this.taskId).subscribe((res: any)=> {
		this.messageService.showLoader.emit(false);
		if(res['data'] && res['data'][0]) {
			let task=res['data'][0];
			this.formTask = this.fb.group({
				taskTitle: [task.title, [Validators.required]],
				statusCheck: [task.status],
				duration:[task.duration],
				doneCriteria: [task.doneCriteria]
			});
			this.taskDescription=task.description;
			this.setActions(task.actions);
		}
	},(error: any)=> {
	this.handleError(error);
	})
}
  getActions(){
	let actionArr=[];
	this.selectedActionTypes.map(item=>{
		actionArr.push(item.itemName);
	});
	return actionArr;
	}
  setActions(actionArr:any){
	 actionArr.map((item,key)=>{
	 	let index = this.actionsTypesList.findIndex(obj => obj.itemName.toLowerCase()==item.toLowerCase());
		if(index!=-1){this.selectedActionTypes.push({id:++index,itemName:item});}
	})
	}
 // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.messageService.showErrorToast(this._vcr,error.json().msg);
    this.errorService.handleError(error, this._vcr);
  }

}
