import { Component, OnInit, Input, Inject, Output, EventEmitter, OnChanges, ViewContainerRef, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { ReferencesService } from './../../../../../../services/subtopics/references/references.service';
import { CommonConfig } from './../../../../../../config/common-config.constants';
import { AuthenticationService } from '../../../../../../services/common/authentication.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Config} from './references.config';

@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['./references.component.css'],
  providers: [ReferencesService]
})
export class ReferencesComponent implements OnInit {
  @ViewChild('close')close: ElementRef;

  @Input() subTopicReferences;
  @Input() subTopicId;
  @Input() courseStatus;
  @Output() referencesUpdated = new EventEmitter();
  @Input() subTopicOwnerUserId;
  public loading = false;
  public errMessage: any;
  public errorMessage: any;
  private fb: FormBuilder;
  public formReferences: FormGroup;
  public referencesId: any;
  public subTopicReferencesData : any;
  public permissions = [];
  public status : any = CommonConfig.STATUS;
  public referencesOwnerUserId: string;
  CONFIG=CommonConfig;
  public userId : String;
  role:string;
   public cStatus : String;  //courseStatus
   public backendErrorMsg = [];
   public Config : any=Config;



   public totalItems: number = 0;
   public currentPage: number = 1;
   public itemsPerPage: number = 10;
   public dataArray : any;

   constructor(
     @Inject(FormBuilder) fb: FormBuilder,
     private referencesService: ReferencesService,
     private messageService: MessageService,
     private authenticationService : AuthenticationService,
     private errorService: ErrorService,
     private router : Router,
     private _vcr: ViewContainerRef
     ) {
     this.fb = fb;
     this.intializeForm(fb);
   }

   ngOnInit() {
     this.userId= localStorage.getItem("userId");
     if(!this.userId) {
       this.router.navigate(['/']);
     }
     this.role = this.authenticationService.userRole;
     this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.MEDIAFILES);
   }

   //Form initialzation
   intializeForm(fb: FormBuilder, data: any = {}): void {
     this.formReferences = fb.group({
       title: ['',
       [ Validators.required,
       Validators.minLength(this.Config.title.minlength[0]),
       Validators.maxLength(this.Config.title.maxlength[0])]
       ],
       url: [data.url || '', [Validators.required, Validators.pattern(Config.url.pattern[0])]],
       statusCheck: [data.status || CommonConfig.STATUS.ACTIVE]
     });
   }

   ngOnChanges() {
     this.cStatus=this.courseStatus;
     this.referencesOwnerUserId=this.subTopicOwnerUserId
     this.dataArray = this.subTopicReferences;
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
     this.subTopicReferencesData = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
   }
   /*pagination logic end here*/



    // Save References
    saveReferences(data: any) {
      let referencesData = {
        title: data.get('title').value,
        url: data.get('url').value,
        statusCheck: data.get('statusCheck').value
      }
      this.messageService.showLoader.emit(true);
      this.referencesService.saveReferences(referencesData, this.subTopicId).subscribe((res: any) => {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('References', 'Successfully saved');
        this.referencesUpdated.emit();
        this.closeModal();
      }, (error: any) => {
        let errMsg = error.json();
        this.errMessage = errMsg.msg;
        this.handleError(error);
      })
    }

   // Delete References
   delelteReferences(referencesId: any) {
     this.messageService.deleteConfirmation(() => {
       this.messageService.showLoader.emit(true);
       return this.referencesService.deleteReferences(referencesId, this.subTopicId).subscribe(data => {
         if (data['success']) {
           this.messageService.showLoader.emit(false);
           this.messageService.successMessage('References', 'Successfully Deleted');
           this.referencesUpdated.emit();
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

    // Get References data for update
    editReferences(referencesId: any) {
      let editReferencesData = this.subTopicReferencesData.filter((data: any) => data._id === referencesId);
      this.intializeForm(this.fb, editReferencesData[0]);
      this.referencesId = referencesId;
    }

    // update References data 
    updateReferences(data: any) {
      let referencesData = {
        title: data.get('title').value,
        url: data.get('url').value,
        statusCheck: data.get('statusCheck').value,
        referencesId: this.referencesId
      }
      this.messageService.showLoader.emit(true);
      this.referencesService.updateReferences(referencesData).subscribe((res: any) => {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('References', 'Successfully updated');
        this.referencesUpdated.emit();
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
     this.referencesId = '';
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
