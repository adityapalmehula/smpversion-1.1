import { Component, OnInit, Input, Inject, Output, EventEmitter, OnChanges, ViewContainerRef, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { NotesService } from './../../../../../../services/subtopics/notes/notes.service';
import { CommonConfig } from './../../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../../services/common/authentication.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Config} from './notes.config';

@Component({
	selector: 'app-notes',
	templateUrl: './notes.component.html',
	styleUrls: ['./notes.component.css'],
	providers: [NotesService]
})

export class NotesComponent implements OnInit, OnChanges {
	@ViewChild('close')close: ElementRef;

	@Input() subTopicNotes;
	@Input() subTopicId;
	@Input() courseStatus;
	@Output() notesUpdated = new EventEmitter();
	@Input() subTopicOwnerUserId;
	public loading = false;
	public errMessage: any;
	public errorMessage: any;
	private fb: FormBuilder;
	public formNotes: FormGroup;
	public notesId: String;
	public subTopicsNotesData=[];
	public permissions =[];
	public status : any = CommonConfig.STATUS;
	public notesLength: any;
	public descriptionValue: any='';
	public notesOwnerUserId: string;
	CONFIG=CommonConfig;
	public userId : String;
	role:string;
   public cStatus : String;  //courseStatus
   public backendErrorMsg = [];
   public Config : any=Config;
   public descriptionError: any;


   public totalItems: number = 0;
   public currentPage: number = 1;
   public itemsPerPage: number = 10;
   public dataArray : any;


   constructor(
   	@Inject(FormBuilder) fb: FormBuilder,
   	private notesService: NotesService,
   	private errorService: ErrorService,
   	private messageService: MessageService,
   	private authenticationService : AuthenticationService,
   	private _vcr: ViewContainerRef,
   	private router : Router,
   	) {
   	this.fb = fb;
   	this.intializeForm(fb);
   }

   ngOnInit() {
   	this.userId= localStorage.getItem("userId");
   	if(!this.userId) {
   		this.router.navigate(['/']);
   	}
   	this.role = this.authenticationService.userRole;
   	this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.MEDIAFILES);
		// this.subTopicsNotesData=[];
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
		this.subTopicsNotesData = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
	}
	/*pagination logic end here*/


 //Form initialzation
 intializeForm(fb: FormBuilder, data: any = {}): void {
 	this.formNotes = fb.group({
 		title: ['',
 		[ Validators.required,
 		Validators.minLength(this.Config.title.minlength[0]),
 		Validators.maxLength(this.Config.title.maxlength[0])]
 		],
 		// descriptions: [data.description || '', [Validators.minLength(10)]],
 		statusCheck: [data.status || CommonConfig.STATUS.ACTIVE]
 	});
 }

 ngOnChanges() {
 	this.cStatus=this.courseStatus;
 	this.notesOwnerUserId=this.subTopicOwnerUserId;
 	this.dataArray = this.subTopicNotes;
 	this.totalItems=this.dataArray.length;
 	this.paginationData();
 }

  // Save Notes
  saveNotes(data: any) {
  	if(this.descriptionValue.length<=this.Config.description.minlength[0]){
  		return this.descriptionError=this.Config.description.minlength[1];
  	} else if (this.descriptionValue.length>=this.Config.description.maxlength[0]) {
  		return this.descriptionError=this.Config.description.maxlength[1];
  	}
  	let notesData = {
  		title: data.get('title').value,
  		description: this.descriptionValue,
  		statusCheck: data.get('statusCheck').value
  	}
  	this.messageService.showLoader.emit(true);
  	this.notesService.saveNotes(notesData, this.subTopicId).subscribe((res: any) => {
  		this.messageService.successMessage('Notes', 'Successfully saved');
  		this.messageService.showLoader.emit(false);
  		this.notesUpdated.emit();
  		this.closeModal();
  	}, (error: any) => {
  		this.messageService.showLoader.emit(false);
  		let errMsg = error.json();
  		this.errMessage = errMsg.msg
  		this.handleError(error);
  	})
  }

  // Delete notes
  delelteNotes(notesId: any) {
  	this.messageService.deleteConfirmation(()=> {
  		this.messageService.showLoader.emit(true);
  		return this.notesService.deleteNotes(notesId, this.subTopicId).subscribe(data => {
  			this.messageService.showLoader.emit(false);
  			if (data['success']) {
  				this.messageService.successMessage('Notes', 'Successfully Deleted');
  				this.notesUpdated.emit();
  			}
  		},(error: any) => {
  			let errorObj = error.json();
  			if (errorObj.msg) {
  				this.errorMessage = errorObj.msg;
  				this.handleError(error);
  			}
  			this.handleError(error);
  		});
  	});
  }

  // Get notes data for update
  editNotes(notesId: any) {
  	this.notesId = notesId;
  	let editNotesData = this.subTopicsNotesData.filter((data: any) => data._id === notesId);
  	this.descriptionValue=editNotesData[0].description;
  	this.intializeForm(this.fb, editNotesData[0]);
    // this.displayDescription=true;
  }

  // update notes data 
  updateNotes(data: any) {
  	if(this.descriptionValue.length<=this.Config.description.minlength[0]){
  		return this.descriptionError=this.Config.description.minlength[1];
  	} else if (this.descriptionValue.length>=this.Config.description.maxlength[0]) {
  		return this.descriptionError=this.Config.description.maxlength[1];
  	}
  	let notesData = {
  		title: data.get('title').value,
  		description: this.descriptionValue,
  		statusCheck: data.get('statusCheck').value,
  		notesId: this.notesId
  	}
  	this.messageService.showLoader.emit(true);
  	this.notesService.updateNotes(notesData).subscribe((res: any) => {
  		this.messageService.showLoader.emit(false);
  		this.messageService.successMessage('Notes', 'Successfully updated');
      // this.displayDescription=false;
      this.notesUpdated.emit();
      this.closeModal();
    }, (error: any) => {
    	this.messageService.showLoader.emit(false);
    	let errMsg = error.json();
    	this.errMessage = errMsg.msg;
    	this.handleError(error);
    })
  }

  // close modal
  closeModal() {
  	this.close.nativeElement.click();
  	this.intializeForm(this.fb);
  	this.notesId = '';
  	this.descriptionValue='';
  	this.backendErrorMsg=[];
  	this.errorMessage='';
  	this.descriptionError='';
  }

  openNotesModel(){
  	this.notesId = '';
  }

    // Handle error
    handleError(error) {
    	this.messageService.showLoader.emit(false);
    	if(error.status===500) {
    		this.backendErrorMsg= this.errorService.iterateError(error);
    	} else {
    		this.errorService.handleError(error, this._vcr);
    	}
    }
  }
