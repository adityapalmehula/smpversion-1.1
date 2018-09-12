import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../../config/app-config.constants';
import { AuthorizationService } from './../../common/authorization.service'


@Injectable()
export class ReferencesService{

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }


  //save References
    saveReferences(referencesData:any, subTopicId:string){
      return this.http.post(AppConfig.API_HOST+'/api/references/'+subTopicId,referencesData,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }

       //delete References
    deleteReferences(referencesId:string,subTopicId:string){
      return this.http.delete(AppConfig.API_HOST+'/api/references/'+referencesId+'/'+subTopicId,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }

       //update References
    updateReferences(referencesData : any){
      return this.http.put(AppConfig.API_HOST+'/api/references',referencesData,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }
}