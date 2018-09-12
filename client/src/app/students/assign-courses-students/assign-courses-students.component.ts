import { Component, OnInit,Inject,Input,IterableDiffers, ViewContainerRef} from '@angular/core';
import { FormGroup,FormBuilder,Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { SchoolService } from './../../shared/services/schools/school.service';
import { StudentService } from './../../shared/services/students/student.service';
import { CategoryService } from './../../shared/services/categories/category.service';
import { ErrorService } from './../../shared/services/common/error.service';
import { AuthenticationService } from './../../shared/services/common/authentication.service';
import { MessageService } from './../../shared/services/common/message.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-assign-courses-students',
  templateUrl: './assign-courses-students.component.html',
  styleUrls: ['./assign-courses-students.component.css'],
  providers: [ SchoolService,CategoryService,StudentService ]

})
export class AssignCoursesStudentsComponent implements OnInit {

  public assignCoursesForm: FormGroup;
  public schools: any;
  public courses:any=[];
  public categories:any=[];
  public classes:any=[];
  public selectedClass: string="";
  public role: string="";
  public errorMessage: string="";
  public successMessage: string="";
  public categoriesList = [];
  public catDropdownConfig = {};
  public selectedCatgories = [];
  public subCategoriesList = [];
  public selectedSubCategories = [];
  public subCatDropdownConfig = {};
  public coursesList = [];
  public selectedCourses = [];
  public loading = false;
  urlPrefix:string;
  masterCategories=[];
  masterSubCategories=[];
  masterCourses=[];
  
  constructor(
    @Inject(FormBuilder)
    fb:FormBuilder,
    private router: Router,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private schoolService: SchoolService,
    private studentService: StudentService,
    private authenticationService: AuthenticationService,
    private _iterableDiffers: IterableDiffers,
    private _vcr : ViewContainerRef
    ) { 

    this.assignCoursesForm=fb.group({
      schoolId: ['',[Validators.required]],
      standard: ['',[Validators.required]],
      categories: ['',[]],
      subCategories: ['',[]], 
      courses: ['',[]], 
    });
  }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.role = this.authenticationService.userRole;
    // let userId = this.authenticationService.getUserId();
    this.configDropDown();
    if(this.role!=="School") {
      this.getSchools();
    }else {
      this.getSchool((schoolCode)=>{
        this.getSchoolDetails({value:schoolCode});
      });
    }
  }

//intialize dropdowns
configDropDown() {
  this.catDropdownConfig = { 
    singleSelection: false, 
    text:"Select Categories",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"category",
  }; 

  this.subCatDropdownConfig = { 
    singleSelection: false, 
    text:"Select sub-categories",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"sub-category",
  }; 
}

