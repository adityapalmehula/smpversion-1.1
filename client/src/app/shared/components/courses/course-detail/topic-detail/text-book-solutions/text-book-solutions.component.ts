import { Component, OnInit, Input, OnChanges, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from './../../../../../services/common/message.service';
import { ErrorService } from './../../../../../services/common/error.service';
import { AppConfig } from '../../../../../config/app-config.constants';
import { CommonConfig } from '../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../services/common/authentication.service';
import { CourseService } from './../../../../../services/courses/course.service';

@Component({
	selector: 'app-text-book-solutions',
	templateUrl: './text-book-solutions.component.html',
	styleUrls: ['./text-book-solutions.component.css'],
	providers: [CourseService]
})
export class TextBookSolutionsComponent implements OnInit, OnChanges {
	@Input() textBookSolutions=[];
	@Input() topicId:string;
	@Input() topicOwnerUserId: string;

	public solutions: any;
	public permissions: any;
	public myFile: any;
	public sizeLimit = 5242880;
	public sizeError: any;
	public fileList: FileList;
	public fileSize: any;
	public fileType: any;
	public fileExtension: any;
	public titleError: any;
	public solutionPath=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[3];
	public formData: FormData;
	public solutionTitle: any;
	public errorMessage: any;
	role:string;
	public textBookOwnerUserId : String;
	CONFIG=CommonConfig;
	public userId : String;
	public imgPath:string=new CommonConfig().STATIC_IMAGE_URL;


	constructor(
		private messageService: MessageService,
		private authenticationService : AuthenticationService,
		private courseService:CourseService,
		private errorService: ErrorService,
		private _vcr: ViewContainerRef,
		private router :Router
		) { }

	ngOnInit() {
		this.userId= localStorage.getItem("userId");
		if(!this.userId) {
			this.router.navigate(['/']);
		}
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.MEDIAFILES);
	}

	ngOnChanges(){
		this.afterSuccess(this.textBookSolutions);
		this.textBookOwnerUserId=this.topicOwnerUserId;
	}

	  // On change of file input
	  fileChange(event) {
	  	this.formData = new FormData();
	  	this.fileList = event.target.files;
	  	this.fileSize = this.fileList[0].size;

	  	let file = this.fileList[0].type.split('/');
	  	this.fileType = file[1];
	  }
	    // for uploading file
	    save(close) {
	    	if (!this.solutionTitle) {
	    		this.titleError = 'Title field is required';
	    	} else if (!this.fileSize) {
	    		this.sizeError = 'File field is required';
	    		this.titleError = '';
	    	} else if (this.fileSize > this.sizeLimit) {
	    		this.sizeError = 'File size must be less than 5mb';
	    		this.titleError = '';
	    	} else if (this.fileType !='pdf') {
	    		this.sizeError = 'File type must be pdf	';
	    		this.titleError = '';
	    	} else {
	    		let file: File = this.fileList[0];
	    		this.formData.append(this.solutionTitle, file, file.name);
	    		this.messageService.showLoader.emit(true);
	    		this.courseService.textBookSolution(this.formData, this.topicId).subscribe(
	    			response => {
	    				this.messageService.showLoader.emit(false);
	    				if (response['success']) {
	    					this.afterSuccess(response.data.solutions);
	    					this.closeModal();
	    					close.click();
	    					this.messageService.successMessage('Text Book Solution', 'Successfully Saved');
	    				}
	    			}, (error: any) => {
	    				let errorObj = error.json();
	    				if (errorObj.msg) {
	    					this.errorMessage = errorObj.msg;
	    					this.handleError(error);
	    				}
	    				this.handleError(error);
	    			});
	    	}
	    }

	    // deleteTextBookSolution
	    delete(solutionId){
	    	this.messageService.deleteConfirmation(() => {
	    		this.messageService.showLoader.emit(true);
	    		return this.courseService.deleteTextBookSolution(solutionId, this.topicId).subscribe(data => {
	    			this.messageService.showLoader.emit(false);
	    			if (data['success']) {
	    				let index= this.solutions.findIndex(data => data._id==solutionId);
	    				this.solutions.splice(index,1);
	    				this.messageService.successMessage('Text Book Solution ', 'Successfully Deleted');
	    			}
	    		}, (error: any) => {
	    			let errorObj = error.json();
	    			if (errorObj.msg) {
	    				this.errorMessage = errorObj.msg;
	    				this.handleError(error);
	    			}
	    			this.handleError(error);
	    		});
	    	});
	    }


	    /* after success */
	    afterSuccess(data) {
	    	this.solutions= data.filter((data)=>{
	    		return data.status==CommonConfig.CONTENT_STATUS[0];
	    	})
	    }

	    // On close modal
	    closeModal() {
	    	this.solutionTitle = '';
	    	this.myFile = '';
	    	this.sizeError='';
	    	this.titleError ='';
	    }

	     // Handle error
	     handleError(error) {
	     	this.messageService.showLoader.emit(false);
	     	this.errorService.handleError(error, this._vcr);
	     }
	   }
