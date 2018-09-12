import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges,ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Slider } from 'primeng/components/slider/slider';
import { PlayerService } from '../../../../../../../services/subtopics/videos/player.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';
import { VideoService } from '../../../../../../../services/subtopics/videos/video.service';
import { SearchVideoService } from '../../../../../../../services/subtopics/videos/search-video.service';
import { ValidationService } from '../../../../../../../services/common/validation.service';
import { CommonConfig } from './../../../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../../../services/common/authentication.service';

declare var $: any;
declare var Vimeo : any;

@Component({
  selector: 'app-play-video',
  templateUrl: './play-video.component.html',
  styleUrls: ['./play-video.component.css'],
  providers: [Slider, SearchVideoService]
})

export class PlayVideoComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() inputVideoId;
  @Input() videoObjId;
  @Input() videoData;
  @Input() videoSource;
  // @Input() videoSlide;
  @Input() playFlag;
  @Input() initSource;
  @Input() videos;

  private winObj: any;
  private _youtubeIframeAPIReady: any;
  private player: any;
  private tocPlayer: any;
  private times: any = [];
  public tocData: any = [];
  private startTime: any;
  private endTime: any;
  private startPosition: any;
  private totalWidth: any;
  // private duration : any;
  private endPosition: any;
  private videoId: any;
  public chapters: any=[];
  private video: any = {};
  public thumbnail: any;
  public playItemId: any;
  //public chapterLength: any;
  public change = true;
  public errorMessage: any;
  public tocContentTitle: string;
  public tocStartTime: number;
  public tocEndTime: number;
  public tocStartTimeShow: String;
  public tocEndTimeShow: String;
  public duration: number = 0;
  public rangeValues: number[] = [0, 0];
  public showTOC = false;
  public errMessage: any;
  public tocId: any;
  public videoDetails: any;
  public permissions = [];
  private isAutoPlay: boolean = false;
  private nextVideoData: any;
  private nextVideoId: any;
  private nextVideoIndex: any;
  private currentVideoIndex: any;
  private nextTOCIndex: any;
  private currentTOCIndex: any;
  private nextTOCStartTime: any;
  private nextTOCEndTime: any;

  constructor(private playerService: PlayerService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private videoService: VideoService,
    private errorService: ErrorService,
    private searchVideoService: SearchVideoService,
    private validationService: ValidationService,
    private authenticationService : AuthenticationService,
    private _vcr: ViewContainerRef,
    private ref:ChangeDetectorRef
    ) {
    this.winObj = window;
  }

  ngOnInit() {
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.VIDEOS);
    if(this.videoSource === CommonConfig.SOURCE.YOUTUBE )  {
      this.initializePlayerData('player');
    }
  }

  ngAfterViewInit() {
    if(this.videoSource === CommonConfig.SOURCE.VIMEO )  {
      this.initializePlayerData('vimeoPlayer');
    }
  }

  // Initialize player data with videos information
  initializePlayerData(player) {
    // this.videoDetails = this.videoData;
    if (this.playFlag) {
      if (this.videoObjId !== undefined) {
        // Video to create TOC
        // this.videoId = this.videoObjId;
      } else {
        // this.videoId = this.activatedRoute.snapshot.queryParams["videoId"];
        // this.videoSource = this.activatedRoute.snapshot.queryParams["videoSource"];
      }

      if (this.initSource === 'searchPage') {
        // Video to add to playlist
        this.video.videoId = this.inputVideoId;
        this.video.startTime = 0;
        this.create(player, 1);
      } else {
        this.videoService.getVideoById(this.videoId).subscribe((res: any) => {
          this.video = res.data;
        }, (error) => {
          this.handleError(error);
        });
      }

    } else {
      this.video = this.videoData;
      this.video.videoId = this.inputVideoId;
      if (this.videoData.chapters[0]) {
        this.video.startTime = this.videoData.chapters[0].startTime;
        this.video.endTime = this.videoData.chapters[0].endTime;
        if(this.isAutoPlay && this.videoData.chapters.length > 1){
          this.currentTOCIndex = 0;
          this.setNextTOC(0);
        }
      } else {
        this.video.startTime = 0;
      }
    }

    if(this.videos !== undefined) {

    /* Public value to be passed from config. Here this value is passed as static to avoid code error.
    This value refers to type of video i.e. Public/Private 
    Code change required to add video type at time of adding video.
    This will create one problem i.e. while getting videos details currentlly we are passing 
    all video ids at one time. This list can have both public and private videos. 
    So need to filter both type and make separately request videod details*/

    this.searchVideoService.getYoutubeVideosDetails(this.videos, 'Public', (videoStats) => {
      if (videoStats !== null) {
        videoStats.forEach((videoStat, index) => {
          this.videos[index].statistics = videoStats[index].statistics;
          this.videos[index].contentDetails = videoStats[index].contentDetails;
          let videoDuration = this.searchVideoService.convert_time(this.videos[index].contentDetails.duration);
          this.videos[index].contentDetails.duration = this.searchVideoService.formatTime(videoDuration);
          if (this.videoData._id === this.videos[index]._id) {
            this.videoData.statistics = this.videos[index].statistics;
            this.videoData.contentDetails = this.videos[index].contentDetails;
            this.currentVideoIndex= index;
            if(this.isAutoPlay){
              this.setNextAutoPlayVideo(index);
            }
          }
        });
      }
      this.create(player, 1);
    });
  } else {
    this.create(player, 1);
  }
}

  // Section for add toc
  addToc(close) {
    let tocData = {
      title: this.tocContentTitle,
      startTime: this.tocStartTime,
      endTime: this.tocEndTime
    }
    let validationStatus = this.validationService.validationForm(tocData);
    if (!validationStatus) {
      this.messageService.showLoader.emit(true);
      this.videoService.addToc(tocData, this.videoId).subscribe((res: any) => {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Toc', 'Added Successfully');
        close.click();
        this.getVideoDetailsAfterAction();
        this.onCloseModal();
      }, (error: any) => {
        let errMsg = error.json();
        this.errMessage = errMsg.msg;
        this.handleError(error);
      });
    } else {
      this.errMessage = "Please fill all blank field";
    }
  }


  handleChange(event) {
    this.tocStartTime = event.from;
    this.tocEndTime = event.to;
    this.tocStartTimeShow = this.searchVideoService.formatTime(event.from);
    this.tocEndTimeShow = this.searchVideoService.formatTime(event.to);
  }

  // Play next video in playlist
  // playNextVideo(videoData: any, videoId: any) {
    playVideo() {
    // this.videoData = videoData;
    // this.video = videoData;
    // this.video.videoId = videoId;
    // if (this.video.chapters[0]) {
    //   this.video.startTime = this.video.chapters[0].startTime;
    //   this.video.endTime = this.video.chapters[0].endTime;
    // } else {
    //   this.video.startTime = 0;
    // }
    if (this.player) {

      this.player.destroy()
    }
    this.create('player', 1);
  }

  // setCurrentVideo to play 
  setCurrentVideo(videoData: any, videoId: any, index: any) {
    this.currentVideoIndex= index;
    this.videoData = videoData;
    this.video = videoData;
    this.video.videoId = videoId;
    if (this.video.chapters[0]) {
      this.video.startTime = this.video.chapters[0].startTime;
      this.video.endTime = this.video.chapters[0].endTime;
    } else {
      this.video.startTime = 0;
    }
    if(this.isAutoPlay){
      this.setNextAutoPlayVideo(index);
    }
    if (this.videos.length > index) {
      this.playVideo();
    }
  }

  // If auto play is enabled, set next video to play
  setNextAutoPlayVideo(index) {
    this.nextVideoIndex = index+1;
    if (this.videos[this.nextVideoIndex]) {
      this.nextVideoData = this.videos[this.nextVideoIndex];
      this.nextVideoId = this.nextVideoData.videoId;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.player != undefined) {
      if (changes.videoData !== undefined) {
        this.video = changes.videoData.currentValue;
        this.player.loadVideoById(changes.videoId.currentValue);
        this.chapters = this.video.chapters;
        //this.chapterLength = this.video.chapters.length;
      }
    }
    // this.videoDetails = this.videoData;
  }

  create(player, flag, startTime = this.video.startTime, endTime = this.video.endTime) {
    this.messageService.showLoader.emit(true);

    if(this.videoSource === CommonConfig.SOURCE.VIMEO )
    {
      // Initialize vimeo player options 
      let options = {
        id: this.inputVideoId,
        height: '360',
        width: '360',
        loop: true,
        autoplay: true,
      }
      let vimeoPlayer = new Vimeo.Player(document.getElementById(player), options);
      this.messageService.showLoader.emit(false);

    } else {
      return new Promise(resolve => {
        this.playerService._youtubeIframeAPIReady.then(() => {
          let plr = new this.winObj.YT.Player(player, {
            height: '360',
            width: '100%',
            videoId: this.video.videoId,
            playerVars: {
              'rel': 0,
              'autoplay': 1,
              'loop': 1,
              'start': startTime,
              'end': endTime,
            },
            events: {
              'onReady': this.onPlayerReady,
              'onStateChange': this.onPlayerStateChange
            }
          });
          if (flag === 1) { // Flag 1 for playing video from search and view request
            this.player = plr;
          } else if (flag === 2) { // Flag 2 for playing video to create toc
            this.tocPlayer = plr;
          }
        });
      });
    }
  }

  onPlayerStateChange = (event) => {
    if(event.data === 0) {
      if(this.isAutoPlay)  {
        if (this.video.chapters.length >0 && this.video.chapters[this.nextTOCIndex]) {
          this.setCurrentTOC(this.nextTOCStartTime, this.nextTOCEndTime, this.nextTOCIndex);
        } else {
          this.setCurrentVideo(this.nextVideoData, this.nextVideoId, this.nextVideoIndex);
        }
      }
    }
  }

  onPlayerReady = (event) => {
    this.messageService.showLoader.emit(false);
    this.chapters = this.video.chapters;
    if (this.chapters !== undefined) {
    //  this.chapterLength = this.video.chapters.length;
    }
  }

  // Play next TOC for current video
  playTOC() {
    // this.change = false;
    // this.video.startTime = startTime;
    // this.video.endTime = endTime;
    if (this.player) {
      this.player.destroy()
    }
    this.create('player', 1);
  }
  // Set current TOC for current video
  setCurrentTOC(startTime, endTime, index) {
    this.currentTOCIndex = index;
    this.change = false;
    this.video.startTime = startTime;
    this.video.endTime = endTime;
    if(this.isAutoPlay){
      this.setNextTOC(index);
    }
    if (this.video.chapters.length > index) {
      this.playTOC();
    }
  }

  // Set next TOC for current video
  setNextTOC(index) {
    this.nextTOCIndex = index+1;
    if (this.video.chapters[index+1]) {
      this.nextTOCStartTime = this.video.chapters[this.nextTOCIndex].startTime;
      this.nextTOCEndTime = this.video.chapters[this.nextTOCIndex].endTime;
    }
  }

  // Delete TOC for Video
  deleteToc(videoId, tocId) {
    this.videoId = videoId;
    this.messageService.deleteConfirmation(() => {
      this.messageService.showLoader.emit(true);
      return this.videoService.deleteToc(videoId, tocId).subscribe(data => {
        this.messageService.showLoader.emit(false);
        if (data['success']) {
          this.getVideoDetailsAfterAction();
          this.messageService.successMessage('TOC', 'Deleted Successfully');
        }
      }, (error: any) => {
        let errorObj = error.json();
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;
          this.handleError(error);
        }
        this.handleError(error);
      });
    });
  }

  // Set videoId for play video
  setVideoId(videoObjId, videoId, startTime = 0, endTime = 0) {
    this.videoId = videoObjId;
    this.inputVideoId = videoId;
    this.player.pauseVideo();
    this.showTOC = true;

    this.searchVideoService.searchDuration(this.inputVideoId).subscribe(data => {
      this.duration = this.searchVideoService.convert_time(data.items[0].contentDetails.duration);
      this.rangeValues = [0, this.duration];
      this.tocStartTime = startTime;

      if (endTime === 0) {
        this.tocEndTime = this.duration;
      } else {
        this.tocEndTime = endTime;
      }

      this.tocStartTimeShow = this.searchVideoService.formatTime(this.tocStartTime);
      this.tocEndTimeShow = this.searchVideoService.formatTime(this.tocEndTime);
      if (this.tocPlayer) {
        this.tocPlayer.destroy()
      }
      this.create('tocplayer', 2);
    },error=>{
      this.handleError(error);
    })
  }

  // Get toc data for update
  // video_Id is object id and videoId is video id
  getTocDataForUpdate(video_Id, videoId, tocId) {
    let toc = this.videoData.chapters.filter((data: any) => data._id === tocId);
    this.tocId = toc[0]._id;
    this.tocContentTitle = toc[0].title;
    this.setVideoId(video_Id, videoId, toc[0].startTime, toc[0].endTime);
  }

  // update toc
  updateToc(close) {
    let tocData = {
      title: this.tocContentTitle,
      startTime: this.tocStartTime,
      endTime: this.tocEndTime,
    }
    this.messageService.showLoader.emit(true);
    this.videoService.updateToc(tocData, this.videoId, this.tocId).subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.messageService.successMessage('TOC', 'Updated Successfully');
      close.click();
      this.onCloseModal();
      this.getVideoDetailsAfterAction();
    }, (error: any) => {
      let errMsg = error.json();
      this.errMessage = errMsg.msg;
      this.handleError(error);
    })
  }

  // Get video Touch
  getVideoDetailsAfterAction() {
    this.messageService.showLoader.emit(true);
    this.videoService.getVideoById(this.videoId).subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.videoData = res.data;
      this.videos[this.currentVideoIndex].chapters=res.data.chapters;
      this.chapters = res.data.chapters;
      this.ref.detectChanges();
    }, (error) => {
     this.handleError(error);
    });
  }

  onCloseModal() {
    this.tocContentTitle = '';
    this.tocId = '';
    this.showTOC = false;
    // this.player.playVideo();
    this.errMessage = "";
  }

  // Toggle auto play option
  toggleAutoPlay() {
    this.isAutoPlay = !this.isAutoPlay;
    this.setNextAutoPlayVideo(this.currentVideoIndex);
    this.setNextTOC(this.currentTOCIndex);
  }

  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }
}
