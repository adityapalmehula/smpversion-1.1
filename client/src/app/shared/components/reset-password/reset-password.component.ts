import { Component, OnInit,Inject, ViewContainerRef } from '@angular/core';
import { FormGroup,FormBuilder,Validators} from '@angular/forms'
import { Router,ActivatedRoute } from '@angular/router'
import { AuthenticationService } from './../../services/common/authentication.service'
import { ErrorService } from './../../services/common/error.service'

@Component({
	selector: 'app-reset-password',
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
	resetPasswordFrom: FormGroup;
	errorMessage: string;
	successMessage: string;
	uId: string;
	userName: string;
	urlPrefix : String;
	constructor( 
		@Inject(FormBuilder)fb:FormBuilder,
		private authenticationService: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef

		) { 
		this.resetPasswordFrom=fb.group({
			password: ['',[Validators.required, Validators.minLength(8)]],
			confirmPassword: ['',[Validators.required]]
		},{validator: this.checkIfMatchingPasswords});
	}

	ngOnInit() {
    //this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.uId=this.route.snapshot.params['uniqeId'];
    let status = this.route.snapshot.params['status'];
    if(status) {
    	if(status==="invalid") {
    		this.errorMessage="Your verification link is invalid or has expired!";
    	}
    }
  }

  //password match validator 
  checkIfMatchingPasswords(group: FormGroup) {
  	let passwordField= group.controls.password,
  	confirmPasswordField = group.controls.confirmPassword;
  	if(passwordField.value !== confirmPasswordField.value ) {
  		return confirmPasswordField.setErrors({notEquivalent: true})
  	}else {
  		return confirmPasswordField.setErrors(null);
  	}
  }

  //reset password
  resetPassword(resetPass: any) {
  	this.errorMessage = '';
  	this.successMessage = '';
  	let dataObj= {
  		uId: this.uId,
  		password: resetPass.get('password').value.trim(),
  		confirmPassword: resetPass.get('confirmPassword').value.trim()
  	}
    let serviceRef= this.authenticationService.resetPassword(dataObj);
    if(!this.uId) {
      serviceRef= this.authenticationService.resetPasswordWithToken(dataObj);
    }
    serviceRef.subscribe(data=> {
      this.successMessage=data['msg'];
      setTimeout(()=>{
        this.successMessage='';
        this.router.navigate(["/"]);
      },1000);
    },error=> {
      this.errorMessage=error.json().msg;
      this.handleError(error);
    })
  }

// Handle error
 handleError(error) {
   this.errorService.handleError(error, this._vcr);
 }
}
