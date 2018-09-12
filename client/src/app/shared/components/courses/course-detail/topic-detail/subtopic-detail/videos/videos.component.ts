import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../../../../../../services/common/authentication.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ValidationService } from '../../../../../../services/common/validation.service';
import { VideoService } from '../../../../../../services/subtopics/videos/video.service';
import { SearchVideoService } from '../../../../../../services/subtopics/videos/search-video.service';
import { AppConfig } from '../../../../../../config/app-config.constants';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { CommonConfig } from './../../../../../../config/common-config.constants';


@Component({
	selector: 'app-videos',
	templateUrl: './videos.component.html',
	styleUrls: ['./videos.component.css'],
	providers: [VideoService, SearchVideoService]
})
export class VideosComponent implements OnInit, OnChanges {

	@Input('inputParams') inputParams;
	@Input('subTopicVideos') subTopicVideos;
	@Input() subTopicOwnerUserId;
  @Input() courseStatus;
  @Output() videosUpdated = new EventEmitter();
  public subTopicId : string;
  public urlPrefix : String;
  public videoId = '';
  public youtubeId = '';
  public showTOC = false;

  //ng-model variables for toc of video
  public tocContentTitle:string;
  public tocStartTime:number;
  public tocEndTime:number;
  public tocStartTimeShow:String;
  public tocEndTimeShow:String;
  public duration:number=0;
  public rangeValues: number[] = [0,0];
  public viewCount : number;
  public likeCount : number;
  public dislikeCount : number;
  public disabled = true;
  public errMessage : any;
  public errorMessage : any;
  public videos=[];
  role: string;
  public videoOwnerUserId: string;
  CONFIG=CommonConfig;
  public userId : String;
  public cStatus : String;  //courseStatus
  public backendErrorMsg = [];

   constructor(
     private authenticationService : AuthenticationService,
     private videoService : VideoService,
     private errorService: ErrorService,
     private searchVideoService : SearchVideoService,
     private validationService : ValidationService,
     private messageService: MessageService,
     private _vcr: ViewContainerRef,
     private router: Router
     )
   { }

   ngOnInit() {
     this.userId= localStorage.getItem("userId");
     if(!this.userId) {
       this.router.navigate(['/']);
     }
     this.role = this.authenticationService.userRole;
     this.urlPrefix = this.authenticationService.userRole.toLowerCase();
     this.subTopicId = this.inputParams.subtopicId.split('?')[0];
   }

   ngOnChanges(){
     this.cStatus=this.courseStatus;
     this.videoOwnerUserId=this.subTopicOwnerUserId
     this.videos=this.subTopicVideos;
   }

// Set videoId for play video
setVideoId(videoObjId, youtubeId)
{
	this.videoId = videoObjId;
	this.youtubeId = youtubeId;
	this.showTOC = true;
	this.searchVideoService.searchDuration(this.youtubeId).subscribe(data=>{
		let videoObj = data.items[0];
		this.duration=this.searchVideoService.convert_time(videoObj.contentDetails.duration);
		this.viewCount = videoObj.statistics.viewCount;
		this.likeCount = videoObj.statistics.likeCount;
		this.dislikeCount = videoObj.statistics.dislikeCount;
		this.rangeValues = [0, this.duration];
		this.tocStartTime = 0;
		this.tocEndTime =this.duration;
		this.tocStartTimeShow = this.searchVideoService.formatTime(0);
		this.tocEndTimeShow = this.searchVideoService.formatTime(this.duration);
	},error=>{
    this.handleError(error);
  }) 
}

// Section for add toc
addToc(close){
	let tocData={
		title:this.tocContentTitle,
		startTime:this.tocStartTime,
		endTime:this.tocEndTime
	}
	let validationStatus= this.validationService.validationForm(tocData);
	if(!validationStatus) {
		this.messageService.showLoader.emit(true);
		this.videoService.addToc(tocData,this.videoId).subscribe((res: any) => {
			this.messageService.showLoader.emit(false);
			this.messageService.successMessage('Toc', 'Added Successfully');
			close.click();
			this.tocContentTitle = '';
		}, (error: any) => {
			let errMsg = error.json();
			this.errMessage = errMsg.msg;
      this.handleError(error);
    });
	}
	else
	{
		this.errMessage="Please fill all blank field";
	} 			          
}

    // Delete Video from playlist
    deleteVideo(videoId : any){
    	this.messageService.deleteConfirmation(() => {
    		this.messageService.showLoader.emit(true);
    		return this.videoService.deleteVideo	(this.subTopicId, videoId).subscribe(data => {
    			this.messageService.showLoader.emit(false);
    			if (data['success']) {
    				this.messageService.successMessage('Video', 'Successfully Deleted');
    				this.videosUpdated.emit();
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

    handleChange(event) {
    	this.tocStartTime = event.from;
    	this.tocEndTime = event.to;
    	this.tocStartTimeShow = this.searchVideoService.formatTime(event.from);
    	this.tocEndTimeShow = this.searchVideoService.formatTime(event.to);
    }

// Close modal
closeModal() {
	this.showTOC = false;
	this.errMessage="";
}

 // Handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   if(error.status===500) {
     this.backendErrorMsg= this.errorService.iterateError(error);
   } else {
     this.errorService.handleError(error, this._vcr);
   }
 }
}
