import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { PlayerService } from '../../../../shared/services/subtopics/videos/player.service';


@Component({
  selector: 'app-play-content-video',
  templateUrl: './play-content-video.component.html',
  styleUrls: ['./play-content-video.component.css']
})
export class PlayContentVideoComponent implements OnInit {
	private winObj: any;
  private player: any;
  constructor( private playerService: PlayerService, private vcr : ViewContainerRef) {
    this.winObj = window
  }

  ngOnInit() {
  	this.create();
  }
  // Initialize player to play video
  create() {
    return new Promise(resolve => {
      this.playerService._youtubeIframeAPIReady.then(() => {
        let plr = new this.winObj.YT.Player('player', {
          height: '360',
          width: '100%',
          videoId: 'bWPMSSsVdPk',
          playerVars: {
            'rel': 0,
            'autoplay': 1,
            'loop': 1,
            'start': 0,
            'end': 720,
          },
          events: {
   
            'onReady': this.onPlayerReady,
            'onStateChange': this.onPlayerStateChange
          }
        });
          this.player = plr;
      });
    });
  }

  onPlayerStateChange = (event) => {
  }

  onPlayerReady = (event) => {
  }

  // Play video
  playVideo() {
    if (this.player) {
      this.player.destroy()
    }
    this.create();
  }

}
