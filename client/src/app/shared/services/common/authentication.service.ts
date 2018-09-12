import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response,RequestOptions,Headers} from '@angular/http'
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { AppConfig } from './../../config/app-config.constants';
import { CommonConfig } from './../../config/common-config.constants';
import { AuthorizationService } from './authorization.service';

@Injectable()
export class AuthenticationService {

	public token: string;
  public userRole : string;

  constructor(
    private http: Http,
    private router: Router,
    private authorizationService: AuthorizationService,
    private permissionsService: NgxPermissionsService,
    private roleService: NgxRolesService,) {
    this.authorizationService.userRoleChanged.subscribe((role: any) => {
      this.userRole = role;
    });
  }

  //verify user mail id
  verifyEmail(data:any):Observable<Response>{
  	return this.http
  	.post(AppConfig.API_HOST+'/api/auth/verify-email',data)
  	.map(response=>response.json(),error=>error.json());
  }

  login(authObj: any): Observable<string> {
  	return this.http.post(AppConfig.API_HOST+'/api/auth', authObj, this.authorizationService.setPlatform())
  	.map((response: Response) => {
      // login successful if there's a jwt token in the response
      this.userRole=response.json().data.role;
      let token = response.json().data.authToken;
      let userName = response.json().data.userName;
      let userId=response.json().data.userId;
      let name=response.json().data.name;
      let type=response.json().data.type;
      if (token) {
        // set token property
        localStorage.setItem('userId',userId);
        this.token = token;
        // store userName and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify({ token: token, type: type}));
        // return true to indicate successful login
        return response.json();
      } else {
        // return false to indicate failed login
        return response.json();
      }
    });
  }

  //get token
  getToken():string {
  	if(!localStorage.getItem('currentUser')) {
  		this.router.navigate(['/']);
  	}else{
  		let token = JSON.parse(localStorage.getItem('currentUser'))['token'];
  		if(token){
  			return token;
  		}else{
  			this.router.navigate(['/']);
  		}
  	}
  }

  //Set access token for youtube authentication
  setAccessToken(tokenName, access_token){
    sessionStorage.setItem(tokenName, access_token);
  }

  //get access token for youtube authentication
  getAccessToken(tokenName):any {
    if(sessionStorage.getItem(tokenName)) {
      let access_token = sessionStorage.getItem(tokenName);
      return access_token;
    }else{
      return false;
    }
  }

  //get user role after succesfully logged in
  getRole(): string{
  	if(!localStorage.getItem('currentUser')) {
  		this.router.navigate(['/']);
  	}else{
  		if(this.userRole !='' || this.userRole != undefined){
  			return this.userRole;
  		}else{
  			this.router.navigate(['/']);
  		}
  	}
  }
  
  //get user name
  getUserName(): string{
  	if(!localStorage.getItem('currentUser')) {
  		this.router.navigate(['/']);
  	}else{
  		let userName = JSON.parse(localStorage.getItem('currentUser'))['userName'];
  		if(userName){
  			return userName;
  		}else{
  			this.router.navigate(['/']);
  		}
  	}
  }

  //get user id (mongo id)
  getUserId(): string{
  	if(!localStorage.getItem('currentUser')) {
  		this.router.navigate(['/']);
  	}else{
  		let userId = JSON.parse(localStorage.getItem('currentUser'))['userId'];
  		if(userId){
  			return userId;
  		}else{
  			this.router.navigate(['/']);
  		}
  	}
  } 

    //get user type
    getUserType(): string{
    	if(!localStorage.getItem('currentUser')) {
    		this.router.navigate(['/']);
    	}else{
    		if(this.getRole() === CommonConfig.USER_STUDENT) {
    			let type = JSON.parse(localStorage.getItem('currentUser'))['type'];
    			if(type){
    				return type;
    			}else{
    				this.router.navigate(['/']);
    			}
    		}
    	}
    } 

