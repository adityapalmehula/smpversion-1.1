import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { RequestOptions, Request, RequestMethod } from '@angular/http';
import { AppConfig } from '../../../config/app-config.constants';
import { CommonConfig } from '../../../config/common-config.constants';
import { AuthorizationService } from '../../common/authorization.service';


@Injectable()
export class SearchVideoService{

  public access_token : any;

	constructor(private http: Http, private router: Router,
     private authorizationService : AuthorizationService) 
	{ }

  // Search public video from youtube
	searchPublicVideosFromYoutube(searchText){
    return this.http.get(AppConfig.YOUTUBE_PUBLIC_SEARCH_API_URL+searchText).map(data=>
		data.json(),
		(error:any)=>{
			error.json();
		})
	}

  // Search private video from youtube
  searchPrivateVideosFromYoutube(searchText){
    return this.http.get(AppConfig.YOUTUBE_PRIVATE_SEARCH_API_URL+searchText, this.authorizationService.setBearerAuthHeader(this.access_token)).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    })
  }

  // Get access token from vimeo
  getAccessToken() {
    return this.http.post(AppConfig.VIMEO_UNAUTHTOKEN_API_URL,{"grant_type":"client_credentials","scope":"public private"}, this.authorizationService.setVimeoBasicAuthHeader()).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    })
  }

  // Search public videos from vimeo
  searchPublicVideosFromVimeo(searchText) {
    return this.http.get(AppConfig.VIMEO_PUBLIC_API_URL + searchText, this.authorizationService.setBearerAuthHeader(this.access_token)).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    })
  }

  // Search private videos from vimeo
  searchPrivateVideosFromVimeo(searchText) {
    return this.http.get(AppConfig.VIMEO_PRIVATE_API_URL + searchText, this.authorizationService.setBearerAuthHeader(this.access_token)).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    })
    /* Call to Smartpathshala Rest API  to make requset from backend to Vimeo API*/
    // return this.http.get(AppConfig.API_HOST+'/api/search/videos?searchText='+searchText, this.authorizationService.authorization()).map(data=>
    // data.json(),
    // (error:any)=>{
    //   error.json();
    // })
  }

  // Search video stats from youtube
  searchVideoData(searchText){
    return this.http.get(AppConfig.YOUTUBE_PUBLIC_SEARCH_API_URL+searchText).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    })
  }

 // Get video statistics from youtube
	searchDuration(youtubeId){
		return this.http.get(AppConfig.YOUTUBE_PUBLIC_VIDEO_API_URL+'&id='+youtubeId).map(data=>
		data.json(),
		(error:any)=>{
			error.json();
		})
	}

	// Get all videos statistics from youtube
  searchYoutubeVideosStats(youtubeIds, videoType){
		if(videoType === CommonConfig.VIDEO_TYPE.PUBLIC) {
      return this.http.get(AppConfig.YOUTUBE_PUBLIC_VIDEO_API_URL+'&id='+youtubeIds)
      .map(data=>
        data.json(),
        (error:any)=>{
        error.json();
      })
    } else if (videoType === CommonConfig.VIDEO_TYPE.PRIVATE) {
      return this.http.get(AppConfig.YOUTUBE_PRIVATE_VIDEO_API_URL+'&id='+youtubeIds, this.authorizationService.setBearerAuthHeader(this.access_token))
      .map(data=>
        data.json(),
        (error:any)=>{
        error.json();
      })
    }
	}

  // Get video statistics from youtube
  getYoutubeVideoDetails(youtubeId, cb) {
    this.searchDuration(youtubeId).subscribe((res) => {
      cb(res.items[0]);
    }, (error) => {
      cb(null);
    });
  }

	// Get all videos statistics from youtube
  getYoutubeVideosDetails(videos, videoType, cb) {
  	let videoIdsString = '';
  	if(typeof videos !== 'string') {
    let videoIdsArray = videos.map((video) => {
      return video.videoId;
    })
    videoIdsString = videoIdsArray.join();
  } else {
  	videoIdsString = videos;
  }
    this.searchYoutubeVideosStats(videoIdsString, videoType).subscribe((res) => {
      cb(res.items);
    }, (error) => {
      cb(null);
    });
  }

  // Sucscribe to youtube channel
  subscribeYoutubeChannel(){
    let data = {
      "snippet":{
        "resourceId":{
          "kind": "youtube#channel",
          "channelId": "UCm8Iqvm-n0A4xPfUsB4CCqQ"
        }
      }
    }
    return this.http.post(AppConfig.YOUTUBE_SUBSCRIPTION_API_URL, data, this.authorizationService.setBearerAuthHeader(this.access_token)).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    })
  }
	// Convert time into number from string
	convert_time(duration) {
    var a = duration.match(/\d+/g);
    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }
    duration = 0;
    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }
    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }
    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration;
    // var h = Math.floor(duration / 3600);
    // var m = Math.floor(duration % 3600 / 60);
    // var s = Math.floor(duration % 3600 % 60);
    //return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
	}

	// Format time into Hours : minutes : seconds
	formatTime(time)
	{   
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;
    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
	}

}




