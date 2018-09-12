import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router,ActivatedRoute } from '@angular/router';
import { AuthorizationService } from './../../services/common/authorization.service';
import { ErrorService } from './../../services/common/error.service';
import { AuthenticationService } from './../../services/common/authentication.service';
import { AppConfig } from './../../config/app-config.constants';


@Component({
	selector: 'app-redirect',
	templateUrl: './redirect.component.html',
	styleUrls: ['./redirect.component.css'],
	providers : [AuthorizationService]
})
export class RedirectComponent implements OnInit {
	public token : any;
	public role : any;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private location: Location,
		private authorizationService : AuthorizationService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef,
		private authenticationService : AuthenticationService,
		) {

		this.token=this.route.snapshot.params['token'];
		
		if(this.token){
			localStorage.setItem('currentUser', JSON.stringify({token: this.token, type: AppConfig.STUDENT_TYPE[0] }));
			this.authorizationService.getUserRole().subscribe((res) => {
				this.authorizationService.userRole = res.data.userRole;
				this.authorizationService.userRoleChanged.emit(this.authorizationService.userRole);
          this.router.navigate(['/', res.data.userRole.toLowerCase()]);
      },(error) =>{
        this.authenticationService.logout();
        this.handleError(error);
      });
		}
	}
	ngOnInit() {}

 // Handle error
 handleError(error) {
   this.errorService.handleError(error, this._vcr);
 }

}
