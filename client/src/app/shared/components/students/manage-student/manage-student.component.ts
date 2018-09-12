import { Component, OnInit,Inject ,Input, ViewContainerRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StudentService } from './../../../services/students/student.service';
import { SchoolService } from './../../../services/schools/school.service';
import { ValidationConfig } from './../../../config/validation-config.constants';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { CategoryService } from './../../../services/categories/category.service';
import { CountrieService } from './../../../services/countries/countries.service';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from "rxjs/observable/forkJoin";

@Component({
  selector: 'manage-add-student',
  templateUrl: './manage-student.component.html',
  styleUrls: ['./manage-student.component.css'],
  providers:[StudentService, SchoolService,CategoryService,CountrieService]
})
export class ManageStudentComponent implements OnInit {

  public stuForm: FormGroup;
  public fb:FormBuilder;
  public genders=['Male','Female'];
  public schools:any;
  public role :string="";
  public schoolId :string="";
  CommonConfig:any=CommonConfig;
  public urlPrefix : string;
  errorMessage: string;
  successMessage: string;
  formType:string="add";
  _id: string;
  status : any =CommonConfig.STATUS;
  categories: any=[];
  subCategoriesMaster: any=[];
  subCategories: any=[];
  locationMaster: any=[];
  countries: any=[];
  country: any;
  stateDetails: any;
  states: any=[];
  cities: any=[];
  studentId:string;

  constructor(
    @Inject(FormBuilder)
    fb:FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private studentService: StudentService,
    private schoolService: SchoolService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private countrieService: CountrieService,
    ){
    this.fb=fb;
    this.intializeForm(fb);
  }

  //intialize form 
  intializeForm(fb:FormBuilder,data:any={}): void {
    if(data) {
      if(data['academicDetails']) {
        data['board']=data['academicDetails']['board'];
        if(data['board']) {
          this.categoryChange(data['board']);
        }
        data['schoolId']=data['academicDetails']['schoolId'];
        data['class']=data['academicDetails']['class'];
      }  
      if(data['address']) {
        data['country']=data['address']['country'];
        if(data['country']) {
          this.getStates(data['country']);
        } 
        data['state']=data['address']['state'];
        if(data['state']) {
          this.getCities(data['state']);
        } 
        data['city']=data['address']['city'];
        data['pincode']=data['address']['pincode'];
        data['address']=data['address']['address1'];
      }
    }

    this.stuForm=fb.group({
      name: [data.name || '',[Validators.required]],
      email: [data.email || '',[Validators.required,Validators.pattern(ValidationConfig.EMAIL_PATTERN)]],
      mobile: [data.mobile || '',[Validators.required,Validators.maxLength(10),Validators.pattern(ValidationConfig.MOB_NO_PATTERN)]],
      gender: [data.gender || '',[Validators.required]],
      schoolId: [data.schoolId || '',[]],
      board: [data.board || '',[Validators.required]],
      class: [data.class || '',[Validators.required]],
      country: [data.country || '',[Validators.required]],
      state: [data.state || '',[Validators.required]],
      city: [data.city || '',[Validators.required]],
      pincode: [data.pincode || '',[Validators.required,Validators.pattern(/^\d{6}$/)]],
      address: [data.address || '',[Validators.required]],
      status: [data.status || CommonConfig.STATUS.ACTIVE]   
    });
  }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.role = this.authenticationService.userRole;
    this.studentId = this.route.snapshot.params['id'];
    if(this.role==CommonConfig.USER_ADMIN || this.role==CommonConfig.USER_INSTRUCTOR) {
      if(this.stuForm.get('schoolId')) {
        this.stuForm.get('schoolId').setValidators([Validators.required]);
      }
      this.getSchools();
    }else {
      this.getFiltersData();
    }
  }

  //get categories and subcategories for filters
  getFiltersData() {
    this.messageService.showLoader.emit(true);
    let $Observables=[this.categoryService.getCategoriesAndSubCategories(),this.countrieService.getCountries()];
    if(this.studentId) {
      this.formType='edit';
      this.stuForm.get('email').disable();
      $Observables.push(this.studentService.findById(this.studentId));
    }
    forkJoin($Observables).subscribe(results=> { 
      this.messageService.showLoader.emit(false);
      if(results[0]) {
        let response=results[0];
        if(response['data'] && response['data'].categories && response['data'].subCategories) {
          this.categories = response['data'].categories;
          this.subCategoriesMaster = response['data'].subCategories;
        }
      }
      if(results[1] && results[1]['data']) {
        this.locationMaster = results[1]['data']
        this.countries = results[1]['data'].map(ele => ele.country);
      } 

      if(results[2] && results[2]['data']) {
        this.displayData(results[2]['data'])
      }
    },error=>{
      this.handleError(error);
    });
  }

  //get state by country
  getStates(countryName: string) {
    this.states=[];
    this.cities=[];
    this.country=this.locationMaster.find(ele=> ele.country==countryName);
    if(this.country && this.country['states']) {
      this.states=this.country.states.map(ele=> ele.state);;
    }
  }

  //get cities by state
  getCities(stateName: string) {
    this.cities=[];
    this.stateDetails=this.country['states'].find(ele=> ele.state==stateName);
    if(this.stateDetails && this.stateDetails['cities']) {
      this.cities=this.stateDetails.cities.map(ele=> ele.city);
    }
  }

  //get schools for filter
  getSchools() {
    this.messageService.showLoader.emit(true);
    this.schoolService.getSchoolsFilter()
    .subscribe(response=>{ 
      this.messageService.showLoader.emit(false);
      if(response['data']){
        this.schools=response['data'];
      }
      this.getFiltersData();
    },error=>{
      this.handleError(error);
    });
  }

