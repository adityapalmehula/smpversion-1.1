import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SearchVideoService } from '../../../../../../../services/subtopics/videos/search-video.service';
import { VideoService } from '../../../../../../../services/subtopics/videos/video.service';
import { AuthenticationService } from '../../../../../../../services/common/authentication.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';
import { CommonConfig } from '../../../../../../../config/common-config.constants';
import { MessageConfig } from '../../../../../../../config/message-config.constants';
import { AppConfig } from '../../../../../../../config/app-config.constants';


@Component({
  selector: 'app-search-video',
  templateUrl: './search-video.component.html',
  styleUrls: ['./search-video.component.css'],
  providers:[SearchVideoService, VideoService]
  // providers:[SearchVideoService,ValidationService,PlaylistService]
})
export class SearchVideoComponent implements OnInit {
  public searchForm: FormGroup;
  private fb: FormBuilder;
  public sources : any = CommonConfig.SOURCE;
  public currentSource : any;
  public videoTypes : any = CommonConfig.VIDEO_TYPE;
  // public currVideoType = CommonConfig.VIDEO_TYPE.PUBLIC;
  public showVideoType : boolean = false;
  public videoSearch='';
  public searchResult=[];
  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage:number = 15;
  public dataArr:any=[];
  public maxSize=50;
  public videoId='';
  public videoFlag:number;
  public videoContentTitle='';
  public videoContentDescription='';
  public videoContentUrl='';
  public videoContentThumbnail='';
  public courseId='';
  public topicId='';
  public subTopicId='';
  public pagination:number=0;
  public checkStatus='';
  public videoSlide:number=0;
  public videoStartTime:number=0;
  public videoEndTime : number=0;
  public duration:number=0;
  public rangeValues: number[] = [0,500];
  public urlPrefix: String;
  public errMessage: String;
  public backendErrorMsg = [];
  public searchVideoId :any;


