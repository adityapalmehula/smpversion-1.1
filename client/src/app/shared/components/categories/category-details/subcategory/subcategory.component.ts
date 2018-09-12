  import { Component, OnInit, Inject,ViewContainerRef} from '@angular/core';
  import { Router, ActivatedRoute } from '@angular/router';
  import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
  import { CommonConfig } from './../../../../config/common-config.constants';
  import { CategoryService } from './../../../../services/categories/category.service';
  import { MessageService } from './../../../../services/common/message.service';
  import { ErrorService } from './../../../../services/common/error.service';
  import { AuthenticationService } from '../../../../services/common/authentication.service';
  import { Config }  from './subcategory.config';

  @Component({
    selector: 'app-subcategory',
    templateUrl: './subcategory.component.html',
    styleUrls: ['./subcategory.component.css'],
    providers:[ CategoryService ]
  })
  export class SubcategoryComponent implements OnInit {
    public permissions = [];
    public urlPrefix : String;
    categoryId:string;
    updateSubCategoryId:string;
    formSubCategory: FormGroup;
    fb: FormBuilder;
    subCategoryDescription:any='';
    status: any = CommonConfig.STATUS;
    public backendErrorMsg = [];
    public Config : any=Config;


    constructor(
      @Inject(FormBuilder) fb: FormBuilder,
      private route: ActivatedRoute,
      private categoryService: CategoryService,
      private router: Router,
      private messageService: MessageService,
      private errorService: ErrorService,
      private authenticationService : AuthenticationService,
      private _vcr : ViewContainerRef,
      ) { 
      this.fb = fb;
      this.initializeForm();
    }

    ngOnInit() {
      this.categoryId= this.route.snapshot.params.id;
      this.updateSubCategoryId= this.route.snapshot.params.subcatId;
      this.urlPrefix = this.authenticationService.userRole.toLowerCase();
      this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES);  
      if(this.updateSubCategoryId) {
        this.getSubCategoryById(this.updateSubCategoryId);
      }
    }

//intialze form
initializeForm() {
  this.formSubCategory = this.fb.group({
    subCategoryName: ['',
    [ Validators.required,
    Validators.minLength(this.Config.title.minlength[0]),
    Validators.maxLength(this.Config.title.maxlength[0])]
    ],
    statusCheck: [ CommonConfig.STATUS.ACTIVE ]
  });
  this.subCategoryDescription='';
}

//get subcatefory by id
getSubCategoryById(id:string) {
  this.messageService.showLoader.emit(true);
  this.categoryService.getSubCategory(id)
  .subscribe(subCategory=> {
    this.messageService.showLoader.emit(false);
    if(subCategory) {
      this.formSubCategory = this.fb.group({
        subCategoryName: [subCategory.name,
        [ Validators.required,
        Validators.minLength(this.Config.title.minlength[0]),
        Validators.maxLength(this.Config.title.maxlength[0])]
        ],
        subCategoryDescription: [ subCategory.description, [Validators.required , Validators.maxLength(this.Config.description.maxlength[0])]],
        statusCheck: [ subCategory.status ]
      });
      this.subCategoryDescription=subCategory.description;
    }
  },error=> {
    this.handleError(error);
  });
}

// Save Subcategory
saveSubCategory(data:any) {
  if(this.subCategoryDescription.length<=this.Config.description.minlength[0]){
    return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
  } else if (this.subCategoryDescription.length>=this.Config.description.maxlength[0]) {
    return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
  }
  let subCategoryData = {
    name: data.get('subCategoryName').value,
    description: this.subCategoryDescription,
    status: CommonConfig.STATUS.ACTIVE,
    categoryId:this.categoryId
  }
  this.messageService.showLoader.emit(true);
  this.categoryService.saveSubCategories(subCategoryData)
  .subscribe(data=> {
    this.messageService.showLoader.emit(false);
    if (data['success']) {
      this.messageService.successMessage('SubCategory', 'Successfully saved',()=> {
        this.router.navigate(['/', this.urlPrefix, 'categories',this.categoryId]);
      });
    }
  },error=> {
    this.handleError(error);
  });
}

/*// get subcategory for update
getSubCategoryForUpdate(id) {
  this.updateSubCategoryId = id;
  
}*/
    // update category 
    updateSubCategory(data: any) {
      if(this.subCategoryDescription.length<=this.Config.description.minlength[0]){
        return this.messageService.showErrorToast(this._vcr,this.Config.description.minlength[1]);
      } else if (this.subCategoryDescription.length>=this.Config.description.maxlength[0]) {
        return this.messageService.showErrorToast(this._vcr,this.Config.description.maxlength[1]);
      }
      let upadteData = {
        name: data.get('subCategoryName').value,
        description: this.subCategoryDescription,
        status: data.get('statusCheck').value,
        categoryId: this.categoryId
      };
      this.messageService.showLoader.emit(true);
      this.categoryService.updateSubCategory(upadteData,this.updateSubCategoryId)
      .subscribe(data=> {
        if (data['success']) {
          this.messageService.showLoader.emit(false);
          this.messageService.successMessage('Subategory', 'Successfully updated',()=> {
            this.router.navigate(['/', this.urlPrefix, 'categories',this.categoryId]);
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