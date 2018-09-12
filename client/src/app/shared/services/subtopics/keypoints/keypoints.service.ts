import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../../config/app-config.constants';
import { AuthorizationService } from './../../common/authorization.service'


@Injectable()
export class KeyPointsService{

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }


  //save KeyPoints
    saveKeyPoints(KeyPointsData:any, subTopicId:string){
      return this.http.post(AppConfig.API_HOST+'/api/keypoints/'+subTopicId,KeyPointsData,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }

       //delete KeyPoints
    deleteKeyPoints(KeyPointsId:string,subTopicId:string){
      return this.http.delete(AppConfig.API_HOST+'/api/keypoints/'+KeyPointsId+'/'+subTopicId,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }

       //update KeyPoints
    updateKeyPoints(KeyPointsData : any){
      return this.http.put(AppConfig.API_HOST+'/api/keypoints',KeyPointsData,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }
}