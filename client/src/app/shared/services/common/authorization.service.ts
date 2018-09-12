import { Injectable, EventEmitter } from '@angular/core';
import { Http, RequestOptions,Headers, URLSearchParams } from '@angular/http';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../../config/app-config.constants';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { CommonConfig } from './../../config/common-config.constants';

@Injectable()
export class AuthorizationService implements CanActivate {

  public showNavBar: EventEmitter<any> = new EventEmitter();
  public hideNavBar: EventEmitter<any> = new EventEmitter();
  public userRoleChanged: EventEmitter<any> = new EventEmitter();
  public userRole : string;

  constructor(private http: Http, private router: Router, 
    private permissionsService: NgxPermissionsService,
    private roleService: NgxRolesService,
    ) {
  }

  canActivate(){
    if (localStorage.getItem('currentUser')) {
      return this.getUserRole().map((res) =>{
        this.userRole = res.data.userRole;
        this.permissionsService.loadPermissions([this.userRole]);
        this.userRoleChanged.emit(this.userRole);
        this.showNavBar.emit(true);
        return true;        
      },(error)=> {
        return false;
      })
    }else {
      // not logged in so redirect to login page
      this.hideNavBar.emit(true);
      this.router.navigate(['/']);
      return;
    }
  }

  canActivateChild(){
    if (localStorage.getItem('currentUser')) {
      return this.getUserRole().map((res) =>{
        this.userRole = res.data.userRole;
        this.userRoleChanged.emit(this.userRole);
        this.showNavBar.emit(true);
        return true;        
      })
    }
    else {
      // not logged in so redirect to login page
      this.hideNavBar.emit(true);
      this.router.navigate(['/']);
      return;
    }
  }
  
  // Set Platform in request header to track application
  setPlatform(){
    let headers = new Headers({ 'platform': CommonConfig.APP_PLATFORM.WEB });
    return new RequestOptions({ headers: headers });
  }

  authorization(param:any=null) {
    if(!localStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }else {
      let token = JSON.parse(localStorage.getItem('currentUser'))['token'];
      if (token) {
        let headers = new Headers({ 'Authorization': token });
        headers.append('platform',CommonConfig.APP_PLATFORM.WEB)
        if(param) {
          let pararms= this.getParams(param);
          return new RequestOptions({ headers: headers, search: pararms });
        }
        return new RequestOptions({ headers: headers });
      }else{
        this.router.navigate(['/']);
      }
    }
  }

  // set url search parameters
  getParams(param:any) {
    let params: URLSearchParams = new URLSearchParams();
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        let val = param[key];
        if(Array.isArray(val)) {
          val.forEach(v=> {
            params.append(key, v);
          });
        }else {
          params.set(key, val);
        }
      }
    }
    return params;
  }

  setVimeoBasicAuthHeader() {
    let headers = new Headers({ 'Authorization': 'basic ' +AppConfig.VIMEO_UNAUTHTOKEN_AUTHORIZATION_HEADER });
    return new RequestOptions({ headers: headers });
  }

  setBearerAuthHeader(access_token) {
    let headers = new Headers({ 'Authorization': 'Bearer ' + access_token });
    return new RequestOptions({ headers: headers });
  }

  //get user role on page refresh
  getUserRole(){
    return this.http
    .get(AppConfig.API_HOST+'/api/role', this.authorization())
    .map(response=>response.json(),error=>{
      error.json()});
  }

  //get user role on page refresh
  verifyToken(token){
    return this.http
    .get(AppConfig.API_HOST+'/api/auth/verifyToken/'+token,new RequestOptions({ headers: new Headers({ 'platform': 'Web' })}))
    .map((response)=>{
      let token = response.json().data.token;
      let type = JSON.parse(localStorage.getItem('currentUser'))['type'] || '';
      localStorage.setItem('currentUser', JSON.stringify({ token: token, type: type}));
      return response.json()
    },error=>{
      return error.json()});
  }

//update last login date
updateLastloginDate() {
  return this.http.put(AppConfig.API_HOST+'/api/users/lastLoginOn',{}, this.authorization())
  .map(response=>response.json(),error=>error.json()); 
}
}
