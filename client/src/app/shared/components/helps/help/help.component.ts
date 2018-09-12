import { Component, OnInit, Inject, ViewContainerRef} from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../../../services/common/authentication.service';
import { HelpService } from '../../../services/help/help.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
  providers: [HelpService]
})

export class HelpComponent implements OnInit {
  private fb: FormBuilder;
  public helpForm: FormGroup;
  public urlPrefix : String;
  public errorMessage ='';
  public sizeLimit = 1024000;
  public fileTypes = ['pdf','jpg','jpeg','png'];
  public categories = CommonConfig.HELPS.CATEGORIES;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private authenticationService : AuthenticationService,
    private helpService:HelpService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private router: Router,
    private _vcr: ViewContainerRef,
  ) { 
    this.fb = fb;
    this.intializeForm();
  }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  }

  // Intialize forms fields using form builder
  intializeForm() {
    this.helpForm = this.fb.group({
      category: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(900)]],
      attachment: [''],
    })
  }

  onFileChange(event) {
    if(event.target.files.length > 0) {
      let file = event.target.files[0];
      if(file.size > this.sizeLimit)  {
        this.helpForm.get('attachment').setValue('');
        this.errorMessage = CommonConfig.FILE_UPLOAD_ERRORS.SIZE_ERROR+"1 Mb";
      } else if(this.fileTypes.indexOf(file.type.split('/')[1].toLowerCase()) === -1){
        this.errorMessage = CommonConfig.FILE_UPLOAD_ERRORS.TYPE_ERROR;
      } else {
        this.helpForm.get('attachment').setValue(file);
        this.errorMessage = '';
      }
    }
  }

  // Save help request 
  saveHelp(helpForm){
    if (this.errorMessage === '') {
      let formData =new FormData();
      formData.append('category', helpForm.get('category').value);
      formData.append('description', helpForm.get('description').value);
      formData.append('attachment', helpForm.get('attachment').value);
      this.messageService.showLoader.emit(true);
      this.helpService.saveHelp(formData).subscribe((res: any) => {
        this.handleSuccess(res);
        this.router.navigate(['/', this.urlPrefix, 'helps']);
      }, (error)=>{
        this.handleError(error);
      })
    }
  }

  // Handle error
  handleError(error) {
    this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }

  // Handle success
  handleSuccess(res) {
    this.messageService.showLoader.emit(false);
    this.messageService.showSuccessToast(this._vcr, res.msg);
  }

}