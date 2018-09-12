import { Component, OnInit, Input, Inject, Output, EventEmitter, OnChanges, ViewContainerRef, ElementRef, ViewChild } from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from './../../../../../../services/common/message.service';
import { KeyPointsService } from './../../../../../../services/subtopics/keypoints/keypoints.service';
import { CommonConfig } from './../../../../../../config/common-config.constants';
import { ErrorService } from '../../../../../../services/common/error.service';
import { AuthenticationService } from '../../../../../../services/common/authentication.service';
import { Config} from './keypoints.config';

@Component({
  selector: 'app-keypoints',
  templateUrl: './keypoints.component.html',
  styleUrls: ['./keypoints.component.css'],
  providers : [KeyPointsService]
})
export class KeypointsComponent implements OnInit, OnChanges {
  @Input() subTopicKeyPoints : any=[];
  @Input() subTopicId;
  @Input() subTopicOwnerUserId;
  @Input() courseStatus;
  @Output() keyPointsUpdated = new EventEmitter();
  @ViewChild('close')close: ElementRef;

  public keyPoints =false;
  public loading = false;
  public errMessage: any;
  public errorMessage: any;
  private fb: FormBuilder;
  public formKeyPoints: FormGroup;
  public keyPointsId: any;
  public subTopicKeyPointsData : any;
  public permissions = [];
  public status : any = CommonConfig.STATUS;
  public descriptionValue: any='';
  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 10;
  public dataArray : any;
  public cStatus : String;  //courseStatus
  public Config : any=Config;
  public descriptionError: any;

  role:string;
  public keyPointsOwnerUserId: string;
  CONFIG=CommonConfig;
  public userId : String;
  public backendErrorMsg = [];

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private keyPointsService: KeyPointsService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr: ViewContainerRef,
    private authenticationService : AuthenticationService,
    private router : Router
    ) {
    this.fb = fb;
    this.intializeForm(fb);
  }
  
 //Form initialzation
 intializeForm(fb: FormBuilder, data: any = {}): void {
   this.formKeyPoints = fb.group({
     title: ['',
     [ Validators.required,
     Validators.minLength(this.Config.title.minlength[0]),
     Validators.maxLength(this.Config.title.maxlength[0])]
     ],
      // description: [data.description || '', [Validators.required]],
      status: [data.status ||CommonConfig.STATUS.ACTIVE]
    });
 }


 ngOnInit() {
   this.userId= localStorage.getItem("userId");
   if(!this.userId) {
     this.router.navigate(['/']);
   }
   this.role = this.authenticationService.userRole;
   this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.KEYPOINTS);
 }

 ngOnChanges() {
   this.cStatus=this.courseStatus;
   this.keyPointsOwnerUserId=this.subTopicOwnerUserId;
   this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.KEYPOINTS);
   this.dataArray=this.subTopicKeyPoints;
   this.totalItems=this.dataArray.length;
   this.paginationData();
 }


 /*pagination logic start here*/
 public setPage(pageNo: number): void {
   this.currentPage = pageNo;
 }

 public pageChanged(event: any): void {
   this.currentPage = event.page;
   this.paginationData();
 }

 paginationData() {
   const indexOfLastItem = this.currentPage * this.itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
   this.subTopicKeyPointsData = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
 }
 /*pagination logic end here*/


  // Save KeyPoints
  saveKeyPoints(data: any) {
    if(this.descriptionValue.length<=this.Config.description.minlength[0]){
      return this.descriptionError=this.Config.description.minlength[1];
    } else if (this.descriptionValue.length>=this.Config.description.maxlength[0]) {
      return this.descriptionError=this.Config.description.maxlength[1];
    } 
    let keyPointsData = {
      title: data.get('title').value,
      description:this.descriptionValue,
      status: data.get('status').value
    }
    this.messageService.showLoader.emit(true);
    this.keyPointsService.saveKeyPoints(keyPointsData, this.subTopicId).subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.messageService.successMessage('KeyPoints', 'Successfully saved');
      this.keyPointsUpdated.emit();
      this.closeModal(); 
    }, (error: any) => {
        // this.messageService.showLoader.emit(false);
        let errMsg = error.json();
        this.errMessage = errMsg.msg;
        this.handleError(error);
      })
  }

  // Delete KeyPoints
  deleltekeyPoints(keyPointsId: any) {
    this.messageService.deleteConfirmation(() => {
      return this.keyPointsService.deleteKeyPoints(keyPointsId, this.subTopicId).subscribe(data => {
        if (data['success']) {
          this.messageService.successMessage('KeyPoints', 'Successfully Deleted');
          this.keyPointsUpdated.emit();
        }
      }, (error: any) => {
        this.handleError(error);
        let errorObj = error.json();
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;
        }
        
      });
    });
  }

  // Get KeyPoints data for update
  editkeyPoints(keyPointsId: any) {
    let editKeyPointsData= this.subTopicKeyPoints.filter((data: any) => data._id === keyPointsId);
    this.intializeForm(this.fb, editKeyPointsData[0]);
    this.descriptionValue=editKeyPointsData[0].description;
    this.keyPointsId = keyPointsId;
  }

  // update KeyPoints data 
  updateKeyPoints(data: any) {
    if(this.descriptionValue.length<=this.Config.description.minlength[0]){
      return this.descriptionError=this.Config.description.minlength[1];
    } else if (this.descriptionValue.length>=this.Config.description.maxlength[0]) {
      return this.descriptionError=this.Config.description.maxlength[1];
    }
    let keyPointsData = {
      title: data.get('title').value,
      description:this.descriptionValue,
      status: data.get('status').value,
      keyPointsId: this.keyPointsId
    }
    this.messageService.showLoader.emit(true);
    this.keyPointsService.updateKeyPoints(keyPointsData).subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      this.messageService.successMessage('keyPoints', 'Successfully updated');
      this.keyPointsUpdated.emit();
      this.closeModal();
    }, (error: any) => {
      let errMsg = error.json();
      this.errMessage = errMsg.msg;
      this.handleError(error);
    })
  }

  // close modal
  closeModal() {
    this.close.nativeElement.click();
    this.intializeForm(this.fb);
    this.keyPointsId = '';
    this.descriptionValue='';
    this.backendErrorMsg=[];
    this.errMessage='';
    this.descriptionError='';
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

