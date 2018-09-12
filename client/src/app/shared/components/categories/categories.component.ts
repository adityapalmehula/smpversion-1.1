import { Component, OnInit, Inject, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from './../../services/categories/category.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';
import { CommonConfig } from './../../config/common-config.constants';
import { AuthenticationService } from '../../services/common/authentication.service';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  providers: [CategoryService]
})
export class CategoriesComponent implements OnInit {
  public categoryData: any;
  public errMessage: any;
  public errorMessage: any;
  public formCategory: FormGroup;
  public category: any;
  public colors:any=[];
  public updateCategoryId: any;
  private fb: FormBuilder;
  public permissions = [];
  public urlPrefix : String;
  public dataArray : any;
  public status : any = CommonConfig.STATUS;

  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 8;
  
  @ViewChild('catModalClose') catModalClose: ElementRef;
 
  constructor(
    @Inject(FormBuilder) fb : FormBuilder,
    private categoryService : CategoryService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private router : Router,
    private messageService : MessageService,
    private authenticationService : AuthenticationService,
		) {
    this.fb = fb;
    this.formCategory = fb.group({
      categoryName: ['', [Validators.required]],
      categoryDescription: ['', [Validators.required, Validators.maxLength(300)]],
      statusCheck: [CommonConfig.STATUS.ACTIVE]
    });
  }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.CATEGORIES);
    this.getCategory();
    this.colors = CommonConfig.colors;
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
    this.categoryData = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
  }

  /*pagination logic end here*/
  
  // Get all categories
  getCategory() {
    this.messageService.showLoader.emit(true);
    this.categoryService.categoryGet().subscribe(
      res => {
        this.messageService.showLoader.emit(false);
        this.categoryData=res.data;
        this.dataArray = res.data;
        this.totalItems= this.dataArray.length;
        this.paginationData();
      },
      error => {
        let errMsg = error.json();
        this.errMessage = errMsg.msg;
        this.handleError(error);
      });
  }

  // Save category
  saveCategory(data: any) {
    let categoryData = {
      categoryName: data.get('categoryName').value,
      categoryDescription: data.get('categoryDescription').value,
      statusCheck: data.get('statusCheck').value
    }
     this.messageService.showLoader.emit(true);
    this.categoryService.categoryPost(categoryData).subscribe(
      data => {
        if (data['success']) {
           this.messageService.showLoader.emit(false);
          this.getCategory();
          this.catModalClose.nativeElement.click();
          this.messageService.successMessage('Category', 'Successfully saved');
        }
      },
      error => {
        let errorObj = error.json();
        this.handleError(error);
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;  
        }
      });
  }

  // get category data for update 
  getCategoryForUpdate(id) {
    this.updateCategoryId = id;
    this.category = this.categoryData.filter(data => data._id === this.updateCategoryId);
    this.formCategory = this.fb.group({
      categoryName: [this.category[0].name, [Validators.required]],
      categoryDescription: [this.category[0].description, [Validators.required, Validators.maxLength(300) ]],
      statusCheck: [this.category[0].status]
    });
  }


  // update category 
  updateCategory(data: any) {
    let upadteData = {
      categoryName: data.get('categoryName').value,
      categoryDescription: data.get('categoryDescription').value,
      statusCheck: data.get('statusCheck').value,
    };
    this.messageService.showLoader.emit(true);
    this.categoryService.updateCategory(upadteData, this.updateCategoryId).subscribe(
      data => {
        if (data['success']) {
          this.messageService.showLoader.emit(false);
          this.catModalClose.nativeElement.click();
          this.messageService.successMessage('Category', 'Successfully updated');
          this.getCategory();
        }
      },
      error => {
        let errorObj = error.json();
          this.handleError(error);
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;
        }
      });
  }

  // Delete category
  deleteCategory(categoryId:any){
    this.messageService.deleteConfirmation(()=>{
      this.messageService.showLoader.emit(true);
      return this.categoryService.deleteCategory(categoryId).subscribe(data=>
        { 
          if(data['success'])
          {
            this.messageService.showLoader.emit(false);
             this.getCategory();
            this.messageService.successMessage('Category', 'Successfully Deleted');
          }
        },(error:any)=>{
          this.handleError(error);
             let errorObj = error.json();
              if (errorObj.msg) {
               this.errorMessage = errorObj.msg;   
              }
            });
    });
  }

  // close modal
  closeModal() {
    this.formCategory = this.fb.group({
      categoryName: ['', [Validators.required]],
      categoryDescription: ['', [Validators.required]],
      statusCheck: [CommonConfig.STATUS.ACTIVE]
    });
    this.category = '';
    this.updateCategoryId = '';
  }

  // Handle error
  handleError(error) {
        this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }
}
