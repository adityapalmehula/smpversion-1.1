import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

import { CartService } from './../../services/cart/cart.service';
import { CommonConfig } from './../../config/common-config.constants';
import { MessageService } from './../../services/common/message.service';
import { MessageConfig } from './../../config/message-config.constants';
import { AuthenticationService } from './../../services/common/authentication.service';
import { ErrorService } from './../../services/common/error.service';
import { AppConfig } from './../../config/app-config.constants';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [CartService]
})
export class CartComponent implements OnInit {
	public errorMessage: any;
	public urlPrefix: any;
  public role : String;
  public cart : any;
  public token : String;
  public apiHost = AppConfig.API_HOST;


  constructor(
  	private router: Router,
    private cartService: CartService,
		private messageService: MessageService,
		private authenticationService: AuthenticationService,
    private errorService: ErrorService,
  	private _vcr : ViewContainerRef,
  	) { 
  	this.token = this.authenticationService.getToken();
  }

  ngOnInit() {
    this.role = this.authenticationService.userRole;
  	 if(this.role=== CommonConfig.USER_STUDENT) {
      this.getMycart();
    }
  }

  //fetch user cart details
  getMycart(){
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  	this.errorMessage='';
  	this.messageService.showLoader.emit(true);
  	this.cartService.getMycart().subscribe((res: any) => {
  		this.messageService.showLoader.emit(false);
  		this.cart = res.data;
  	},error => {
  		this.handleError(error);
  	});
  }
  
  // Handle error
  handleError(error) {
  	this.errorMessage = error.json().msg;
    this.errorService.handleError(error, this._vcr);
  }
}
