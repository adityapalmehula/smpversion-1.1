import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Params, Router } from '@angular/router';
import { SubTopicService } from './../../../../../services/subtopics/subtopic.service';
import { AuthenticationService } from '../../../../../services/common/authentication.service';
import { SearchVideoService } from '../../../../../services/subtopics/videos/search-video.service';
import { MessageService } from './../../../../../services/common/message.service';
import { ErrorService } from './../../../../../services/common/error.service';
import { CommonConfig } from './../../../../../config/common-config.constants';

@Component({
	selector: 'app-subtopic-detail',
	templateUrl: './subtopic-detail.component.html',
	styleUrls: ['./subtopic-detail.component.css'],
	providers : [SearchVideoService]
})
export class SubtopicDetailComponent implements OnInit {
	public courseId : String;
	public topicId : String;
	public inputParams= {};
	public urlPrefix : String;
	public subTopicId : any;
	public subTopicData: any=[];
	public subTopicNotes : any = [];
	public subTopicVideos : any = [];
	public subTopicKeyPoints : any = [];
	public subTopicMediaFiles : any = [];
	public subTopicReferences : any = [];
	public errorMessage : any;
	public isDefaultTab : any;
	public loading=false;
	public url : any;
	permissions = [];
	role:string;
	public subTopicOwnerUserId : String;
	CONFIG=CommonConfig;
	public userId : String;
	public courseStatus : String;
	
	constructor(	
		private route: ActivatedRoute,
		// private routeSnaps: ActivatedRouteSnapshot,
		public subTopicService : SubTopicService,
		private errorService:ErrorService,
		private _vcr: ViewContainerRef,
		private authenticationService : AuthenticationService,
		private searchVideoService : SearchVideoService,
		private router : Router,
		private messageService : MessageService
		) { }

	ngOnInit() {
		this.userId= localStorage.getItem("userId");
		if(!this.userId) {
			this.router.navigate(['/']);
		}
		// getting updated learning plan
		this.subTopicService.learningPlanUpdatedEvent.subscribe(() => {
			this.getSubTopicDetail(this.subTopicId);
		},error=>{
			this.handleError(error);
		});
		this.role = this.authenticationService.userRole;
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.SUBTOPICS);
		// this.topicId = sessionStorage.getItem('topic');
		this.courseId= this.route.snapshot.params['courseId'];
		this.topicId= this.route.snapshot.params['topicId'];
		this.subTopicId= this.route.snapshot.params['subtopicId'].split('?')[0];
		this.inputParams['courseId']=this.courseId;
		this.inputParams['topicId']=this.topicId;
		this.inputParams['subtopicId']=this.subTopicId;
		this.getSubTopicDetail(this.subTopicId);

		// Get queryParams from URL
		let queryParams = this.router.parseUrl(this.router.url).queryParams;
		this.isDefaultTab = queryParams.tab;


		if(!this.topicId) {
			this.router.navigate(['/',this.urlPrefix,'courses'])
		}
	}

// Get subtopic details
getSubTopicDetail(subTopicId : any) {
	this.subTopicService.getSubTopic(subTopicId).subscribe(res =>{
		this.subTopicData = res.data;
		this.courseStatus=this.subTopicData.courseStatus;
		if(this.subTopicData.createdBy && this.subTopicData.createdBy.id) {
			this.subTopicOwnerUserId= this.subTopicData.createdBy.id;
		}
		
		this.subTopicService.subTopicDataEvent.emit(res.data);
		// this.messageService.showLoader.emit(true);

		/* Public value to be passed from config. Here this value is passed as static to avoid code error.
		This value refers to type of video i.e. Public/Private 
		Code change required to add video type at time of adding video.
		This will create one problem i.e. while getting videos details currentlly we are passing 
		all video ids at one time. This list can have both public and private videos. 
		So need to filter both type and make separately request videod details*/
		
		this.searchVideoService.getYoutubeVideosDetails(this.subTopicData.videos, 'Public', (videoStats)=>{
			// this.messageService.showLoader.emit(false);
			if(videoStats !== null) {
				videoStats.forEach((videoStat, index) => {
					this.subTopicData.videos[index].statistics = videoStats[index].statistics;
					this.subTopicData.videos[index].contentDetails = videoStats[index].contentDetails;
					let videoDuration = this.searchVideoService.convert_time(this.subTopicData.videos[index].contentDetails.duration);
					this.subTopicData.videos[index].contentDetails.duration = this.searchVideoService.formatTime(videoDuration);
				});
			}
			this.subTopicNotes= this.subTopicData['notes'];
			this.subTopicVideos= this.subTopicData.videos;
			this.subTopicKeyPoints= this.subTopicData.keypoints;
			this.subTopicMediaFiles= this.subTopicData.media;
			this.subTopicReferences= this.subTopicData.references;
		});
	},(error: any) => {
		let errMsg = error.json();
		this.errorMessage = errMsg.msg;
		this.handleError(error);
	});
}

  // Set default tab for contents
  setDefaultTab(defaultTab) {
  	this.isDefaultTab = defaultTab;
  }

  // Event handle to get update data
  handleUpdated(){
  	this.getSubTopicDetail(this.subTopicId);
  }

//naviage to back
navigate() {
	let courseId=sessionStorage.getItem('course');
	let topicId=sessionStorage.getItem('topic');
	this.router.navigate(['/',this.urlPrefix,'courses',courseId,'topics',topicId]);
}

 // Handle error
 handleError(error) {
 	this.messageService.showLoader.emit(false);
 	this.errorService.handleError(error, this._vcr);
 }
}
