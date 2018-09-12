import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../shared/services/common/authentication.service';
import { AppConfig } from '../shared/config/app-config.constants';
import { FacebookShareService } from '../shared/services/common/facebookshare.service';

@Component({
  selector: 'app-instructors',
  templateUrl: './instructors.component.html',
  styleUrls: ['./instructors.component.css'],
  providers: [ FacebookShareService ]
})
export class InstructorsComponent implements OnInit {

  constructor(private router : Router,
    private facebookShareService: FacebookShareService,
  	) {
    // Initailze FacebookService method. 
    this.facebookShareService.initFacebook();
  }

  ngOnInit() {
  }
  
  // Share on Facebook by user
  share(){
    this.facebookShareService.share( (error, res) => {
      if(res !== null) {
      } else {
      }
    })
  }
}
