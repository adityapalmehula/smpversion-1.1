import { Component, OnInit,OnDestroy, ViewChild, ElementRef, ChangeDetectorRef,HostListener,ViewContainerRef} from '@angular/core';
import { PlayerService } from '../../../shared/services/subtopics/videos/player.service';
import { SearchVideoService } from '../../../shared/services/subtopics/videos/search-video.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonConfig } from '../../../shared/config/common-config.constants';
import { AuthenticationService } from './../../../shared/services/common/authentication.service';
import { StudentService } from '../../../shared/services/students/student.service';
import { MessageService } from './../../../shared/services/common/message.service';
import { ErrorService } from './../../../shared/services/common/error.service';
import { MenuService } from './../../../shared/services/common/menu.service';
import { CourseService } from './../../../shared/services/courses/course.service';
import { AssessmentService } from './../../../shared/services/assessments/assessment.service';
import { MessageConfig } from '../../../shared/config/message-config.constants';
import * as $ from'jquery';
declare var Vimeo : any;

@Component({
  selector: 'app-play-contents',
  templateUrl: './play-contents.component.html',
  styleUrls: ['./play-contents.component.css'],
  providers:[StudentService, CourseService, SearchVideoService, AssessmentService],
})

export class PlayContentsComponent implements OnInit,OnDestroy {

  @ViewChild('closeModal') closeModal: ElementRef;

  private winObj: any;
  private player: any;
  public currContentType : any;
  public currContent : any = {};
  public isAutoPlay=true;
  CONFIG:any=CommonConfig;
  public contentType= CommonConfig.CONTENTS;
  public learningProgressStatus= CommonConfig.LEARNING_PROCESS_STATUS;
  public urlPrefix: string;
  public courseId: string;
  public errorMessage: string;
  public courseDetails: any;
  public excel = ['xls','xlsx'];
  public pdf = ['pdf'];
  public image= ['jpg','jpeg','png'];
  public docx= ['docx','doc'];
  public tbs_path=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[3];;
  public mediaPath=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[1];
  public role:string;
  nextTOCIndex:number=0;
  duration:any;
  chapters = [];
  listRef: any;
  oc_listRef: any;
  toc_listRef: any;
  prvSelected: string;
  otherContents: any=[];
  currTopicIndex:number=0;
  currSubtopicIndex:number=0;
  currLpIndex:number=0;

  isCourseCompleted:boolean=false;
  isStartAssessment:boolean=false;
  isAssessmentFinished:boolean=false;
  isShowAssessmentResult:boolean=false;
  isResumeAssessment:boolean=false;
  assessmentResult:any={};

  public tmpVariable="https://smartpathshala.sgp1.digitaloceanspaces.com/css/lesson2.pdf";

  constructor( 
    private router: Router,
    private elRef:ElementRef,
    private _vcr:ViewContainerRef,
    private ref: ChangeDetectorRef,
    private route : ActivatedRoute,
    private menuService: MenuService,
    private errorService: ErrorService,
    private courseService: CourseService,
    private playerService: PlayerService,
    private studentService: StudentService,
    private messageService: MessageService,
    private searchVideoService: SearchVideoService,
    private authenticationService: AuthenticationService,
    private assessmentService: AssessmentService,
    ) {
    this.winObj = window;
  }

