import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/common/authentication.service';
import { ErrorService } from '../../../../services/common/error.service';
import { MessageService } from './../../../../services/common/message.service';
import { CommonConfig } from './../../../../config/common-config.constants';
import { CourseService } from './../../../../services/courses/course.service';
import { SwitchConfig } from './../../../../config/switch-config.constants';

@Component({
	selector: 'app-topic-detail',
	templateUrl: './topic-detail.component.html',
	styleUrls: ['./topic-detail.component.css'],
	providers : [CourseService]
})
export class TopicDetailComponent implements OnInit {
	public topicId : any;
	public colors : any = {};
	public errMessage : any ;
	public errorMessage : any;
	private fb: FormBuilder;
	public formSubTopic: FormGroup;
	public topicData :any={};
	public subTopicId : any ;
	public subTopicDataForUpdate : any;
	public subTopicDetails : any;
	public isDefaultTab = '';
	public courseId : string;
	public urlPrefix : String;
	public permissions = [];
	public status : any = CommonConfig.STATUS;
	public textBookSolutions=[]
	public totalItems: number = 0;
	public currentPage: number = 1;
	public itemsPerPage: number = 10;
	public dataArray : any;
	public subTopics = [];
	public currentApp = SwitchConfig.APP;
	public apps = SwitchConfig.APPS;
	role:string;
	public topicOwnerUserId : String;
	CONFIG=CommonConfig;
	public userId : String;

	constructor(
		@Inject(FormBuilder) fb: FormBuilder,
		private route: ActivatedRoute,
		private messageService: MessageService,
		private courseService : CourseService,
		private errorService: ErrorService,
		private _vcr: ViewContainerRef,
		private authenticationService : AuthenticationService,
		private router :Router
		) {
		this.fb = fb;
		this.intializeForm(fb);
	}


	intializeForm(fb:FormBuilder,data:any={}):void {
		this.formSubTopic = fb.group({
			subTopicTitle: [data.title || '', [Validators.required]],
			subTopicDescription: [data.description ||'', [Validators.required]],
			statusCheck: [data.status || CommonConfig.STATUS.ACTIVE]
		});
	}

	ngOnInit() {
		this.userId= localStorage.getItem("userId");
		if(!this.userId) {
			this.router.navigate(['/']);
		}
		this.role = this.authenticationService.userRole;
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.SUBTOPICS);
		this.courseId = this.route.snapshot.params['courseId'];
		this.topicId = this.route.snapshot.params['topicId'].split('?')[0];
		this.subTopicId = this.route.snapshot.params['subtopicId'];
		// sessionStorage.setItem('topic',this.topicId);
		// sessionStorage.setItem('course',this.courseId);
		this.topicDetail(this.topicId);
		this.colors = CommonConfig.colors;
		this.route.queryParams
		.subscribe(
			(params: Params) => {
				if(params['tab']) {
					this.isDefaultTab = params['tab'];
				}
			});

		if(!this.courseId) {
			this.router.navigate(['/',this.urlPrefix,'courses'])
		}
	}


	/*pagination logic start here*/
	public setPage(pageNo: number): void {
		this.currentPage = pageNo;
	}

	public pageChanged(event: any): void {
		this.currentPage = event.page;
		this.paginationData();
	}

	paginationData() {
		const indexOfLastItem = this.currentPage * this.itemsPerPage;
		const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
		this.subTopicDetails = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
	}
	/*pagination logic end here*/


  // Set default tab for contents
  setDefaultTab(defaultTab) {
  	this.isDefaultTab = defaultTab;
  }

 // Fetch topic Detail by topic Id     
 topicDetail(topicId : any) {    
 	this.messageService.showLoader.emit(true);
 	this.courseService.fetchTopicDetail(topicId).subscribe((res: any) => {
 		this.messageService.showLoader.emit(false);
 		this.topicData = res.data;
 		this.textBookSolutions=this.topicData.solutions;
 		this.dataArray=this.topicData.subtopics;
 		this.totalItems=this.dataArray.length;
 		this.paginationData();
 		if(this.topicData.createdBy && this.topicData.createdBy.id) {
 			this.topicOwnerUserId= this.topicData.createdBy.id;
 		}
 		
 	}, (error: any) => {
 		let errMsg = error.json();
 		this.errMessage = errMsg.msg;
 		this.handleError(error);
 	})
 }

// Save subtopic
saveSubTopic(data: any) {
	let topicData = {
		subTopicTitle: data.get('subTopicTitle').value,
		subTopicDescription: data.get('subTopicDescription').value,
		statusCheck: data.get('statusCheck').value,
		topicId:this.topicId
	}
	this.messageService.showLoader.emit(true);
	this.courseService.addSubTopic(topicData).subscribe((res: any) => {
		this.messageService.showLoader.emit(false);
		this.messageService.successMessage('SubTopic', 'Successfully saved');
		this.topicDetail(this.topicId);
		this.closeModal();
	}, (error: any) => {
		let errMsg = error.json();
		this.errMessage = errMsg.msg;
		this.handleError(error);
	})
}

// Get SubTopic Data for update
getSubTopicForUpdate(subTopicId :any) {
	this.subTopicId=subTopicId;
	let subTopicDataForUpdate= this.topicData.subtopics.filter((data:any) => data._id === this.subTopicId );
	this.intializeForm(this.fb,subTopicDataForUpdate[0]);
}

// Delete subtopic
deleteSubTopic(subTopicId : any){
	this.messageService.deleteConfirmation(()=>{
		this.messageService.showLoader.emit(true);
		return this.courseService.deleteSubTopic(subTopicId).subscribe(data=>
		{ 
			if(data['success'])
			{
				this.messageService.showLoader.emit(false);
				this.topicDetail(this.topicId);
				this.messageService.successMessage('SubTopic', 'Successfully Deleted');
			}
		},(error:any)=>{
			let errorObj = error.json();
			if (errorObj.msg) {
				this.errorMessage = errorObj.msg;
				this.handleError(error);
			}
			this.handleError(error);
		});
	});
}

//Update subtopic
updateSubTopic(data:any) {
	let topicData = {
		subTopicTitle: data.get('subTopicTitle').value,
		subTopicDescription: data.get('subTopicDescription').value,
		statusCheck: data.get('statusCheck').value,
		topicId:this.topicId,
	}
	this.messageService.showLoader.emit(true);
	this.courseService.updateSubTopic(topicData,this.subTopicId).subscribe((res: any) => {
		this.messageService.showLoader.emit(false);
		this.messageService.successMessage('SubTopic', 'Successfully updated');
		this.topicDetail(this.topicId);
		this.closeModal();
	}, (error: any) => {
		let errMsg = error.json();
		this.errMessage = errMsg.msg;
		this.handleError(error);
	})

}

// close modal
closeModal(){
	this.intializeForm(this.fb);
	this.subTopicId='';
}

 // Handle error
 handleError(error) {
 	this.messageService.showLoader.emit(false);
 	this.errorService.handleError(error, this._vcr);
 }
}
