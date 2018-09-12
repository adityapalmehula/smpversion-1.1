import { Component, OnInit } from '@angular/core';
import { SwitchConfig } from './../../config/switch-config.constants';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {
	public currentApp = SwitchConfig.APP;
	public apps = SwitchConfig.APPS;
  constructor() { }

  ngOnInit() {
  }

}
