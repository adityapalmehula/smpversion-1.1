import { Injectable } from '@angular/core';
import { AppConfig } from './../../config/app-config.constants';
import { CommonConfig } from './../../config/common-config.constants';
import { MessageConfig } from './../../config/message-config.constants';
import { AuthenticationService } from './authentication.service';
import { MessageService } from './message.service';

@Injectable()
export class ErrorService {

	public errorMessage: string;

  constructor(
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    ) {
  }

// Error handler to be used in all components
handleError(error, _vcr) {
  this.messageService.showLoader.emit(false);
  if (error.status === 401) {
    this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, error.json().msg);
    this.authenticationService.logout();
  }
  else if (error.type ===3 && error.status ===0) {
    this.errorMessage=MessageConfig.PROBLEM_IN_SERVER_CONNECTION;
    this.messageService.showErrorToast(_vcr,this.errorMessage);
  } else {
    if (typeof error !== 'object') {
      error = error.json();
    }
    this.errorMessage=error.json().msg;
    this.messageService.showErrorToast(_vcr,this.errorMessage);
  }
}


/* iterate error to show in all components */
iterateError(error){
  let errorMsg = JSON.parse(error._body);
  let msg = errorMsg.data.map((data)=>{
    return Object.keys(data)[0] + " : "+ data[Object.keys(data)[0]]
  })
  return msg;
}

}
