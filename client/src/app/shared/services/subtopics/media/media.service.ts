import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../../config/app-config.constants';
import { AuthorizationService } from './../../common/authorization.service';
import { AuthenticationService } from './../../common/authentication.service';


@Injectable()
export class MediaService{

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    private authenticationService : AuthenticationService
    ) { }

   // upload media content
    uploadMedia(mediaData,playListId){
      let headers = new Headers();
        headers.append('enctype', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', this.authenticationService.getToken());
        let options = new RequestOptions({ headers: headers });
    return this.http.post(AppConfig.API_HOST+'/api/media/'+playListId, mediaData, options)
    .map(response=>response.json(),error=>error.json());
    }

         //delete media
    deleteMedia(mediaId:string,subTopicId:string){
      return this.http.delete(AppConfig.API_HOST+'/api/media/'+mediaId+'/'+subTopicId,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }
}