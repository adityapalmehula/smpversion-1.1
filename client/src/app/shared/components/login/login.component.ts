import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { AuthenticationService } from './../../services/common/authentication.service';
import { AuthorizationService } from './../../services/common/authorization.service';
import { FacebookShareService } from './../../services/common/facebookshare.service';
import { AppConfig } from './../../config/app-config.constants';
import { CommonConfig } from './../../config/common-config.constants';
import { MessageConfig } from './../../config/message-config.constants';
import { FacebookService } from 'ngx-facebook';
import { SwitchConfig } from './../../config/switch-config.constants';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [FacebookShareService]
})

export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public errorMessage: any;
  public AppConfig: any = AppConfig;
  notifyErrorMsg: any;
  notifySuccessMsg: any;
  uniqeId: string;
  public currentApp = SwitchConfig.APP;
  public apps = SwitchConfig.APPS;
  isVerified:boolean=true;
  public loginImgPath:string=new CommonConfig().STATIC_IMAGE_URL+'login/';

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private loginService: AuthenticationService,
    private authorizationService: AuthorizationService,
    private router: Router,
    private route: ActivatedRoute,
    private facebook: FacebookService,
    private facebookShareService: FacebookShareService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    ) {
    if(this.loginService.getCurrentUser()){
      this.authorizationService.getUserRole().subscribe((res) => {
        this.authorizationService.userRole = res.data.userRole;
        this.router.navigate(['/', res.data.userRole.toLowerCase()]);
      },(error) =>{
        this.loginService.logout();
        this.handleError(error);
      });
    }
    this.loginForm = fb.group({
      email: ['', [Validators.required, Validators.pattern(/[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(".*\\S.*[a-zA-z0-9!#$%&'*@()?^]")]]
    });
  }
  ngOnInit() {
    let status = this.route.snapshot.params['status'];
    this.uniqeId = this.route.snapshot.params['uniqeId'];
    if(status) {
      if(status==="invalid") {
        this.notifyErrorMsg=MessageConfig.LOGIN_CONFIG.INVALID_VERIFICATION_LINK;
      }else if(status==="valid") {
        this.notifySuccessMsg= MessageConfig.LOGIN_CONFIG.ACCOUNT_VERIFICATION_SUCCESS;
      }
    }
  }
  
  // For login
  onLogin(loginInfo: any) {
    this.isVerified=true;
    this.errorMessage = '';
    let authObj = {
      username: loginInfo.get('email').value,
      password: loginInfo.get('password').value.trim()
    }

    this.loginService.login(authObj).subscribe((res:any) => {
      if((!res.data['isPasswordReset'] && !res.data['isVerified']) || (!res.data['isPasswordReset'] && !this.uniqeId))  {
        this.router.navigate(['/','reset-password']);
      }else if(!res.data['isPasswordReset']){
        this.router.navigate(['/','reset-password',this.uniqeId]);
      }else if (res.data['role'] === CommonConfig.USER_ADMIN) {
        this.router.navigate(['/', res.data['role'].toLowerCase()]);
      } else if (res.data['role'] === CommonConfig.USER_INSTRUCTOR) {
        this.router.navigate(['/', res.data['role'].toLowerCase()]);
      } else if (res.data['role'] === CommonConfig.USER_SCHOOL) {
        this.router.navigate(['/', res.data['role'].toLowerCase()]);
      } else if (res.data['role'] === CommonConfig.USER_TEACHER) {
        this.router.navigate(['/', res.data['role'].toLowerCase()]);
      } else if (res.data['role'] === CommonConfig.USER_STUDENT) {
        this.router.navigate(['/', res.data['role'].toLowerCase(),'landing']);
      } else {
        this.router.navigate(['/']);
      }
    }, error => {
      if(error.json().type && error.json().type == "NOT VERIFIED") {
        this.isVerified=false;
      }
      this.handleError(error);
    })
  }

  // Handle error
  handleError(error) {
    this.errorMessage = error.json().msg;
    this.messageService.showLoader.emit(false);
    if (error.status === 401) {
      this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, error.json().msg);
      this.loginService.logout();
    }
    else if (error.type ===3 && error.status ===0) {
      this.errorMessage=MessageConfig.PROBLEM_IN_SERVER_CONNECTION;
    } else {
      this.errorMessage=error.json().msg;
    }
  }

}