import { Component, OnInit, Inject, Input, OnChanges, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { MediaService } from './../../../../../../services/subtopics/media/media.service';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { AppConfig } from '../../../../../../config/app-config.constants';
import { CommonConfig } from '../../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../../services/common/authentication.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Config} from './media-files.config';

@Component({
  selector: 'app-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.css'],
  providers: [MediaService]
})
export class MediaFilesComponent implements OnInit, OnChanges {
  @Input() subTopicMediaFiles;
  @Input() subTopicId;
  @Input() courseStatus;
  @Output() mediaFileUpdated = new EventEmitter();
  @Input() subTopicOwnerUserId;
  public formData: FormData;
  public mediaTitle='' ;
  public errorMessage: any;
  public loading = false;
  public subtopicsMediaData: any;
  public myFile: any;
  public sizeLimit = 5242880;
  public sizeError: any;
  public fileList: FileList;
  public fileSize: any;
  public fileType: any;
  public fileExtension: any;
  public titleError: any;
  public defaultValue=-1;
  public excel = ['xls','xlsx'];
  public pdf = ['pdf'];
  public image= ['jpg','jpeg','png'];
  public docx= ['docx','doc'];
  public path =AppConfig.API_HOST;
  public permissions =[];
  public mediaPath=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[1];
  public imgPath:string=new CommonConfig().STATIC_IMAGE_URL;
  public fileTypes = ['pdf','jpg','jpeg','png'];
   public cStatus : String;  //courseStatus
   public backendErrorMsg = [];
   public Config : any=Config;



   role:string;
   public mediaOwnerUserId: string;
   CONFIG=CommonConfig;
   public userId : String;


   constructor(
     private mediaService: MediaService,
     private messageService: MessageService,
     private errorService: ErrorService,
     private authenticationService : AuthenticationService,
     private router : Router,
     private _vcr: ViewContainerRef
     ) {}

   ngOnInit() {
     this.userId= localStorage.getItem("userId");
     if(!this.userId) {
       this.router.navigate(['/']);
     }
     this.role = this.authenticationService.userRole;
     this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.MEDIAFILES);
   }

   ngOnChanges() {
     this.cStatus=this.courseStatus;
     this.mediaOwnerUserId=this.subTopicOwnerUserId
     this.subtopicsMediaData = this.subTopicMediaFiles;
   }

  // On change of file input
  fileChange(event) {
    this.fileList = event.target.files;
    this.fileSize = this.fileList[0].size;
    let file = this.fileList[0].type.split('/');
    this.fileType = file[1];
  }

  // for uploading file
  saveMediaFiles(close) {
    this.formData = new FormData();
    if(this.mediaTitle.length<=this.Config.title.minlength[0]){
      return this.titleError= this.Config.title.minlength[1];
    } else if (this.mediaTitle.length>=this.Config.title.maxlength[0]) {
      return this.titleError = this.Config.title.maxlength[1];
    } 
    if (!this.fileSize) {
      this.sizeError = this.Config.file;
      this.titleError = '';
    } else if (this.fileSize > this.sizeLimit) {
      this.sizeError =  CommonConfig.FILE_UPLOAD_ERRORS.SIZE_ERROR+' 5mb';
      this.titleError = '';
    } else if (this.fileTypes.indexOf(this.fileType.toLowerCase()) === -1) {
      this.sizeError = CommonConfig.MEDIA_UPLOAD_ERRORS.TYPE_ERROR;
      this.titleError = '';
    } else {
      let file: File = this.fileList[0];
      this.formData.append(this.mediaTitle, file, file.name);
      // this.loading = true;
      this.messageService.showLoader.emit(true);
      this.mediaService.uploadMedia(this.formData, this.subTopicId).subscribe(
        data => {
          this.messageService.showLoader.emit(false);
          if (data['success']) {
            // this.loading = false;
            this.mediaFileUpdated.emit();
            this.closeModal();
            close.click();
            this.messageService.successMessage('Media file', 'Successfully Saved');
          }
        }, (error: any) => {
          let errorObj = error.json();
          if (errorObj.msg) {
            this.errorMessage = errorObj.msg;
            this.handleError(error);
          }
          this.handleError(error);
        });
    }
  }

  // delete media file
  deleteMedia(mediaId) {
    this.messageService.deleteConfirmation(() => {
      this.messageService.showLoader.emit(true);
      return this.mediaService.deleteMedia(mediaId, this.subTopicId).subscribe(data => {
        this.messageService.showLoader.emit(false);
        if (data['success']) {
          this.messageService.successMessage('Media ', 'Successfully Deleted');
          this.mediaFileUpdated.emit();
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

  // On close modal
  closeModal() {
    this.mediaTitle = '';
    this.myFile = '';
    this.sizeError='';
    this.titleError ='';
    this.backendErrorMsg=[];
    this.errorMessage='';
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
