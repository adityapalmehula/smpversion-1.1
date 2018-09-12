import { Component, OnInit, Input, ViewContainerRef} from '@angular/core';
import { ActivatedRoute, Route, Params } from '@angular/router';
import { SubTopicService } from './../../shared/services/subtopics/subtopic.service';
import { AuthenticationService } from './../../shared/services/common/authentication.service';
import { AppConfig } from './../../shared/config/app-config.constants'
import { ErrorService } from './../../shared/services/common/error.service';


@Component({
  selector: 'app-topic-playlist-details',
  templateUrl: './topic-playlist-details.component.html',
  styleUrls: ['./topic-playlist-details.component.css'],
  providers: [ SubTopicService ]
})
export class TopicPlaylistDetailsComponent implements OnInit {
  
  public types:any =["Videos","Notes","Keypoints","Media","References" ];
  public playListId: any ;
  public notes:any=[];
  public videos:any=[];
  public references:any=[];
  public keyPoints:any=[];
  public mediaFiles:any=[];
  public quizzes:any=[];
  public errorMessage: string="";
  public urlPrefix: string="";
  public defaultValue=-1;
  public excel = ['xls','xlsx'];
  public pdf = ['pdf'];
  public image= ['jpg','jpeg','png'];
  public docx= ['docx'];
  public playlistDetails : any;
  public courseId : any;
  public contentType='';


  constructor(
    private subTopicService: SubTopicService,
    private authenticationService: AuthenticationService,
    private errorService: ErrorService,
    private route : ActivatedRoute,
    private _vcr: ViewContainerRef
    ) { }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.playListId = this.route.snapshot.params['id'];
    this.getPlaylistDetails(this.playListId);
    this.courseId = sessionStorage.getItem('courseId');
      this.route.queryParams
      .subscribe(
        (params: Params) => {
          let isDefaultTab = params['tab'];
           if(isDefaultTab){
       this.contentType=isDefaultTab;
      } else {
         this.contentType='Videos';
      }
      },(error)=>{
        this.handleError(error);
      });
     
  }

  getPlaylistDetails(playlistId:string) {
    this.subTopicService.getSubTopic(playlistId)
    .subscribe(response=>{
      this.playlistDetails=response['data'];
      if(this.playlistDetails){
        this.notes=this.playlistDetails.notes;
        this.keyPoints=this.playlistDetails.keyPoints;
        this.videos=this.playlistDetails.videos;
        this.mediaFiles=this.playlistDetails.media;
        this.references=this.playlistDetails.references;
      }
    },error=>{
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });

  }

  getContent(index, event){
    this.contentType=this.types[index];
  }

// Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }
}