  ngOnInit() {
    this.menuService.sidebar.emit({hide:true, contentPage:'playContent'});
    this.role=this.authenticationService.userRole;
    this.urlPrefix= this.authenticationService.userRole.toLowerCase();
    if(this.role!==CommonConfig.USER_STUDENT) {
      this.courseId=this.route.snapshot.params.courseId;
    }else {
      this.courseId=this.route.snapshot.params.id;
    }
    this.getCourseDetails(this.courseId);
  }
  
//get course details
getCourseDetails(courseId: any) {
  if(courseId) {
    this.messageService.showLoader.emit(true);
    let getCourse$=this.studentService.getCourse(this.courseId,'course_details_q2');
    if(this.role!==CommonConfig.USER_STUDENT) {
      getCourse$=this.courseService.getCourseForPerview(this.courseId);
    }
    getCourse$.subscribe(response=> {
      this.messageService.showLoader.emit(false);
      if(response['data']) {
        if(this.role!==CommonConfig.USER_STUDENT) {
          this.courseDetails=response['data'];
        }else {
          this.courseDetails=response['data'];
        }
        this.courseDetails.topics.forEach((topic,t_idx)=> {
          topic.subtopics.forEach((s_topic,s_idx)=> {
            s_topic.learningPaths.forEach((lp,l_idx)=> {
              lp.mainContent['icon']=this.getContentIcon(lp.mainContent.type);
              lp.otherContents.forEach((o_content,oc_idx)=> {
                lp.otherContents[oc_idx]['icon']=this.getContentIcon(o_content.type);
              })
            })
          });
        });
        if(this.courseDetails && this.role==CommonConfig.USER_STUDENT) {
          this.initializeCourseLeraningPath(this.courseDetails);
        }else {
          this.playFirst(this.courseDetails);
        }
      }
    },error=> {
      this.handleError(error);
      if (error.status === 401) {
        this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, error.json().msg);
        this.authenticationService.logout();
      } else{
        this.errorMessage = error.json().msg;
      }
    });
  }
}

// play first content
playFirst(courseDetails:any) {
  if(courseDetails.topics[0] && courseDetails.topics[0].subtopics[0] 
    && courseDetails.topics[0].subtopics[0].learningPaths[0]) {
    this.prvSelected='mc0_0_0';
  courseDetails.topics[0]['show']=true;
  courseDetails.topics[0].subtopics[0]['show']=true;
  let intialLearingPath=courseDetails.topics[0].subtopics[0].learningPaths[0];
  intialLearingPath['show']=true;
  let lpDetials={topicId: courseDetails.topics[0].topicId,subtopicId: courseDetails.topics[0].subtopics[0].subtopicId, lp_id: intialLearingPath._id}
  this.setCurrContentType(intialLearingPath.mainContent,null,lpDetials);
}else {
  this.messageService.showErrorToast(this._vcr,'No data found');
}
}

//calculate content index
calculateContentIndex(items: any) {
  let idx=0;
  let p_idx=this.findIndexByStatus(items,this.learningProgressStatus[0]);
  if(p_idx == 0) {
    return idx;
  }
  if(items.every(data=> data.status == this.learningProgressStatus[2])) {
    return idx;
  }
  idx = this.findIndexByStatus(items,this.learningProgressStatus[1]);
  if(idx == -1) {
    if(p_idx== -1) {
      let temp_items= Object.assign([], items), r_items = temp_items.reverse();
      let c_idx = this.findIndexByStatus(r_items,this.learningProgressStatus[2]);
      if(c_idx > -1 && items[c_idx+1]) {
        idx += 1;
      }
    }else {
      return p_idx;
    }
  }else {
    return idx;
  }
  return idx;
}

//check learning status 
findIndexByStatus(items:any, status:string) {
  return items.findIndex(item=> item.status == status)
}

//initialize course learning on page load
initializeCourseLeraningPath(courseDetails: any) {
  try {
    let topic={},subtopic={},learningPath={};
    let t_idx=this.calculateContentIndex(courseDetails.topics);
    topic=courseDetails.topics[t_idx];
    let s_idx=this.calculateContentIndex(topic['subtopics']);
    subtopic=topic['subtopics'][s_idx];
    let lp_idx=this.calculateContentIndex(subtopic['learningPaths']);
    learningPath=subtopic['learningPaths'][lp_idx];
    this.currTopicIndex=t_idx;
    this.currSubtopicIndex=s_idx;
    this.currLpIndex=lp_idx;
    this.prvSelected=`mc${t_idx}_${s_idx}_${lp_idx}`;
    this.playContent(topic,subtopic,learningPath);
  } catch(err) {
    this.playFirst(courseDetails);
  }
}

