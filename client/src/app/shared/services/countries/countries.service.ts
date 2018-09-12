import { Injectable, EventEmitter } from '@angular/core';
import { Http,  Response, Headers, RequestOptions  } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { CommonConfig } from './../../config/common-config.constants';
import { AuthorizationService } from './../common/authorization.service'
import { AuthenticationService } from './../../services/common/authentication.service';



@Injectable()
export class CountrieService {
  public updateProfile: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    private autenticationService: AuthenticationService,
    ) {}
 

 getCountries(){
   return this.http.get(AppConfig.API_HOST + "/api/country",this.authorizationService.authorization()).map(data=>{
    return data.json();
  })
 }

}