import { Injectable, EventEmitter } from '@angular/core';
import swal  from 'sweetalert2';
import { FacebookService, InitParams, UIResponse, UIParams } from 'ngx-facebook';
import { AppConfig } from './../../config/app-config.constants';

@Injectable()
export class FacebookShareService {
  public showLoader: EventEmitter<any> = new EventEmitter();

  constructor( private facebook: FacebookService) {
  }

  //Initialize Facebook sharing parameters
  initFacebook() {
    let initParams: InitParams = {
      appId: AppConfig.FACEBOOK_APP_ID,
      xfbml: true,
      version: AppConfig.FACEBOOK_APP_VERSION
    };
    this.facebook.init(initParams);
  }

  // Share post by Facebook user
  share(callback) {
    const options: UIParams = {
      method: AppConfig.FACEBOOK_METHOD,
      href: AppConfig.FACEBOOK_HREF
    };
    this.facebook.ui(options)
      .then((res: UIResponse) => {
        callback(null, res);
      })
      .catch((error) => {
        callback(error, null);
      });
  }
}
