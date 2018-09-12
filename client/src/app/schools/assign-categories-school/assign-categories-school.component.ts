import { Component, OnInit,Inject,Input, ViewContainerRef} from '@angular/core';
import { FormGroup,FormBuilder,Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { SchoolService } from './../../shared/services/schools/school.service';
import { CategoryService } from './../../shared/services/categories/category.service';
import { MessageService } from './../../shared/services/common/message.service';
import { ErrorService } from './../../shared/services/common/error.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-assign-categories-school',
  templateUrl: './assign-categories-school.component.html',
  styleUrls: ['./assign-categories-school.component.css'],
  providers: [ SchoolService,CategoryService ]
})
export class AssignCategoriesSchoolComponent implements OnInit {


  schAssignedCategories: FormGroup;
  public schools: any;
  public categories: any=[];
  public dropdownList = [];
  public selectedItems = [];
  public dropdownSettings = {};
  public errorMessage = "";
  public successMessage = "";


  constructor(
    @Inject(FormBuilder)
    fb:FormBuilder,
    private router: Router,
    private schoolService: SchoolService,
    private errorService: ErrorService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private _vcr : ViewContainerRef,
    ) { 

    this.schAssignedCategories=fb.group({
      schoolId: ['',[Validators.required]],
      categories: ['',[Validators.required]], 
    });
  }

  ngOnInit() {
    this.getSchools(()=> {
      this.getCategories();
    });
    this.dropdownSettings = { 
      singleSelection: false, 
      text:"Select Categories",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      classes:"custom-class",//myclass custom-class my-custom"
    };    
  }

//get all the schools 
getSchools(callback:()=> void) {
  this.schoolService.getSchools().subscribe(
    response=> {
      if(response['success'] && response['data']){
        this.schools= response['data'];
        callback();
      }
    },error=> {
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });
}

//get categories
getCategories(){
  this.categoryService.categoryGet().subscribe(
    response=> {
      if(response['success'] && response['data']) {
        if(response['data'].length === 0) {
          $('.list-area ul').attr('style',  'max-height: 10px;');
        }else {
          this.dropdownList=response['data'].map(ele=> {
            let obj={id:"",itemName:""};
            obj.id=ele._id;
            obj.itemName=ele.name;
            return obj;
          });
        }
      }
    },(error)=> {
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });
}

submitCategories(schAssignSubCat:any) {
  let assignCategories=schAssignSubCat.get('categories').value;
  let _id=schAssignSubCat.get('schoolId').value;
  let categories=[];
  if(!_id) {
    this.errorMessage="Please select school";
    return;
  }
  if(assignCategories.length<=0) {
    this.errorMessage="Please select categories";
    return;
  }else {
    categories=assignCategories.map(element=> {
      return element.id;
    });
  }
  let schAssignedCourse= {
    school:_id,
    categories:categories,
  }
  this.schoolService.updateAssignCategories(schAssignedCourse,_id).subscribe(data=>{
    if(data['success']){
      this.messageService.successMessage('Categories', 'Assign to school successfully');
        /// this.router.navigate(['/admin', 'student-info','view-student']);
      }
    },error=>{
      this.handleError(error);
    });
}

  // angular2-multiselect-dropdown events
  onItemSelect(item:any) {
  }

  OnItemDeSelect(item:any) {

  }

  onSelectAll(items: any) { 

  }

  onDeSelectAll(items: any) {
  }

  getAssignedCategories() {

  }

//on school selection
onSelectSchool(schoolId){
  this.selectedItems=[];
  let _id=schoolId.value;
  this.schoolService.getAssignCategories(_id).subscribe(
    response=> {
      if(response['data']){
        if(response['data'].categories && (response['data'].categories).length>0) {
          this.selectedItems= response['data'].categories;
        }
      }
    },error=> {
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });
}

// Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }
}