//category on change
categoryChange(categoryId:string) {
  this.subCategories=this.subCategoriesMaster.filter(subCat=> subCat.categoryId==categoryId);
}

//on registration form submit 
register():void {
  this.errorMessage="";
  this.successMessage="";
  let student= this.getFormValue();
  this.messageService.showLoader.emit(true);
  this.studentService.save(student).subscribe(data=>{
    this.messageService.showLoader.emit(false);
    if(data['success']){
      this.successMessage=data.msg;
      this.messageService.successMessage("Student","Added successfully",()=>{
        this.router.navigate(['/', this.urlPrefix, 'students']);
      });
    }
  },error=>{
    this.errorMessage=error.json().msg;
    this.handleError(error);
  })
}

//get form value
getFormValue():any{
  return {
    name: this.stuForm.get('name').value,
    email: this.stuForm.get('email').value,
    mobile: this.stuForm.get('mobile').value,
    gender: this.stuForm.get('gender').value,
    class: this.stuForm.get('class').value,
    board: this.stuForm.get('board').value,
    schoolId: this.stuForm.get('schoolId').value,
    status: this.stuForm.get('status').value,
    country: this.stuForm.get('country').value,
    state: this.stuForm.get('state').value,
    city: this.stuForm.get('city').value,
    pincode: this.stuForm.get('pincode').value,
    address: this.stuForm.get('address').value,
  }
}

//display data on form 
displayData(data:any):void{
  this._id=data._id;
  this.intializeForm(this.fb,data);
};

//on update 
update():void {
  this.errorMessage="";
  this.successMessage="";
  let student = this.getFormValue();
  this.messageService.showLoader.emit(true);
  this.studentService.update(student,this._id).subscribe(data=>{
    this.messageService.showLoader.emit(false);
    if(data['success']) {
      this.successMessage=data.msg;
      this.messageService.successMessage("Student","Updated successfully ",()=>{
        this.router.navigate(['/', this.urlPrefix, 'students']);
      });
    }
  }, error=>{
    this.handleError(error);
    this.errorMessage=error.json().msg;
  });
}

// Handle error
handleError(error) {
  this.messageService.showLoader.emit(false);
  this.errorService.handleError(error, this._vcr);
}

}


