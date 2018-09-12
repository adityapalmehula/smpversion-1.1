import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'

@Injectable()
export class AdminService {
  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) {}

  /* find admin by id*/
  findAdminInfo(){
    return this.http.get(AppConfig.API_HOST + "/api/admins/id",this.authorizationService.authorization())
    .map(data=>data.json(),
      (error:any)=>error.json());
  }
}