//play content
playContent(topic: any,subtopic:any,learningPath:any) {
  let lpDetials={topicId: topic['topicId'],subtopicId: subtopic['subtopicId'], lp_id: learningPath['_id']}
  topic['show']=subtopic['show']=learningPath['show']=true;
  this.setCurrContentType(learningPath['mainContent'],null,lpDetials);
}
//remove select class
removeSelectedClass() {
  this.listRef= document.getElementById(this.prvSelected);
  if(this.listRef) {
    this.listRef.classList.remove('selected');
  }
}

// apply style/ css on selected leraning path
applyStyleSelect(event: any,contentTyp:any) {
  $('.doc-view').scrollTop(0);
  if(document.getElementById('oc-side-bar')) {
    document.getElementById('oc-side-bar').style.display = "none";
  }
  if(contentTyp==="other") {
    this.applyOtherContentStyle(event);
    return;
  }
  if(event && event.target) {
    if(this.listRef) {
      this.listRef.classList.remove('selected');
    }else {
      this.removeSelectedClass();
    }
    this.listRef=event.target.closest('div');
    if(this.listRef) {
      this.listRef.classList.add('selected');
    }
    if(event.target.closest('div') && event.target.closest('div').attributes && event.target.closest('div').attributes.id ) {
      let selector=event.target.closest('div').attributes.id.nodeValue;
      let lpIndexes=selector.substring(2, selector.length).split('_');
      this.currTopicIndex= +lpIndexes[0];
      this.currSubtopicIndex= +lpIndexes[1];
      this.currLpIndex= +lpIndexes[2];
    }
    if(this.oc_listRef) {
      this.oc_listRef.classList.remove('selected');
    }
  }
}

//apply other content style
applyOtherContentStyle(event) {
  if(event && event.target) {
    if(this.oc_listRef) {
      this.oc_listRef.classList.remove('selected');
    }
    this.oc_listRef=event.target.closest('div');
    if(this.oc_listRef) {
      this.oc_listRef.classList.add('selected');
    }
  }
}

//set current content type on click of learning path's main content or other content
setCurrContentType(content:any,event:any=null,lpDetials=null,contentTyp:any=null) {
  if(content.contentId && this.currContent && content.contentId == this.currContent._id) { return }
    this.applyStyleSelect(event,contentTyp);
  this.isCourseCompleted=false;
  this.currContentType=content.type;
  this.isStartAssessment=false;
  this.isAssessmentFinished=false;
  this.currContent={};
  if(content.contentId) {
    this.currContent = content.contentId;
  }else {
    return;
  }
  if(content.type != this.contentType[5]) {
    if(content.type == this.contentType[3]) {
      if(content.contentId && content.contentId.url) {
        this.displayUrlInfo(content.contentId.url);
      }
      return;
    }
    this.messageService.showLoader.emit(false);
    if(lpDetials && this.role==CommonConfig.USER_STUDENT && content.type !== this.contentType[0]) {
      this.updateLearningPathStatus(lpDetials);
    }
    if(content.type === this.contentType[0]) {
      this.setupForVideos(lpDetials);
    }else {
      $(".body-section").css("overflow-y", " unset");
    } 

  }else {
    this.currContent=content;
    this.getStudentAssessmentStatus(content.contentId._id);
    $(".body-section").css("overflow-y", " unset");
    if(lpDetials && this.role==CommonConfig.USER_STUDENT) {
      this.updateLearningPathStatus(lpDetials);
    }
  }
}


