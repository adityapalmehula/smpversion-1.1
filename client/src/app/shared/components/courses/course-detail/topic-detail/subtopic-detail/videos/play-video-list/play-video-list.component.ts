import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import { Location } from '@angular/common';
import { VideoService } from '../../../../../../../services/subtopics/videos/video.service';
import { AuthenticationService } from '../../../../../../../services/common/authentication.service';
import { CommonConfig } from '../../../../../../../config/common-config.constants';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';

@Component({
  selector: 'app-play-video-list',
  templateUrl: './play-video-list.component.html',
  styleUrls: ['./play-video-list.component.css'],
  providers: [VideoService]
})
export class PlayVideoListComponent implements OnInit {
	public video : any = { };
	public thumbnail : any;
  public playItemId : any;
  public subTopicId : any;
  // public playListId : any;
  public videoSource : any;
  public videos : any= [];
  public videoDescription:any;
  private videoId : any;
  // public youtubeId='';
  public videoSlide=1;
  public playFlag=0;
  public show = false;
  public role='';
  public redirectTo : string;
  public likes : string;
  public dislikes :string;
  public videoLikedByUser : '';
  public videoDislikedByUser : '';
  public  userName : '';
  public urlPrefix : String;
  public topicId = sessionStorage.getItem('topic');
  public permissions = [];
  public courseId="";

  constructor(
    private videoService : VideoService,
    private errorService: ErrorService,
    private activatedRoute : ActivatedRoute,
    private router: Router,
    private location: Location,
    private authenticationService : AuthenticationService,
    private messageService : MessageService,
    private _vcr: ViewContainerRef
    ) { }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.PLAYLISTS);
    this.userName = JSON.parse(localStorage.getItem('currentUser'))['userName'];
    this.courseId= this.activatedRoute.snapshot.params['courseId'];
    this.topicId= this.activatedRoute.snapshot.params['topicId'];
    this.subTopicId= this.activatedRoute.snapshot.params['subtopicId'];
    // Get queryParams from URL
    let queryParams = this.router.parseUrl(this.router.url).queryParams;
    this.videoId = queryParams.videoId;
    this.videoSource = queryParams.videoSource;

   // this.courseId=sessionStorage.getItem("courseId");
    this.videoData();
  }


  videoData(){
      this.messageService.showLoader.emit(true);
      this.videoService.getSubTopicData(this.subTopicId).subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.videos=res.data.videos;
      this.video = res.data.videos.filter(video=> video.videoId===this.videoId)[0];
      this.thumbnail= this.video.thumbnail;
      this.videoDescription=this.video.description;
      this.likes=this.video.likes.length;
      this.dislikes=this.video.dislikes.length;
      this.videoLikedByUser=this.video.likes.map(video => video.userId===this.userName);
      this.videoDislikedByUser=this.video.dislikes.map(video => video.userId===this.userName);
      this.show = true;
    }, (error) => {
       this.handleError(error);
    });
  }

  playVideo(video)
  {
    this.video=video;
    this.likes=this.video.likes.length;
    this.dislikes=this.video.dislikes.length;
  }

  // Like video section
  like(videoId) {
    let videoDetail={
      videoId:videoId,
    };
   this.messageService.showLoader.emit(true);
    this.videoService.likeVideo(videoDetail).subscribe((res:any)=>{
       this.messageService.showLoader.emit(false);
      this.likes=res.video.likes.length;
      this.dislikes=res.video.dislikes.length;
    }, (error)=>{
    this.handleError(error);
    })
  }

  // Unlike video section
  unLike(videoId) {
    let videoDetail= {
      videoId:videoId,
    };
 this.messageService.showLoader.emit(true);
    this.videoService.unLikeVideo(videoDetail).subscribe((res:any)=>{
      this.messageService.showLoader.emit(false);
      this.likes=res.video.likes.length;
      this.dislikes=res.video.dislikes.length;
    }, (error)=>{
     this.handleError(error);
    })
  }

  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }
}