  public setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }

  public pageChanged(event: any): void {
    this.currentPage = event.page;
    this.paginationData();
  }

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute, 
    private searchVideoService : SearchVideoService,
    private authenticationService: AuthenticationService,
    private videoService : VideoService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr: ViewContainerRef
    ) { 
    this.fb = fb;
    this.intializeForm(fb);
  }

  //intialize form 
  intializeForm(fb: FormBuilder) {
    this.searchForm = fb.group({
      source: [CommonConfig.SOURCE.YOUTUBE, [Validators.required]],
      videoType: [CommonConfig.VIDEO_TYPE.PUBLIC, [Validators.required]],
      searchText: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.courseId= this.route.snapshot.params['courseId'];
    this.topicId= this.route.snapshot.params['topicId'];
    this.subTopicId= this.route.snapshot.params['subtopicId'].split('?')[0];
  }

  // Set data to show by pagination
  paginationData(){
    const indexOfLastItem = this.currentPage * this.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
    this.searchResult = this.dataArr.slice(indexOfFirstItem, indexOfLastItem);
  }

  /* Set showVideoType flag. This should be set to true to show video 
  type if source is selected as Vimeo */
  setVideoType(source) {
    if(source === CommonConfig.SOURCE.VIMEO) {
      this.showVideoType = true;
    } else {
      this.showVideoType = false;
    }
  }

  // Search video based on user input
  searchVideo(searchForm : any){
    let access_token ;
    this.dataArr = [];
    this.paginationData();
    let source = searchForm.get('source').value;
    this.currentSource = source;
    let videoType = searchForm.get('videoType').value;
    let searchText = searchForm.get('searchText').value;
    this.totalItems=0;
    this.messageService.showLoader.emit(true);
    if(source === CommonConfig.SOURCE.YOUTUBE) {
      // Commented below code as currently we are not supporting private videos from youtube
      // this.searchVideoFromYoutube(searchText, videoType);
      this.searchVideoFromYoutube(searchText, CommonConfig.VIDEO_TYPE.PUBLIC);
    } else if(source === CommonConfig.SOURCE.VIMEO) {
      this.searchVideoFromVimeo(searchText, videoType);
    }
  }

  // Search Unlisted Video from Youtube
  searchYoutubeUnlistedVideo(searchVideoId){
    this.dataArr = [];
    this.currentSource = CommonConfig.SOURCE.YOUTUBE;
    this.searchVideoService.getYoutubeVideosDetails(searchVideoId, 'Public', (videoStats)=>{
      if(videoStats !== null) {
        this.dataArr = videoStats;
      }
      this.setPagination(CommonConfig.SOURCE.YOUTUBE ,this.dataArr, true);
      this.messageService.showLoader.emit(false);
    });
  }

  // Search video from Vimeo
  searchVideoFromYoutube(searchText, videoType) {
    // Commented below code as currently we are not supporting private videos from youtube
    // if(videoType === CommonConfig.VIDEO_TYPE.PUBLIC) {
      this.searchPublicVideosFromYoutube(searchText, videoType);
    // } else if(videoType === CommonConfig.VIDEO_TYPE.PRIVATE) {
    //   this.searchPrivateVideosFromYoutube(searchText, videoType);
    // }   
  }

  // Get videos details e.g. likes, views, etc.  from youtube
  getVideosDetailsFromYoutube(data, videoType) {
    this.dataArr= data.items;
    let videosIdArray = data.items.map((item) =>{
      return item.id.videoId;
    });

    this.searchVideoService.getYoutubeVideosDetails(videosIdArray.join(), videoType, (videoStats)=>{
      if(videoStats !== null) {
        videoStats.forEach((videoStat, index) => {
          this.dataArr[index].statistics = videoStats[index].statistics;
        });
      }
      this.setPagination(CommonConfig.SOURCE.YOUTUBE ,this.dataArr);
      this.messageService.showLoader.emit(false);
    });
  }

  // Search public videos from Youtube
  searchPublicVideosFromYoutube(searchText, videoType) {
    this.searchVideoService.searchPublicVideosFromYoutube(searchText).subscribe(data=>{
      this.getVideosDetailsFromYoutube(data, videoType);
    },  (error)=>{
      this.handleError(error);
    })
  }

  // Search private videos from Youtube
  searchPrivateVideosFromYoutube(searchText, videoType) {

    let access_token = this.authenticationService.getAccessToken(CommonConfig.TOKEN_TYPE.YUUID);
    if (access_token) {
      this.searchVideoService.access_token = access_token;
      this.searchVideoService.searchPrivateVideosFromYoutube(searchText).subscribe(data=>{
        this.getVideosDetailsFromYoutube(data, videoType);
      },  (error)=>{
        this.handleError(error);
      })
    } else {
      // this.initVimeoOauth(MessageConfig.TOKEN_CONFIG.TOKEN_CONFIRM);
      this.messageService.showLoader.emit(false);
    }
  }

  // Search video from Vimeo
  searchVideoFromVimeo(searchText, videoType) {
    if(videoType === CommonConfig.VIDEO_TYPE.PUBLIC) {
      this.searchPublicVideosFromVimeo(searchText);
    } else if(videoType === CommonConfig.VIDEO_TYPE.PRIVATE) {
      this.searchPrivateVideosFromVimeo(searchText);
    }   
  }

  // Search public videos from Vimeo
  searchPublicVideosFromVimeo(searchText) {
    this.searchVideoService.getAccessToken().subscribe((data) => {
      this.searchVideoService.access_token = data.access_token;
      this.searchVideoService.searchPublicVideosFromVimeo(searchText).subscribe((res) => {
        this.setPagination(CommonConfig.SOURCE.VIMEO ,res.data);
        this.messageService.showLoader.emit(false);
      },
      (error) => {
        this.handleError(error);
      });
    },
    (error) => {
      this.handleError(error);
    });
  }

  // Search private videos from Vimeo
  searchPrivateVideosFromVimeo(searchText) {
    let access_token = this.authenticationService.getAccessToken(CommonConfig.TOKEN_TYPE.VUUID);
    if (access_token) {
      this.searchVideoService.access_token = access_token;
      this.searchVideoService.searchPrivateVideosFromVimeo(searchText).subscribe((res) => {
        this.setPagination(CommonConfig.SOURCE.VIMEO ,res.data);
        this.messageService.showLoader.emit(false);
      },
      (errRes) => {
        this.initVimeoOauth(errRes.json().error);
        this.handleError(errRes);
      });
    } else {
      this.initVimeoOauth(MessageConfig.TOKEN_CONFIG.TOKEN_CONFIRM);
      this.messageService.showLoader.emit(false);
    }
  }

  // Init Vimeo oauth 
  initVimeoOauth(tokenMessage){
    this.messageService.tokenConfirmation(tokenMessage, () => {
      this.oauthSignIn(CommonConfig.SOURCE.VIMEO);
    }, () => {
      this.messageService.showLoader.emit(false);
    });
  }

  // Set pagination data
  setPagination(videoSource, data, isUnlisted?:boolean) {
    this.dataArr= this.setSearchData(videoSource, data, isUnlisted);
    this.paginationData();
    this.totalItems=this.dataArr.length;
    this.pagination=1;
  }

  // Set flags and variables to play video in modal
  setVideoInfo(video){
    this.videoId=video.videoId;
    this.videoFlag=1;
    this.videoSlide=0;
    this.videoContentTitle=video.title;
    this.videoContentDescription=video.description;
    this.videoContentUrl = video.url;
    this.videoContentThumbnail = video.thumbnail;
  }

  // Close video play modal
  closeModal(){
    this.videoId='';
    this.videoFlag=0;
    this.backendErrorMsg=[];
  }

// Save video to database
onSaveVideoContent(close) {
  let data = {
    subTopicId: this.subTopicId,
    videoContent: {
      videoId : this.videoId,
      title: this.videoContentTitle,
      description: this.videoContentDescription,
      url: this.videoContentUrl,
      thumbnail : this.videoContentThumbnail,
      source : this.currentSource
    },
  };
  this.messageService.showLoader.emit(true);
  this.videoService.addVideoContent(data).subscribe((res: any) => {
    if(res.success) {
      this.messageService.showLoader.emit(false);
      close.click();
      this.messageService.successMessage('Video', 'Added Successfully');
      this.router.navigate(['/', this.urlPrefix, 'courses', this.courseId, 'topics', this.topicId, 'subtopics', this.subTopicId],
        { queryParams: {'tab': 'videos'}});
    }
  }, (error: any) => {
    this.handleError(error);
  })
}

handleChange(event) {
  this.videoStartTime = event.from;
  this.videoEndTime = event.to;
}

  // Set data properties of video search results from youtube/vimeo
  setSearchData(source, data, isUnlisted?:boolean) {
    let searchObj = {
      thumbnail : '',
      videoId : '',
      title : '',
      description : '',
      publishedAt : '',
      viewCount : '',
      channelTitle : '',
      url : '',
    }
    if(source === CommonConfig.SOURCE.YOUTUBE){
      let dataItems =[];
      data.map((item)=>{
        if (isUnlisted) {
          searchObj = {
            thumbnail : item.snippet.thumbnails.medium.url,
            videoId : item.id,
            title : item.snippet.title,
            description : item.snippet.description || 'No description found',
            publishedAt : item.snippet.publishedAt,
            viewCount : item.statistics.viewCount,
            channelTitle : item.snippet.channelTitle,
            url : 'https://www.youtube.com/watch?v='+item.id,
          }
        } else {
          searchObj = {
            thumbnail : item.snippet.thumbnails.medium.url,
            videoId : item.id.videoId,
            title : item.snippet.title,
            description : item.snippet.description || 'No description found',
            publishedAt : item.snippet.publishedAt,
            viewCount : item.statistics.viewCount,
            channelTitle : item.snippet.channelTitle,
            url : 'https://www.youtube.com/watch?v='+item.id.videoId,
          }
        }
        
        dataItems.push(searchObj);
      })
      return dataItems;
    } else if(source === CommonConfig.SOURCE.VIMEO){
      let dataItems =[];
      data.map((item)=>{
        searchObj = {
          thumbnail : item.pictures ? item.pictures.sizes[2].link : '',
          videoId : item.uri.substring(item.uri.lastIndexOf("/")+1),
          title : item.name,
          description : item.description || 'No description found',
          publishedAt : item.release_time,
          viewCount : item.metadata.connections.likes.total,
          channelTitle : item.user.name,
          url : item.link,
        }
        dataItems.push(searchObj);
      })
      return dataItems;
    }
  }
  // // Search video on press Enter
  // handleKeyDown(event :any) {
  //   if (event.keyCode == 13)  {
  //     this.searchVideo(this.searchForm);
  //   }
  // }

   /*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
 oauthSignIn(oauthType) {
   sessionStorage.setItem('redirect_uri', this.location.path());
   if (oauthType === CommonConfig.SOURCE.YOUTUBE) {

      // Create <form> element to submit parameters to OAuth 2.0 endpoint.
      let form = document.createElement('form');
      form.setAttribute('method', 'GET'); // Send as a GET request.
      form.setAttribute('action', AppConfig.YOUTUBE_OAUTH2ENDPOINT);

      // Parameters to pass to OAuth 2.0 endpoint.
      let params = {
        'client_id': AppConfig.YOUTUBE_CLIENT_ID,
        'redirect_uri': AppConfig.YOUTUBE_REDIRECT_URI,
        'response_type': 'token',
        'scope': AppConfig.YOUTUBE_SCOPE,
        'include_granted_scopes': 'true',
        'state': 'pass-through value'
      };

      // Add form parameters as hidden input values.
      for (let p in params) {
        let input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
      }

      // Add form to page and submit it to open the OAuth 2.0 endpoint.
      document.body.appendChild(form);
      form.submit();     
    } else if (oauthType === CommonConfig.SOURCE.VIMEO) {
      let anchor = document.createElement('a');
      anchor.setAttribute('href', AppConfig.VIMEO_OAUTH_START_URL);
      anchor.click();
    }
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