//display reference url details
displayUrlInfo(url:string) {
  this.messageService.showLoader.emit(true);
  this.studentService.getUrlDetails({'url': url}).subscribe(res=> {
    this.messageService.showLoader.emit(false);
    if(!res['data'] || !res['data'].urlInfo) {
      return;
    }
    let urlInfo = res['data'].urlInfo;
    if(urlInfo.other) {
      this.currContent['other']= urlInfo.other;
      let pathArray = this.currContent.url.split( '/' );
      let baseUrl =  pathArray[0] + '//' + pathArray[2];
      urlInfo['other']['baseUrl']=baseUrl;
      if(urlInfo.other.icon) {
        if(!urlInfo.other.icon.includes('http')) {
          let iconUrl = this.currContent.other.icon;
          this.currContent['other']['icon']=this.currContent.url+this.currContent.other.icon;
          try {
            pathArray = this.currContent.url.split( '/' );
            this.currContent['other']['icon'] =  pathArray[0] + '//' + pathArray[2] + iconUrl;
          }catch(e) {
            this.currContent['other']['icon']=this.currContent.url+this.currContent.other.icon;
          }
        }else {
          this.currContent['other']['icon']=urlInfo.other.icon;
          return;
        }
      }
      if(urlInfo.other.shortcutIcon) {
        if(!urlInfo.other.shortcutIcon.includes('http')) {
          this.currContent['other']['icon']=baseUrl+urlInfo.other.shortcutIcon;
        }else {
          this.currContent['other']['icon']=urlInfo.other.shortcutIcon;
        }
      }
    }
  },error=> {
    this.handleError(error);
    if (error.status === 401) {
      this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, error.json().msg);
      this.authenticationService.logout();
    } else{
      this.errorMessage = error.json().msg;
    }
  });
}

//set up for video type content
setupForVideos(lpDetials: any) {
  if(this.currContent.source === CommonConfig.SOURCE.YOUTUBE) {
    this.messageService.showLoader.emit(true);
    this.nextTOCIndex=0;
    this.isStartAssessment=false;
    this.searchVideoService.searchDuration(this.currContent.videoId)
    .subscribe(data => {
      this.duration = this.searchVideoService.convert_time(data.items[0].contentDetails.duration);
      this.messageService.showLoader.emit(false);
      if(lpDetials && this.role==CommonConfig.USER_STUDENT) {
        this.updateLearningPathStatus(lpDetials);
      }
      this.currContent['statistics'] = data.items[0] ? data.items[0].statistics :{};
      if(this.currContent.chapters[0]) {
        this.currContent.chapters.forEach(chp=> {
          chp['totalTime']=this.getTime(chp.startTime,chp.endTime);
        });
        this.setupStripVideo(this.nextTOCIndex);
      }
      this.create(this.currContent);
    },error=>{
      this.handleError(error);
      if (error.status === 401) {
        this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, error.json().msg);
        this.authenticationService.logout();
      } else{
        this.errorMessage = error.json().msg;
      }
    })
  } else if(this.currContent.source === CommonConfig.SOURCE.VIMEO) {
    this.create(this.currContent);
    if(lpDetials && this.role==CommonConfig.USER_STUDENT) {
      this.updateLearningPathStatus(lpDetials);
    }
  }
}

