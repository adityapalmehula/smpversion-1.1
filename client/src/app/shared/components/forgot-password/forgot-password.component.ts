import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import {AuthenticationService} from './../../services/common/authentication.service'
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {

  errorMessage:string;
  successMessage:string;
  type:string;
  title:string="Let’s Find Your Account";
  RESEND_MAIL_TYPES=['account-verification']

  constructor(
    private loginService: AuthenticationService,
    private messageService: MessageService,
    private router: Router,
    private errorService: ErrorService,
    private _vcr: ViewContainerRef
    ) { }

  ngOnInit() {
    if(this.router.url && this.router.url.split('/')[2]) {
      this.type = this.router.url.split('/')[2];
      if(this.type == this.RESEND_MAIL_TYPES[0]) {
        this.title="Resend Verification Mail";
      }
    }
  }

  //on form submit
  submitEmail(formData){
    this.errorMessage='';
    this.successMessage='';
    if(formData.value && formData.value){
      let data={
        email: formData.value.email
      } 
      this.messageService.showLoader.emit(true);
      let verifyMail$=this.loginService.verifyEmail(data);
      if(this.type == this.RESEND_MAIL_TYPES[0]) {
        verifyMail$=this.loginService.resendAccountVerificationMail(data);
      }
      verifyMail$.subscribe(data=>{
        this.messageService.showLoader.emit(false);
        this.successMessage=data['msg'];
      },error=>{
        this.errorMessage=error.json().msg;
        this.handleError(error);
      })
    }
  }

  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }
}