//get all the schools
getSchools(){
  this.schoolService.getSchools().subscribe(
    response=> {
      if(response['success'] && response['data']){
        this.schools= response['data'];
        this.modifyHeight([]);
      }
    },error=> {
      this.errorMessage=error.json().msg;
      this.handleError(error);
    });
}

 //on school select get all classes 
 getSchoolDetails(school: any,classRef:any={}) {
   let _id=school.value;
   school=this.getSchoolCode(_id);
   this.studentService.getClasses(school.schoolId).subscribe(
     response=> { 
       if(response['data']) {
         this.classes=response['data'];
       }
     },error=> {
       this.errorMessage=error.json().msg;
       this.handleError(error);
     });
   this.getSchoolAssignedCategories(_id);
 }

 //fetch assigned categories to school based on school id
 getSchoolAssignedCategories(_id:string) {
   this.selectedCatgories=[];
   this.selectedSubCategories=[];
   this.selectedCourses=[];
   this.schoolService.getAssignCategories(_id).subscribe(
     response=> {
       if(response['data']) {
         if(response['data'].categories) {
           this.modifyHeight(response['data'].categories,"category");
           this.masterCategories= response['data'].categories;
           this.categoriesList= this.masterCategories;
         }
         if(response['data'].subcategories) {
           this.modifyHeight(response['data'].subcategories,"sub-category");
           this.masterSubCategories= response['data'].subcategories;
           this.subCategoriesList= this.masterSubCategories;
         }
         if(response['data'].courses) {
           this.modifyHeight(response['data'].courses,"course");
           this.masterCourses= response['data'].courses;
           this.coursesList= this.masterCourses;
         }
       }
     },error=> {
       this.errorMessage=error.json().msg;
       this.handleError(error);
     });
 }

 //get subcategories associate with selected categories
 onCategoriesChange($event: any) {
   this.selectedSubCategories=[];
   this.selectedCourses=[];
   if(this.selectedCatgories.length>0 ) {
     this.coursesList=[];
     this.subCategoriesList=[];
   }else {
     this.coursesList=this.masterCourses;
     this.subCategoriesList=this.masterSubCategories;
   }
   this.getSubCatAndcourse();
   this.modifyHeight(this.subCategoriesList,"sub-category");
 }

 //get subcategory and courses based on selected category
 getSubCatAndcourse(){
   for(let i in this.selectedCatgories) {
     let sub_category=this.masterSubCategories.filter(subCat=> subCat.category == this.selectedCatgories[i].id);
     if(sub_category) {
       this.subCategoriesList= this.subCategoriesList.concat(sub_category);
     }
     let course=this.masterCourses.filter(course=> course.category == this.selectedCatgories[i].id);
     if(course) {
       this.coursesList=this.coursesList.concat(course);
     }
   }
 }

 //get subcategories associate with selected categories
 onSubCategoriesChange($event:any) {
   this.selectedCourses=[];
   this.coursesList=[];
   for(let i in this.selectedSubCategories) {
     let course=this.masterCourses.filter(course=> course.subcategory == this.selectedSubCategories[i].id);
     if(course) {
       this.coursesList=this.coursesList.concat(course);
     }
   }
   this.modifyHeight(this.coursesList,"course");
 }

 //assign subcategories
 assignCourses() {
   let _id= this.assignCoursesForm.get('schoolId').value;
   let standard= this.assignCoursesForm.get('standard').value;
   //let courses= this.assignCoursesForm.get('courses').value;
   this.loading = true;
   this.studentService.assignCourses(this.getSchoolCode(_id).schoolId,standard,this.selectedCourses)
   .subscribe(data=> {
     if(data['success']) {
       this.loading = false;
       this.messageService.successMessage('Courses', 'Assign to class successfully');
       //this.router.navigate(['/admin', 'student-info','view-student']);
     }
   },error=>{
     this.handleError(error);
   });
 }

//get school details

getSchool(callback:(string)=>void){
 /* this.schoolService.getSchoolData().subscribe(
    response=>{
      if(response['success'] && response['data']) {
        callback(response['data'].schoolId);
        this.modifyHeight([]);
      }
    },(error)=>{
      this.errorMessage=error.json().msg;
    });*/
  }  

//set multi select option list heigt select 
modifyHeight(data:any,cls:string=null) {
  let  $selector= $('.list-area ul');
  if(cls){
    $selector=$("."+cls+" .list-area ul")
  }
  if(data.length === 0) {
    $selector.attr('style',  'max-height: 10px;');
  }else if(data.length<3) {
    $selector.attr('style',  'max-height: 120px;');
  }else {
    $selector.attr('style',  'max-height: 180px;');
  }
}
//on class filter change
onClassSelect() {
  this.selectedCatgories=[];
  this.selectedSubCategories=[];
  this.selectedCourses=[];
  let _id= this.assignCoursesForm.get('schoolId').value;
  let standard= this.assignCoursesForm.get('standard').value;
  this.studentService.getAssignCourses(this.getSchoolCode(_id).schoolId,standard)
  .subscribe(response=> {
    if(response['data'] && response['data'][0]) {
      this.subCategoriesList=[], this.coursesList=[];
      this.selectedCatgories=[],this.selectedSubCategories=[],this.selectedCourses=[];
      response['data'].map(courseDetails=> {
        if(courseDetails.category) {
          this.selectedCatgories.push(courseDetails.category);
          let subCategories= this.getItemsByProp(this.masterSubCategories,'category',courseDetails['category'].id);
          if(subCategories) {
            this.subCategoriesList=this.subCategoriesList.concat(subCategories);
          } 
        }
        if(courseDetails.subcategory) {
          this.selectedSubCategories.push(courseDetails.subcategory);
          let courses= this.getItemsByProp(this.masterCourses,'subcategory',courseDetails['subcategory'].id);
          if(courses) {
            this.coursesList=this.coursesList.concat(courses);
          } 
        }
        if(courseDetails.course) {
          this.selectedCourses.push(courseDetails.course);
        } 
      });
      this.selectedCatgories=this.removeDuplicates(this.selectedCatgories, 'id');
      this.subCategoriesList=this.removeDuplicates(this.subCategoriesList, 'id');
      this.selectedSubCategories=this.removeDuplicates(this.selectedSubCategories, 'id');
      this.coursesList=this.removeDuplicates(this.coursesList, 'id');
      this.updateCourseList();
    }
  },error=> {
    this.errorMessage=error.json().msg;
    this.handleError(error);
  });
}