//set up for TOC video
setupStripVideo(index:number) {
  this.currContent.startTime = this.currContent.chapters[index].startTime;
  this.currContent.endTime = this.currContent.chapters[index].endTime;
  if(document.getElementById('toc_'+index)) {
    if(this.toc_listRef){
      this.toc_listRef.classList.remove('toc-select');
    }
    this.toc_listRef=document.getElementById('toc_'+index);
    document.getElementById('toc_'+index).classList.add('toc-select');
  }
}

 // set current TOC for current video
 setCurrentTOC(index:number,$event:any=null) {
   if(this.currContent) {
     this.setupStripVideo(index);
     if($event) {
       $("#toclist").toggle();
       this.nextTOCIndex=index;
     }
     if(this.currContent.chapters && this.currContent.chapters[index]) {
       this.messageService.showLoader.emit(true);
       this.create(this.currContent).then(sucess=> {
         this.messageService.showLoader.emit(false);
       }).catch(err=> {
         this.messageService.showLoader.emit(false);
       })
     }
   }
 }

 // Initialize player to play video
 create(data) {
   if(data.source === CommonConfig.SOURCE.VIMEO) {
     if (this.player) {
       this.player.destroy()
     }
     let options = {
       id: data.videoId,
       height: '480',
       width: '890',
       loop: true,
       autoplay: true,
     }
     this.player = new Vimeo.Player(document.getElementById('player'), options);
     this.messageService.showLoader.emit(false);

   } else if(data.source === CommonConfig.SOURCE.YOUTUBE){ 
     if (this.player && this.player.a) {
       this.player.destroy()
     }
     return new Promise(resolve => {
       this.playerService._youtubeIframeAPIReady.then(() => {
         let plr = new this.winObj.YT.Player('player', {
           height: '470',
           width: '95%',
           videoId: this.currContent.videoId,
           playerVars: {
             'rel': 0,
             'autoplay': 1,
             'loop': 1,
             'start': data.startTime || 0,
             'end': data.endTime || this.duration,
           },
           events: {
             'onReady': this.onPlayerReady,
             'onStateChange': this.onPlayerStateChange
           }
         });
         this.player = plr;
         resolve();
       });
     });
   }
 }

//on youtube player state change
onPlayerStateChange = (event) => {
  if(event.data === 0 && this.currContentType === this.contentType[0]) {
    if(this.isAutoPlay)  {
      ++this.nextTOCIndex;
      if (this.currContentType === this.contentType[0] && this.currContent  && this.currContent.chapters[this.nextTOCIndex]) {
        let next_TOC=this.currContent.chapters[this.nextTOCIndex];
        this.setCurrentTOC(this.nextTOCIndex);
      }else {
        this.setContentForPlay();
      }
    }
  }
}
// set  content for play
setContentForPlay() {
  let topic = this.courseDetails.topics[this.currTopicIndex];
  let subtopic = topic.subtopics[this.currSubtopicIndex];
  let learningPath = subtopic.learningPaths[this.currLpIndex];
  this.prvSelected=`mc${this.currTopicIndex}_${this.currSubtopicIndex}_${this.currLpIndex}`;
  this.getContentIndexDetails(topic,subtopic,learningPath);
  topic = this.courseDetails.topics[this.currTopicIndex];
  subtopic = topic.subtopics[this.currSubtopicIndex];
  learningPath = subtopic.learningPaths[this.currLpIndex];
  this.removeSelectedClass();
  if(this.prvSelected==`mc${this.currTopicIndex}_${this.currSubtopicIndex}_${this.currLpIndex}`) {
    setTimeout(()=> this.isCourseCompleted = true, 0);
  }
  this.prvSelected=`mc${this.currTopicIndex}_${this.currSubtopicIndex}_${this.currLpIndex}`;
  this.listRef= document.getElementById(this.prvSelected);
  /*let top=$('.side-bar').height();
  top=$('#cntSidebar')[0].scrollHeight;
  $('.side-bar').animate({ scrollTop: top}, 1000);*/
  this.playContent(topic,subtopic,learningPath);
}

//get content index details
getContentIndexDetails(topic:any,subtopic:any,learningPath:any) {
  if(subtopic.learningPaths.length) {
    let nextIdx=this.currLpIndex+1;
    if(nextIdx < subtopic.learningPaths.length) {
      this.currLpIndex=nextIdx;
    }else {
      this.getSubtopicContentDetails(topic,subtopic);
    }
  }
}

