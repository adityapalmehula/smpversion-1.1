import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'


@Injectable()
export class SkillService {

	constructor(
		private http: Http,
		private authorizationService: AuthorizationService,
		){ }

	/* find all skills service for all status */
	findAll(){
		return this.http.get(AppConfig.API_HOST+'/api/skills',this.authorizationService.authorization())
		.map(data=>data.json(),
			(error:any)=>error.json());
	}
	
	/* Get all active skills only */
	listAll(){
		return this.http.get(AppConfig.API_HOST+'/api/skills/list',this.authorizationService.authorization())
		.map(data=>data.json(),
			(error:any)=>error.json());
	}

	/* save skill service request */
	save(data){
		return this.http.post(AppConfig.API_HOST+'/api/skills',data,this.authorizationService.authorization())
		.map(data=>data.json(),
			(error:any)=>error.json());
	}

	/* update skill service request */
	update(data){
		return this.http.put(AppConfig.API_HOST+'/api/skills/',data,this.authorizationService.authorization())
		.map(data=>data.json(),
			(error:any)=>error.json());
	}


	/* delete skills service request */
  deleteRecord(_id) {
  	return this.http.delete(AppConfig.API_HOST+'/api/skills/'+_id, this.authorizationService.authorization())
  	.map(data=>data.json(),
  		(error:any)=>error.json());
  }

}