import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service';

@Injectable()
export class CategoryService{
  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }

  // Post request to server
  categoryPost(data:any) {
    return this.http.post(AppConfig.API_HOST+'/api/categories',data,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  // get request to server
  categoryGet() {
  	return this.http.get(AppConfig.API_HOST+'/api/categories',this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  // Post request for subcategory
  saveSubCategories(data:any) {
  	return this.http.post(AppConfig.API_HOST+'/api/subcategories',data,this.authorizationService.authorization()).map(data=>
  		data.json(),
  		(error:any)=>{
  			error.json();
  		});
  }

  // get category to fetch a particular id
  getCategory(id) {
    return this.http.get(AppConfig.API_HOST+'/api/categories/id/'+id,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  } 

  // get category and subcategories data for filter
  getCategoriesAndSubCategories() {
    return this.http.get(AppConfig.API_HOST+'/api/categories/subcategories/filters',this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  // get all subcategories based on category id 
  getSubCategories(id) {
    return this.http.get(AppConfig.API_HOST+'/api/subcategories/id/'+id,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  // update request for category
  updateCategory(data,id) {
    return this.http.put(AppConfig.API_HOST+'/api/categories/id/'+id,data,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  // delete request for subcategory
  subcategoryItem(subcategoryId,categoryId) {
    return this.http.delete(AppConfig.API_HOST+'/api/categories/'+categoryId +'/subcategories/'+subcategoryId,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  // get subcategory for update
  getSubCategory(_id) {
    return this.http.get(AppConfig.API_HOST+'/api/subcategories/subcategory/'+_id,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  // update subcategory
  updateSubCategory(subCategory,id) {
    return this.http.put(AppConfig.API_HOST+'/api/subcategories/subcategory/id/'+id,subCategory,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }

  // delete category
  deleteCategory(categoryId) {
    return this.http.delete(AppConfig.API_HOST+'/api/categories/'+categoryId,this.authorizationService.authorization()).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      }
      )};
    
//delete sub category
deleteSubCategory(id) {
  return this.http.delete(AppConfig.API_HOST+'/api/subcategories/'+id,this.authorizationService.authorization()).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    }
    )};

  // get all subcategories based on categories id's 
  getSubCatByCategories(categories:any) {
    return this.http.post(AppConfig.API_HOST+'/api/subcategories/categories',categories,this.authorizationService.authorization())
    .map(data=> data.json(),
      (error:any)=> error.json());
  }

  // get all courses based on subcategories id's 
  getCoursesBySubCategories(subCategories:any) {
    return this.http.post(AppConfig.API_HOST+'/api/courses/subcategories',subCategories,this.authorizationService.authorization())
    .map(data=> data.json(),
      (error:any)=> error.json());
  }
}