//get subtopic content details
getSubtopicContentDetails(topic:any,subtopic:any) {
  let nextIdx = this.currSubtopicIndex+1;
  if(nextIdx < topic.subtopics.length) {
    this.currSubtopicIndex=nextIdx;
    subtopic = topic.subtopics[this.currSubtopicIndex];
    if(subtopic.learningPaths[0]) {
      this.currLpIndex=0;
    }else {
      this.getSubtopicContentDetails(topic,subtopic);
    }  
  }else {
    this.getTopicContentDetails(topic);
  }
}

//get topic content detials
getTopicContentDetails(topic:any) {
  let nextIdx=this.currTopicIndex+1;
  if(nextIdx < this.courseDetails.topics.length) {
    ++this.currTopicIndex;
    topic=this.courseDetails.topics[this.currTopicIndex];
    if(topic.subtopics[0]) {
      this.currSubtopicIndex=0;
      if(topic.subtopics[0].learningPaths[0]) {
        this.currLpIndex=0;
      }else {
        this.getSubtopicContentDetails(topic,topic.subtopics[0]);
      }
    }else {
      this.getTopicContentDetails(topic);
    }
  }else {
    this.isAutoPlay=false;
  }
}

onPlayerReady = (event) => {

}

//update learingpath status
updateLearningPathStatus(lpDetials: any) {
  let statusDetails= {
    courseId: this.courseId,
    topicId: lpDetials['topicId'],
    subtopicId: lpDetials['subtopicId'],
    learningPathId: lpDetials['lp_id'],
  }
  try {
    let learingPathStaus=this.courseDetails
    .topics.find(t=> t.topicId==lpDetials['topicId'])
    .subtopics.find(s=> s.subtopicId==lpDetials['subtopicId'])
    .learningPaths.find(lp=> lp._id == lpDetials['lp_id']).status;
    if(learingPathStaus==this.learningProgressStatus[2]) { return; }
    this.studentService.updateLearningPathStatus(statusDetails)
    .subscribe(response => {
      this.markCourseStatus(statusDetails);
    },error=> {
      this.handleError(error);
      this.errorMessage = error.msg;
    });
  }catch(error) {
    return;
  }
 /* this.studentService.updateLear3ningPathStatus(statusDetails)
  .subscribe(response => {
  },error=> {
    this.handleError(error);
    if (error.status === 401) {
      this.messageService.errorMessage(MessageConfig.TOKEN_CONFIG.SESSION_TIMEOUT, error.json().msg);
      this.authenticationService.logout();
    } else{
      this.errorMessage = error.json().msg;
    }
  });*/
}

//rotate plus minus icon
rotateExpendIcon(id:string) {
  if(document.getElementById(id) && document.getElementById(id).classList) {
    document.getElementById(id).classList.toggle('fa-minus');
    document.getElementById(id).classList.toggle('fa-plus');
  }
}

//rotate expend and compress icon
rotateExpendAndCompress(id:string) {
  if(document.getElementById(id) && document.getElementById(id).classList) {
    document.getElementById(id).classList.toggle('fa-compress');
    document.getElementById(id).classList.toggle('fa-expand');
  }
}

//get class based on content type
getContentIcon(contentType:string) {
  let contentClass='pl-3 fa'
  switch(contentType) {
    case this.contentType[0]:
    contentClass += ' fa-play-circle-o';
    break;
    case this.contentType[1]:
    contentClass += ' fa-sticky-note-o';
    break;
    case this.contentType[2]:
    contentClass += ' fa-key';
    break;
    case 'keyPoints':
    contentClass += ' fa-key';
    break;
    case this.contentType[3]:
    contentClass += ' fa-external-link';
    break;
    case this.contentType[4]:
    contentClass += ' fa-file-pdf-o';
    break;
    case this.contentType[5]:
    contentClass += ' fa-pencil-square-o';
    break;
    default:
    contentClass += ' fa-hand-o-right';
  }
  return contentClass;
}

// Set next TOC for current video
setNextTOC(index) {
  this.nextTOCIndex = index+1;
}

 //toggle TOC list
 toggleList() {
   $("#toclist").toggle();
 }

