import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from './shared/services/common/authentication.service';
import { AuthorizationService } from './shared/services/common/authorization.service';
import { MessageService } from './shared/services/common/message.service';
import { CommonConfig } from './shared/config/common-config.constants';
import { MessageConfig } from './shared/config/message-config.constants';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	private perm : any;
	public isLoading : boolean = false;

	constructor(private router: Router, 
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private authenticationService : AuthenticationService,
    private authorizationService : AuthorizationService,
    private messageService : MessageService ) {
		this.messageService.showLoader.subscribe((isLoading: any) => {
			setTimeout(() => this.isLoading = isLoading, 0)
    });

    let locationPath = location.path();
    if(locationPath.includes('&youtubeToken=')) {
      let youtubeToken = locationPath.slice(locationPath.indexOf('&youtubeToken=')+14, locationPath.length);
      if (youtubeToken) {
        sessionStorage.setItem('YTAT', youtubeToken); // Youtube Access Token
      }
    }
   
    // If user is already logged in, redirect to user dashboard page
    if(this.authenticationService.getCurrentUser()){
      // Verify the token stored in localstorage is expired
      // this.authorizationService.verifyToken(this.authenticationService.getToken()).subscribe((res) =>{

        if(locationPath.includes('&access_token=')) {

          // Redirected from Youtube Oauth 
          let access_token = locationPath.slice(locationPath.indexOf('&access_token=')+14, locationPath.indexOf('&token_type='));

          this.authenticationService.setAccessToken(CommonConfig.TOKEN_TYPE.YUUID, access_token);
          this.router.navigateByUrl(sessionStorage.getItem('redirect_uri'));
          sessionStorage.removeItem('redirect_uri');
        } else if(locationPath.includes('access_token=')) {

          // Redirected from Vimeo Oauth 
          let access_token = locationPath.slice(locationPath.indexOf('access_token=')+13, locationPath.indexOf('&token_type='));

          this.authenticationService.setAccessToken(CommonConfig.TOKEN_TYPE.VUUID, access_token);
          this.router.navigateByUrl(sessionStorage.getItem('redirect_uri'));
          sessionStorage.removeItem('redirect_uri');
        }  else {
          // Verify the token stored in localstorage is expired
          this.authorizationService.verifyToken(this.authenticationService.getToken()).subscribe((res) => {
            if(res.token) {
              localStorage.setItem('currentUser', JSON.stringify({ token: res.token}));
            }
            this.authorizationService.getUserRole().subscribe((res) => {
              this.authorizationService.userRole = res.data.userRole;
              this.authorizationService.userRoleChanged.emit(this.authorizationService.userRole);
              if(location.path() === ''){
                if (res.data.userRole.toLowerCase() === CommonConfig.USER_STUDENT.toLowerCase()) {
                  this.router.navigate(['/', res.data.userRole.toLowerCase(), 'landing']);
                } else {
                  this.router.navigate(['/', res.data.userRole.toLowerCase()]);
                }   
              }
              if(location.path() !== ''){ 
                let path = location.path();
                this.router.navigate([location.path()]);
              }
            },(error) =>{
              this.isLoading = false;
              this.authenticationService.logout();
            });
          },(err) =>{
            this.isLoading = false;
            this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, err.json().msg);
            this.authenticationService.logout();
          });
        }
      } else {
        if(location.path() !== ''){          
          this.router.navigate([location.path()]);
        } else {
          this.router.navigate(['/']);
        }
      }
      if(localStorage.getItem('currentUser')) {
        this.updateLastloginDate();
      }
    }

//update last login date
updateLastloginDate() {
  this.authorizationService.updateLastloginDate().subscribe((res) => {
      //successfully updated
    },error=> {
//error
});
}

}