    getCurrentUser() {
    	return JSON.parse(localStorage.getItem('currentUser'));
    }

    setToken(authToken: any) {
    	let token = authToken;
    	let userName = JSON.parse(localStorage.getItem('currentUser'))['userName'];
    	let name =  JSON.parse(localStorage.getItem('currentUser'))['name'];
    	let userId = JSON.parse(localStorage.getItem('currentUser'))['userId'];
    	let role = JSON.parse(localStorage.getItem('currentUser'))['role'];
    	localStorage.setItem('currentUser', JSON.stringify({ userName: userName, name :name, token: token, userId: userId, role: role}));
    }

  //verify user mail id
  resetPassword(data:any):Observable<Response>{
    return this.http
    .post(AppConfig.API_HOST+'/api/auth/reset-pass',data)
    .map(response=>response.json(),error=>error.json());
  } 

  //reset password for logged in user- with token
  resetPasswordWithToken(data:any):Observable<Response>{
  	return this.http.post(AppConfig.API_HOST+'/api/auth/reset-password',data,this.authorizationService.authorization())
  	.map(response=>response.json(),error=>error.json());
  }

  // Delete local storage data and redirect to login page
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    this.userRole = '';
    this.permissionsService.flushPermissions();
    this.authorizationService.showNavBar.emit(false);
    this.router.navigate(['/']);
  }

  // Set permission for RBAC in component
  setPermission(page) {
  	return CommonConfig.PAGES_PERMISSIONS[page];
  }

  // Set permission for RBAC in component
  getUserFlow(userRole) {
  	if(CommonConfig.SCHOOL_TEACHER.indexOf(userRole) != -1){
  		return true;
  	} else {
  		return false;
  	}
  }
  
 //resend account verification mail
 resendAccountVerificationMail(data:any):Observable<Response>{
   return this.http.post(AppConfig.API_HOST+'/api/users/resend-verification-mail',data)
   .map(response=>response.json(),error=>error.json());
 }

 //send welcome mail to user
 sendWelcomeMail(userInfo: any) {
   return this.http.post(AppConfig.API_HOST+'/api/users/send-welcome-mail',userInfo, this.authorizationService.authorization())
   .map(response=>response.json(),error=>error.json()); 
 }

 //update user status
 updateStatus(userInfo:any) {
   return this.http.put(AppConfig.API_HOST+'/api/users/status',userInfo,this.authorizationService.authorization())
   .map(data=>data.json(),error=>error.json());
 }
 
 buy(){
   return this.http.get(AppConfig.API_HOST+'/api/orders',this.authorizationService.authorization())
   .map(response=>response.json(),error=>error.json());
 }
 /*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
 youtubeOauth() {
   let anchor = document.createElement('a');
   anchor.setAttribute('href', AppConfig.YOUTUBE_OAUTH_START_URL);
   anchor.click();

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    // let form = document.createElement('form');
    // form.setAttribute('method', 'GET'); // Send as a GET request.
    // form.setAttribute('action', AppConfig.YOUTUBE_OAUTH2ENDPOINT);

    // // Parameters to pass to OAuth 2.0 endpoint.
    // let params = {
    //   'client_id': AppConfig.YOUTUBE_CLIENT_ID,
    //   'redirect_uri': AppConfig.YOUTUBE_REDIRECT_URI,
    //   'response_type': 'token',
    //   'scope': AppConfig.YOUTUBE_SCOPE,
    //   'include_granted_scopes': 'true',
    //   'state': 'pass-through value'
    // };

    // // Add form parameters as hidden input values.
    // for (let p in params) {
    //   let input = document.createElement('input');
    //   input.setAttribute('type', 'hidden');
    //   input.setAttribute('name', p);
    //   input.setAttribute('value', params[p]);
    //   form.appendChild(input);
    // }

    // // Add form to page and submit it to open the OAuth 2.0 endpoint.
    // document.body.appendChild(form);
    // form.submit();     
  }
}
