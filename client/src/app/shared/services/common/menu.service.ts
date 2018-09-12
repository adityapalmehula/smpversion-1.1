import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response} from '@angular/http'
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './authorization.service';


@Injectable()
export class MenuService {
  public menuData: EventEmitter<any> = new EventEmitter();
  public sidebar: EventEmitter<any> = new EventEmitter();
  public menuItems: any;

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }

  // Get User navigation menus
  getMenus(){
    return this.http
    .get(AppConfig.API_HOST + '/api/menus', this.authorizationService.authorization())
    .map(response=>response.json(),error=>error.json());
  }

}
