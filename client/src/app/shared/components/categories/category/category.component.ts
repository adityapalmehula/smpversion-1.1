import { Component, OnInit, Inject,ViewContainerRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonConfig } from './../../../config/common-config.constants';
import { CategoryService } from './../../../services/categories/category.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { AuthenticationService } from '../../../services/common/authentication.service';
import { Config }  from './category.config';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  providers: [CategoryService]
})

export class CategoryComponent implements OnInit {
  permissions= [];
  urlPrefix: String;
  fb: FormBuilder;
  formCategory: FormGroup;
  categoryDescription: any='';
  updateCategoryId: string;
  status : any = CommonConfig.STATUS;
  public backendErrorMsg : any;
  public Config : any=Config;

  constructor(
    @Inject(FormBuilder) fb : FormBuilder,
    private authenticationService : AuthenticationService,
    private messageService : MessageService,
    private router : Router,
    private route : ActivatedRoute,
    private errorService: ErrorService,
    private categoryService : CategoryService,
    private _vcr : ViewContainerRef,
    ) {
    this.fb = fb;
    this.initializeForm();
  }

  ngOnInit() {
    this.updateCategoryId= this.route.snapshot.params.id;
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES); 
    if(this.updateCategoryId) {
      this.getCategoryForUpdate(this.updateCategoryId);
    }
  }

  //intialze form
  initializeForm() {
    this.formCategory = this.fb.group({
      categoryName: 
      ['',
      [ Validators.required,
      Validators.minLength(this.Config.title.minlength[0]),
      Validators.maxLength(this.Config.title.maxlength[0])]
      ],
      statusCheck: [CommonConfig.STATUS.ACTIVE]
    });
    this.categoryDescription='';
  }

  // Save category
  saveCategory(data: any) {
    if(this.categoryDescription.length<=this.Config.description.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
    } else if (this.categoryDescription.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }
    let categoryData = {
      categoryName: data.get('categoryName').value,
      categoryDescription: this.categoryDescription,
      statusCheck: CommonConfig.STATUS.ACTIVE 
    }
    this.messageService.showLoader.emit(true);
    this.categoryService.categoryPost(categoryData)
    .subscribe(data=> {
      this.messageService.showLoader.emit(false);
      if(data['success']) {
        this.messageService.successMessage('Category', 'Successfully saved',()=> {
          this.router.navigate(['/', this.urlPrefix, 'categories']);
        });
      }
    },
    error => {
      this.handleError(error);
    });
  }

  // get category data for update 
  getCategoryForUpdate(id) {
    this.categoryService.getCategory(id)
    .subscribe(category=> {
      if(category) {
        this.messageService.showLoader.emit(false);
        this.categoryDescription=category.description;
        this.formCategory = this.fb.group({
          categoryName: [category.name, [Validators.required]],
          statusCheck: [category.status]
        });
      }
    },error=> {
      this.handleError(error);
    });
  }


  // update category 
  updateCategory(data: any) {
    if(this.categoryDescription.length<=this.Config.description.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
    } else if (this.categoryDescription.length>=this.Config.description.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
    }
    let upadteData = {
      categoryName: data.get('categoryName').value,
      categoryDescription: this.categoryDescription,
      statusCheck: data.get('statusCheck').value, 
    };
    this.messageService.showLoader.emit(true);
    this.categoryService.updateCategory(upadteData, this.updateCategoryId)
    .subscribe(data=> {
      if(data['success']) {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Category', 'Successfully updated',()=> {
          this.router.navigate(['/', this.urlPrefix, 'categories']);
        });
      }
    },error=> {
      this.handleError(error);
    });
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
