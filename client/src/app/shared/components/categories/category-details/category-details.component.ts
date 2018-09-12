import { Component, OnInit, Inject, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from './../../../services/categories/category.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { AuthenticationService } from '../../../services/common/authentication.service';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css'],
  providers: [CategoryService]
})
export class CategoryDetailsComponent implements OnInit {
  public categoryId: any;
  public subCategory: any;
  public categoryData: any=[];
  public subCategories: any;
  public errMessage: any;
  public updateSubCategoryId :any;
  public errorMessage: any;
  public colors : any = [];
  private fb: FormBuilder;
  public formSubCategory: FormGroup;
  @ViewChild('catModalClose') catModalClose: ElementRef;
  public urlPrefix : String;
  public dataArray : any;
  public status : any = CommonConfig.STATUS;


  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 8;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private router: Router,
    private messageService: MessageService,
    private authenticationService : AuthenticationService

  ) {
    this.fb = fb;
    this.formSubCategory = fb.group({
      subCategoryName: ['', [Validators.required]],
      subCategoryDescription: ['', [Validators.required,Validators.maxLength(300)]],
      statusCheck: [CommonConfig.STATUS.ACTIVE]
    });
  }

  ngOnInit() {
     this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.categoryId = this.route.snapshot.params['id'];
    this.categoryDetail(this.categoryId);
    this.getSubCategories(this.categoryId);
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
    this.subCategories = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
  }

  /*pagination logic end here*/

  // On component load Get category details
  categoryDetail(categoryId) {
    this.messageService.showLoader.emit(true);
    this.categoryService.getCategory(this.categoryId).subscribe(
      data => {
        this.messageService.showLoader.emit(false);
        this.categoryData = data;
      },
      error => {
         this.handleError(error);
      let errorObj = error.json();
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;      
        }
        });
  }

// Get SUbcategories on basis of category id
  getSubCategories(categoryId) {
    this.messageService.showLoader.emit(true);
    this.categoryService.getSubCategories(this.categoryId).subscribe(
      data => {
        this.messageService.showLoader.emit(false);
         this.dataArray =data;
        this.totalItems= this.dataArray.length;
        this.paginationData();
      },
      error => {  
      let errorObj = error.json();
      this.handleError(error);
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;
        }
        });
  }

  // Save Subcategory
  saveSubCategory(data: any) {
    let subCategoryData = {
      name: data.get('subCategoryName').value,
      description: data.get('subCategoryDescription').value,
      status: data.get('statusCheck').value,
      categoryId:this.categoryId
    }
    this.messageService.showLoader.emit(true);
    this.categoryService.saveSubCategories(subCategoryData).subscribe(
      data => {
        if (data['success']) {
          this.messageService.showLoader.emit(false);
          this.catModalClose.nativeElement.click();
          this.getSubCategories(this.categoryId);
          this.messageService.successMessage('SubCategory', 'Successfully saved');
        }
      },
      error => {   
        this.handleError(error);
        let errorObj = error.json();
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;
        }
      });
  }

// get subcategory for update
  getSubCategoryForUpdate(id) {
    this.updateSubCategoryId = id;
    this.subCategory = this.subCategories.filter(data => data._id === this.updateSubCategoryId);
    this.formSubCategory = this.fb.group({
      subCategoryName: [this.subCategory[0].name, [Validators.required]],
      subCategoryDescription: [this.subCategory[0].description, [Validators.required, Validators.maxLength(300)]],
      statusCheck: [this.subCategory[0].status]
    });
  }


    // update category 
  updateSubCategory(data: any) {
    let upadteData = {
      name: data.get('subCategoryName').value,
      description: data.get('subCategoryDescription').value,
      status: data.get('statusCheck').value,
       categoryId:this.categoryId
    };
          this.messageService.showLoader.emit(true);
    this.categoryService.updateSubCategory(upadteData,this.updateSubCategoryId).subscribe(
      data => {
        if (data['success']) {
          this.messageService.showLoader.emit(false);
          this.catModalClose.nativeElement.click();
            this.getSubCategories(this.categoryId);
          this.messageService.successMessage('Subategory', 'Successfully updated');
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

    // delete subcategory 
  deleteSubCategory(id){
   this.messageService.deleteConfirmation(()=>{
      this.messageService.showLoader.emit(true);
      this.categoryService.deleteSubCategory(id).subscribe(data=>{
      this.messageService.showLoader.emit(false);
      	this.getSubCategories(this.categoryId);
        this.messageService.successMessage('Subcategory', 'Successfully Deleted');
      },
      (error:any)=>{error.json();
        this.handleError(error);
      });
    })
  }

  closeModal() {
    this.formSubCategory = this.fb.group({
      subCategoryName: [''],
      subCategoryDescription: [''],
      statusCheck: [CommonConfig.STATUS.ACTIVE]
    });
    this.updateSubCategoryId='';
  }

// Handle error
  handleError(error) {
         this.messageService.showLoader.emit(false);
    this.errorService.handleError(error, this._vcr);
  }

}