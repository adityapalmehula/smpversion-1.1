import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from './../../../../services/common/message.service';
import { ErrorService } from './../../../../services/common/error.service';
import { CommonConfig } from './../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../services/common/authentication.service';
import { ProjectService } from './../../../../services/projects/project.service';

@Component({
  selector: 'app-author-project-details',
  templateUrl: './author-project-details.component.html',
  styleUrls: ['./author-project-details.component.css'],
  providers : [ ProjectService ]
})
export class AuthorProjectDetailsComponent implements OnInit {
  public projectId : any;
  public projectData : any = {};
  public urlPrefix : String;
  public permissions =[];
  errMessage:string="";
  CONFIG:any=CommonConfig;
  isDefaultTab:string="";
  userId:string;
  role:string;
  projectOwnerUserId:string;
  stories: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService : ProjectService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService : AuthenticationService,
    ) {
  }

  ngOnInit() {
    this.userId= localStorage.getItem("userId");
    if(!this.userId) {
      this.router.navigate(['/']);
    }
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.role=this.authenticationService.userRole;
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.EPICS);
    this.projectId = this.route.snapshot.params['projectId'].split('?')[0];
    this.projectDetail(this.projectId);
    let queryParams = this.router.parseUrl(this.router.url).queryParams
    this.isDefaultTab = queryParams.tab || 'epics';

  }

  // Set default tab for contents
  setDefaultTab(defaultTab) {
    this.isDefaultTab = defaultTab;
  }
  // Get Course on basis of Id
  projectDetail(projectId : any) {
    this.projectService.getProjectData(projectId).subscribe(res=> {
      if(res['data']) {
        this.projectData = res['data'];
        this.stories = this.projectData.stories;
        if(this.projectData.createdBy && this.projectData.createdBy.id) {
          this.projectOwnerUserId= this.projectData.createdBy.id;
        }
      }
    },error => {
      let errMsg = error.json();
      this.errMessage = errMsg.msg;
      this.handleError(error);
    });
  }

// Save topic 
/*saveTopic(data : any) {
  let topicData = {
    topicTitle: data.get('topicTitle').value,
    topicDescription: data.get('topicDescription').value,
    statusCheck: data.get('statusCheck').value,
    projectId:this.projectId
  }
  this.courseService.addTopic(topicData).subscribe((res: any) => {
    this.messageService.successMessage('Topic', 'Successfully saved');
    this.courseDetail(this.projectId);
    this.closeModal();
  }, (error: any) => {
    let errMsg = error.json();
    this.errMessage = errMsg.msg
  })
}*/

// Get topic data for update
/*getTopicForUpdate(topicId : any) {
  this.topicId=topicId;
  let topicData=this.projectData.topics.filter((data:any) => data._id === this.topicId );
}*/


/*// update topic data
updateTopic(data : any ){
  let topicData = {
    topicTitle: data.get('topicTitle').value,
    topicDescription: data.get('topicDescription').value,
    statusCheck: data.get('statusCheck').value,
    projectId:this.projectId
  }
  this.courseService.updateTopic(topicData,this.topicId).subscribe((res: any) => {
    this.messageService.successMessage('Topic', 'Successfully updated');
    this.courseDetail(this.projectId);
    this.closeModal();
  }, (error: any) => {
    let errMsg = error.json();
    this.errMessage = errMsg.msg
  })
}
*/
deleteEpic(epicId : any ) {
  this.messageService.deleteConfirmation(()=>{
    return this.projectService.deleteEpic(this.projectId,epicId).subscribe(data=> { 
      if(data['success']) {
        this.projectDetail(this.projectId);
        this.messageService.successMessage('Epic', 'Successfully Deleted');
      }
    },(error:any)=>{
      let errorObj = error.json();
      this.handleError(error);
      if (errorObj.msg) {
        this.errMessage = errorObj.msg;
      }
    });
  });
}

  // Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }
}
