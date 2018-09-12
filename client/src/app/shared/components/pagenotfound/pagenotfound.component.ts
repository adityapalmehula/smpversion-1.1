import { Component, OnInit } from '@angular/core';
import { CommonConfig } from './../../config/common-config.constants';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.css']
})
export class PagenotfoundComponent implements OnInit {
  public imgPath=new CommonConfig().STATIC_IMAGE_URL+'page-not-found/1.png';

  constructor() { }

  ngOnInit() {

  }

}