// covert second 
getTime(startTime: number, endTime: number) {
  let seconds,minutes,hours;
  let totalSec=endTime-startTime;
  seconds = totalSec % 60;
  minutes = Math.floor(totalSec / 60);
  hours = Math.floor(minutes / 60);
  minutes %= 60;
  hours %= 60;
  let hoursStr=(hours<10)?'0'+hours:hours;
  let minutesStr=(minutes<10)?'0'+minutes:minutes;
  let secondsStr=(seconds<10)?'0'+seconds:seconds;
  return hoursStr+':'+minutesStr+':'+secondsStr;
}

 /* @HostListener('document:click', ['$event'])
  documentClick(event: Event): void {
    if(document.getElementById('toclist')) {
      let cls=Object.keys(document.getElementById('toclist').classList);
      if('show'==document.getElementById('toclist').classList[cls.length-1]) {
        $("#toclist").hide();
      }
    }
  }*/

// on mouse over for reference content
mouseEnterOnRefContent(elRef:any=null, otherContents: any=null) {
  if(document.getElementById('oc-side-bar')) {
    document.getElementById('oc-side-bar').style.display = "block";
    let top;
    if(elRef && elRef.y) {
      top=elRef.y-18;
      if(top>400){
        top-=100;
        document.getElementById('oc-side-bar').style.height = 'calc(100%-'+top+'px)';
      }else {
        document.getElementById('oc-side-bar').style.height = 'auto';
        document.getElementById('oc-side-bar').style.top = top+'px';
      }
    }
  }
  if(otherContents) {
    this.otherContents=[];
    this.otherContents=otherContents;
  }
}

// on mouse enter for reference content
mouseLeaveOnRefContent() {
  if(document.getElementById('oc-side-bar')) {
    document.getElementById('oc-side-bar').style.display = "none";
  }
}

ngOnDestroy() {
  $(".body-section").css("overflow-y", " auto");
  this.menuService.sidebar.emit({hide:false, contentPage:'playContent'});
}

//mark course status
markCourseStatus = (learningStatusInfo)=> {
  let t_index = this.courseDetails.topics.findIndex(t=> t.topicId == learningStatusInfo.topicId);
  if(t_index >= 0) {
    let s_index=this.courseDetails['topics'][t_index].subtopics.findIndex(s=> s.subtopicId == learningStatusInfo.subtopicId);
    if(s_index >= 0) {
      let lp_index=this.courseDetails['topics'][t_index].subtopics[s_index].learningPaths.findIndex(lp=> lp._id == learningStatusInfo.learningPathId);
      if(lp_index >= 0) {
        this.courseDetails['topics'][t_index].subtopics[s_index].learningPaths[lp_index].status= this.learningProgressStatus[2];
        for(let i in this.courseDetails.topics) {
          if(this.courseDetails.topics[i].subtopics && this.courseDetails.topics[i].subtopics.length>0) {
            for(let j in this.courseDetails.topics[i].subtopics) {
              if(this.courseDetails.topics[i].subtopics[j].learningPaths && this.courseDetails.topics[i].subtopics[j].learningPaths.length>0) {
                this.courseDetails.topics[i].subtopics[j].status= this.manageCourseStatus(this.courseDetails.topics[i].subtopics[j].learningPaths,true);
                this.courseDetails.topics[i].subtopics[j].progress= this.calculateSubTopicProgress(this.courseDetails.topics[i].subtopics[j].learningPaths);
              }
            }
            this.courseDetails.topics[i].status= this.manageCourseStatus(this.courseDetails.topics[i].subtopics);
            this.courseDetails.topics[i].progress= this.calculateProgress(this.courseDetails.topics[i].subtopics,'learningPaths');
          }
        }
        this.courseDetails.status=this.manageCourseStatus(this.courseDetails.topics);
        this.courseDetails.progress=this.calculateProgress(this.courseDetails.topics,'subtopics');
      }
    }
  }
}

