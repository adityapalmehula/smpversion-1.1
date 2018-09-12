import { Component, OnInit } from '@angular/core';
import { SwitchConfig } from './../../config/switch-config.constants';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {
	public currentApp = SwitchConfig.APP;
	public apps = SwitchConfig.APPS;
  constructor() { }

  ngOnInit() {
  }

}
