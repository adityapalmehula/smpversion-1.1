import  { Injectable } from '@angular/core';
import { RequestOptions, Request, RequestMethod, Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from '../../../config/app-config.constants';
import { AuthorizationService } from '../../common/authorization.service';


@Injectable()

export class VideoService  {

	constructor(private http:Http,
    private authorizationService : AuthorizationService) {	
	}

  // call post method to save video document
  addVideoContent(data) {
    return this.http.post(AppConfig.API_HOST+'/api/videos', data, this.authorizationService.authorization()).map(data =>
      data.json(),
      (error: any) => {
        error.json();
      });
  }

  // Get video details with concepts to play
  getVideoById(videoId: any) {
    return this.http.get(AppConfig.API_HOST + '/api/videos/'+ videoId,this.authorizationService.authorization()).map((response : Response) => {
      return response.json();
    });
  }

  // Delete Video from playlist
  deleteVideo(playlistId: any, videoId: any) {
  	 return this.http.delete(AppConfig.API_HOST+'/api/videos/'+videoId+'/'+playlistId,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
  }

  // Get all videos for selected playlist
  getSubTopicData(subTopicId){
    return this.http.get(AppConfig.API_HOST+'/api/subtopics/subTopicId/'+subTopicId, this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

  // like video 
  likeVideo(videoDetail) {
    return this.http.put(AppConfig.API_HOST+'/api/videos/like',videoDetail,this.authorizationService.authorization())
    .map(response=>response.json(),error=>error.json());
  }  

  // like video
  unLikeVideo(videoDetail) {
    return this.http.put(AppConfig.API_HOST+'/api/videos/unLike',videoDetail,this.authorizationService.authorization())
    .map(response=>response.json(),error=>error.json());
  }

  //Add toc to video
  addToc(data,tocVideoId) {
      return this.http.post(AppConfig.API_HOST+'/api/videos/'+tocVideoId+'/addtoc', data, this.authorizationService.authorization()).map(data =>
        data.json(),
        (error: any) => {
          error.json();
        })
    }

    // update Toc
    updateToc(tocData,videoId,tocId) {
    	 return this.http.put(AppConfig.API_HOST+'/api/videos/'+videoId+'/toc/'+tocId,tocData,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }

    //delete Toc
    deleteToc(videoId:string,tocId:string){
      return this.http.delete(AppConfig.API_HOST+'/api/videos/'+videoId+'/toc/'+tocId,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }
}