/*
* calculate subtopics progress
*/
calculateSubTopicProgress(dataArr) {
  let complete = dataArr.filter(data=> data.status === this.learningProgressStatus[2]);
  let progress = (complete.length*100)/dataArr.length;
  if(progress > 0) {
    return progress.toFixed(2);
  }
  return progress;
}

/*
* calculate progress
*/
calculateProgress(items,prop) {
  let itemsToInclude = items.filter(item=> item[prop].length>0);
  let sumProgressCounter= itemsToInclude.reduce((prv,cur)=> {
    return { progress: prv['progress']+cur['progress']};
  },{ progress:0 });
  let progressAvg = sumProgressCounter['progress']/itemsToInclude.length;
  
  if(progressAvg > 0) {
    return progressAvg.toFixed(2);
  }
  return progressAvg;
}

/*
* return calculated status based on leraningPath, topic, subtopic status
*/
manageCourseStatus(dataArr,isUpdateForLPStatus=false) {
  if(!isUpdateForLPStatus) {
    if(dataArr.some(data=> data.status == this.learningProgressStatus[1])) {
      return this.learningProgressStatus[1];
    }
  }
  if(dataArr.some(data=> data.status == this.learningProgressStatus[0]) && dataArr.some(data=> data.status === this.learningProgressStatus[2])) {
    return this.learningProgressStatus[1];
  }
  if(dataArr.every(data=> data.status == this.learningProgressStatus[0])) {
    return this.learningProgressStatus[0];
  }
  if(dataArr.every(data=> data.status == this.learningProgressStatus[2])) {
    return this.learningProgressStatus[2];
  }
}

//on play content previous
playPrevContent() {


}

//on play content next
playNextContent() {

}
//naviagte course details
navigateCourseDetails() {
  if(this.role === CommonConfig.USER_STUDENT) {
    this.router.navigate(['/', this.urlPrefix, 'course-details',this.courseId]);
  }else {
    this.router.navigate(['/', this.urlPrefix, 'courses',this.courseId,'course-preview']);
  } 
}

onLoad(){
  this.messageService.showLoader.emit(false);
}

//load textbook solutions
loadTextBookSolutions(solution: any) {
  if(solution.path) {
    this.currContent={};
    this.currContent.isTextBookSolutions=true;
    this.currContent.type = this.contentType[4];
    this.currContentType = this.contentType[4];
    this.currContent.extension = this.pdf[0];
    this.currContent.path = solution.path;
    this.currContent.title = solution.title || '';
  }
}

// Handle error
handleError(error) {
  this.messageService.showLoader.emit(false);
  this.errorService.handleError(error, this._vcr);
}

//start assessment
startAssessment() {
  this.isStartAssessment=true;
  this.isAssessmentFinished=false;
}

//on assessment finish
finishAssessment(assessment:any) {
  this.isStartAssessment = false;
  if(assessment) {
    this.assessmentResult=null;
    if(assessment.isFinished) {
      this.isAssessmentFinished=true;
    }
    if(assessment.result) {
      this.assessmentResult=assessment.result;
      this.isShowAssessmentResult=true;
    }
  }
  //this.setContentForPlay();
}

//display assessment result
displayAssessmentResult() {
  this.isShowAssessmentResult=true;
}

//get student assessment status 
getStudentAssessmentStatus(assessmentId:string) {
  this.isResumeAssessment=false;
  this.messageService.showLoader.emit(true);
  this.assessmentService.getStudentAssessmentStatus(assessmentId)
  .subscribe(response=> {
    this.messageService.showLoader.emit(false);
    if(response['data'] && response['data']['isIncomplete'] ) {
      this.isResumeAssessment=response['data']['isIncomplete'];
      if(this.isResumeAssessment) {
        this.startAssessment();
      } 
    }
  },err=> this.handleError(err));
}

}