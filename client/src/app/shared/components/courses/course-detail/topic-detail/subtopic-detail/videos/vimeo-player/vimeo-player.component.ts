import { Component, OnInit, Input } from '@angular/core';

declare var Vimeo : any;

@Component({
  selector: 'app-vimeo-player',
  templateUrl: './vimeo-player.component.html',
  styleUrls: ['./vimeo-player.component.css']
})
export class VimeoPlayerComponent implements OnInit {

	@Input() videoId;
	public options : any;
  constructor() {
  }

  ngOnInit() {
  	// Initialize vimeo player options 
  	this.options = {
      id: this.videoId,
      height: '360',
      width: '360',
      loop: true,
      autoplay: true,
	  }
    let vimeoPlayer = new Vimeo.Player(document.getElementById('vimeoPlayer'), this.options);
  }

}
