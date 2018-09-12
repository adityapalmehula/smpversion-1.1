import  { Injectable } from '@angular/core';
import { RequestOptions, Request, RequestMethod, Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from '../../../config/app-config.constants';
import { AuthorizationService } from '../../common/authorization.service';

@Injectable()

export class PlayerService  {
	
	public winObj : any;
  public _youtubeIframeAPIReady : any;

	constructor(private http:Http,
    private authorizationService : AuthorizationService) {
	this.winObj = window;
  this.autoLoadYouTubeAPI();
	}

  getToken() {
    if(localStorage.getItem('currentUser')){
      let token = JSON.parse(localStorage.getItem('currentUser'))['token'];
      return token;
    } else {
      return false;
    }
  }

// Initialize youtube player API
  autoLoadYouTubeAPI() {
    this._youtubeIframeAPIReady = new Promise(resolve => {
      this.winObj.onYouTubeIframeAPIReady = () => { resolve(); };

      const script = window.document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = window.document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
    });
  }
}