//update courses
updateCourseList() {
  this.coursesList.push({});
  this.coursesList.splice(-1,1);
}
//get school code based on school _id
getSchoolCode(schoolId:string): any {
  return this.schools.find(ele=> ele._id === schoolId);
}

//mark selected courses 
verifyCourse(id):boolean {
  if(this.selectedCourses.find(course=> course.id === id)){
    return true;
  }
  return false;
}

//remove duplicate object from array based on object property
removeDuplicates(myArr, prop) {
  return myArr.filter((obj, pos, arr)=> {
    return arr.map(mapObj=> mapObj[prop]).indexOf(obj[prop]) == pos;
  });
}

//update selected courses on checkbox change event
updateSelectedCourses(event:any) {
  let selectedCourse = this.coursesList.find(course=> course.id == event.target.value);
  if(selectedCourse) {
    if (event.target.checked) {
      this.selectedCourses.push(selectedCourse);
    }else {
      let index = this.selectedCourses.findIndex(course=> course.id == event.target.value);
      if(index) {
        this.selectedCourses.splice(index, 1);
      }
    }
  }
}
//on category select
onCategorySelect(category: any) {
  let subcategories= this.getItemsByProp(this.masterSubCategories,'category',category.id);
  if(subcategories) {
    this.subCategoriesList=this.subCategoriesList.concat(subcategories);
    this.subCategoriesList=this.removeDuplicates(this.subCategoriesList, 'id');
  }
 /* let courses= this.getItemsByProp(this.masterCourses,'category',category.id);
  if(courses) {
    this.coursesList=this.coursesList.concat(courses);
    this.coursesList=this.removeDuplicates(this.coursesList, 'id');
  }*/
}

//on category select
onSubCategorySelect(subcategory: any) {
  let courses= this.getItemsByProp(this.masterCourses,'subcategory',subcategory.id);
  if(courses) {
    this.coursesList=this.coursesList.concat(courses);
    this.coursesList=this.removeDuplicates(this.coursesList, 'id');
  }

}

//on category deselect
onCategoryDeSelect(category: any) {
  this.selectedSubCategories = this.removeItemsByProp(this.selectedSubCategories,'category',category['id']);
  this.subCategoriesList = this.removeItemsByProp(this.subCategoriesList,'category',category['id']);
  this.selectedCourses = this.removeItemsByProp(this.selectedCourses,'category',category['id']);
  this.coursesList = this.removeItemsByProp(this.coursesList,'category',category['id']);
}

//on sub-category deselect
onSubCategoryDeSelect(subcategory: any) {
  this.selectedCourses = this.removeItemsByProp(this.selectedCourses,'subcategory',subcategory['id']);
  this.coursesList = this.removeItemsByProp(this.coursesList,'subcategory',subcategory['id']);
  if(!this.selectedSubCategories[0]) {
    this.getSubCatAndcourse();
  }
}

//add items from array based on object property 
getItemsByProp = (items:any,prop: string,val:string)=> items.filter(item=> item[prop] == val);

//remove items from array based on object property 
removeItemsByProp = (items:any,prop: string,val:string)=> items.filter(item=> item[prop] != val);

// Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }
}