import { Component, OnInit, ViewContainerRef,Inject} from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonConfig } from './../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../services/common/authentication.service';
import { MessageService } from './../../../../../services/common/message.service';
import { ErrorService } from './../../../../../services/common/error.service';
import { ProjectService } from './../../../../../services/projects/project.service';
import { Config } from "./epics.config";
@Component({
  selector: 'app-epics',
  templateUrl: './epics.component.html',
  styleUrls: ['./epics.component.css'],
  providers: [ ProjectService ]
})

export class EpicsComponent implements OnInit {
  public permissions = [];
  public urlPrefix:string;
  fb: FormBuilder;
  status: any = CommonConfig.STATUS;
  epicId:string;
  projectId:string;
  formEpic: FormGroup;
  epicDescription:any;
  public Config:any=Config;
  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _vcr : ViewContainerRef,
    private messageService: MessageService,
    private errorService: ErrorService,
    private authenticationService : AuthenticationService,
    private projectService : ProjectService,
    ) {
    this.fb = fb;
    this.intializeForm();
  }

  ngOnInit() {
    this.projectId= this.route.snapshot.params.projectId;
    this.epicId= this.route.snapshot.params.epicId;
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES);  
    if(this.epicId) {
      this.getEpicById(this.epicId);
    }
  }

//intialze form
intializeForm(data:any={}):void {
  this.formEpic = this.fb.group({
    epicTitle: [data.epicTitle || '', [Validators.required,Validators.minLength(this.Config.title.minlength[0]),
      Validators.maxLength(this.Config.title.maxlength[0])]],
    statusCheck: [ CommonConfig.STATUS.ACTIVE ]
  });
  this.epicDescription= "";
}

// Save epic 
saveEpic(data : any) {
    if(this.epicDescription==undefined || this.epicDescription==null || this.epicDescription==''){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.required);
    }else if(this.epicDescription.length<=this.Config.description.minlength[0]){
        return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
      } else if (this.epicDescription.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }

  let epicData = {
    title: data.get('epicTitle').value,
    description: this.epicDescription,
    status: CommonConfig.STATUS.ACTIVE,
    projectId: this.projectId
  }
  this.messageService.showLoader.emit(true);
  this.projectService.addEpic(this.projectId,epicData).subscribe((res: any)=> {
    this.messageService.showLoader.emit(false);
    this.messageService.successMessage('Epic', 'Successfully saved',()=> {
      this.router.navigate(['/', this.urlPrefix, 'projects',this.projectId]);
    });
  },(error: any) => {
 this.handleError(error);
  })
}

// update epic data
updateEpic(data : any ){
  if(!this.epicDescription){
    return this.messageService.showErrorToast(this._vcr,"Epic description is required");
  }
  let epicData = {
    title: data.get('epicTitle').value,
    description: this.epicDescription,
    status: data.get('statusCheck').value,
    projectId:this.projectId
  }
  this.messageService.showLoader.emit(true);
  this.projectService.updateEpic(this.projectId,epicData,this.epicId).subscribe((res: any)=> {
    this.messageService.showLoader.emit(false);
    this.messageService.successMessage('Epic', 'Successfully updated',()=> {
      this.router.navigate(['/', this.urlPrefix, 'projects',this.projectId]);
    });
  },(error: any)=> {
   this.handleError(error);
  })
}

// Get epic data for update
getEpicById(epicId: string) {
  this.projectService.fetchEpicDetail(this.projectId,epicId).subscribe((res: any)=> {
    this.messageService.showLoader.emit(false);
    if(res['data'] && res['data'][0]) {
      let epic=res['data'][0];
      this.formEpic = this.fb.group({
        epicTitle: [epic.title, [Validators.required]],
        statusCheck: [epic.status]
      });
      this.epicDescription=epic.description;
    }
  },(error: any)=> {
    this.handleError(error);
  })
}

  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.messageService.showErrorToast(this._vcr,error.json().msg);
    this.errorService.handleError(error, this._vcr);
  }
}
