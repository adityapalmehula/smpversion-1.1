import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'


@Injectable()
export class CartService {

	constructor(
		private http: Http,
		private authorizationService: AuthorizationService,
		){ }

	/* find all skills service for all status */
	getMycart(){
		return this.http.get(AppConfig.API_HOST+'/api/carts/mycart',this.authorizationService.authorization())
		.map(data=>data.json(),
			(error:any)=>error.json());
	}
	
}