import { Injectable } from '@angular/core';
import { Http  } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'


@Injectable()
export class HelpService {

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
  ) { }

	// Save user help data
	saveHelp(helpData) {
	  return this.http.post(AppConfig.API_HOST+"/api/helps",helpData,this.authorizationService.authorization()).map(data=>{
	    return data.json();
	  }, (error:any)=>
	  error.json());
	}

	// Get all help data
	getHelps() {
	  return this.http.get(AppConfig.API_HOST+"/api/helps", this.authorizationService.authorization()).map(data=>{
	    return data.json();
	  }, (error:any)=>
	  error.json());
	}

	// Get all helps of a student
	getMyHelps() {
	  return this.http.get(AppConfig.API_HOST+"/api/students/myhelps", this.authorizationService.authorization()).map(data=>{
	    return data.json();
	  }, (error:any)=>
	  error.json());
	}

	// Get help data by id
	getHelpById(helpId) {
	  return this.http.get(AppConfig.API_HOST+"/api/helps/"+helpId, this.authorizationService.authorization()).map(data=>{
	    return data.json();
	  }, (error:any)=>
	  error.json());
	}

	// Update help data with reply
	saveReply(helpId, replyData) {
	  return this.http.put(AppConfig.API_HOST+"/api/helps/"+helpId+"/replies", replyData, this.authorizationService.authorization()).map(data=>{
	    return data.json();
	  }, (error:any)=>
	  error.json());
	}

}