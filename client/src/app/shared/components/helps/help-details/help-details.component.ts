import { Component, OnInit, Inject, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HelpService } from '../../../services/help/help.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { AuthenticationService } from '../../../services/common/authentication.service';
import { AppConfig } from './../../../config/app-config.constants';
 
@Component({
  selector: 'app-help-details',
  templateUrl: './help-details.component.html',
  styleUrls: ['./help-details.component.css'],
  providers:	[HelpService]
})
export class HelpDetailsComponent implements OnInit {
  public urlPrefix : String;
  public helpId: any;
  private fb: FormBuilder;
  public replyForm: FormGroup;
  public helpData: any;
  public errorMessage ='';
  public path = new CommonConfig().BASE_URL+CommonConfig.FOLDERS[4];

  constructor(
  	@Inject(FormBuilder) fb: FormBuilder,
    private route: ActivatedRoute,
    private helpService: HelpService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private router: Router,
    private messageService: MessageService,
    private authenticationService : AuthenticationService
    ) {
      this.fb = fb;
	   this.initiliazeForm(); 
    }


  ngOnInit() {
  	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.helpId = this.route.snapshot.params['helpId'];
    if (this.helpId) {
    	this.getHelpById(this.helpId);
    }
  }

  // Initialize form
  initiliazeForm() {
    this.replyForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(900)]],
    });
  }

  // Get help data by id
  getHelpById(helpId){
    this.messageService.showLoader.emit(true);
  	this.helpService.getHelpById(helpId).subscribe((res: any) => {
    	this.messageService.showLoader.emit(false);
    	this.helpData = res.data;
    }, (error)=>{
      this.handleError(error);
    });
  }

  // Save reply data 
  saveReply(replyForm){
    if (this.errorMessage === '') {
      let data = {
      	"description": replyForm.get('description').value
      }
      this.messageService.showLoader.emit(true);
      this.helpService.saveReply(this.helpData._id, data).subscribe((res: any) => {
        this.initiliazeForm();
        this.handleSuccess(res);
        this.getHelpById(this.helpData._id);
      }, (error)=>{
        this.handleError(error);
      })
    }
  }


  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }

  // Handle success
  handleSuccess(res) {
    this.messageService.showLoader.emit(false);
    this.messageService.showSuccessToast(this._vcr, res.msg);
  }

}
