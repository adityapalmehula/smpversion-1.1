import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { FormGroup,FormBuilder,Validators} from '@angular/forms';
import { ProfileService } from './../../../services/profiles/profiles.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';

@Component({
	selector: 'app-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.css'],
	providers : [ProfileService]
})
export class ChangePasswordComponent implements OnInit {
	changePasswordForm: FormGroup;
	errorMessage : any;

	constructor(
		@Inject(FormBuilder)fb:FormBuilder,
		private profileService : ProfileService,
		private messageService : MessageService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef
		) {
		this.changePasswordForm=fb.group({
			oldPassword: ['',[Validators.required, Validators.minLength(8)]],
			newPassword: ['',[Validators.required,, Validators.minLength(8)]],
			confirmNewPassword: ['',[Validators.required, Validators.minLength(8)]],
		},{validator: this.checkIfMatchingPasswords});
	}

	ngOnInit() {
	}

	//password match validator 
	checkIfMatchingPasswords(group: FormGroup) {
		let passwordField= group.controls.newPassword,
		confirmPasswordField = group.controls.confirmNewPassword;
		if(passwordField.value !== confirmPasswordField.value ) {
			return confirmPasswordField.setErrors({notEquivalent: true})
		} else {
			return confirmPasswordField.setErrors(null);
		}
	}

	// Method of Change Password 
	changePassword(data){
		let passwordData= {
			oldPassword:data.get('oldPassword').value.trim(),
			newPassword:data.get('newPassword').value.trim(),
			confirmNewPassword :data.get('confirmNewPassword').value.trim()
		}
		this.messageService.showLoader.emit(true);
		this.profileService.changePassword(passwordData).subscribe(response=>{
			this.messageService.showLoader.emit(false);
			this.errorMessage='';
			this.changePasswordForm.reset();
			this.messageService.successMessage('Password', 'Successfully Updated');
		}, (error:any)=>{
			this.errorMessage=error.json().msg;
			this.handleError(error);
		})
	}

	// Handle error
	handleError(error) {
		this.messageService.showLoader.emit(false);
		this.errorService.handleError(error, this._vcr);
	}
}
