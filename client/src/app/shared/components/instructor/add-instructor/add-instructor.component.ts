import { Component, OnInit,Inject ,Input, ViewContainerRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {InstructorService} from './../../../services/instructors/instructors.service';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { ValidationConfig } from './../../../config/validation-config.constants';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { SkillService } from './../../../services/skills/skill.service';
import { CountrieService } from './../../../services/countries/countries.service';

@Component({
  selector: 'app-add-instructor',
  templateUrl: './add-instructor.component.html',
  styleUrls: ['./add-instructor.component.css'],
  providers:[InstructorService, SkillService , CountrieService]
})
export class AddInstructorComponent implements OnInit {
  public instructorFormData: FormGroup;
  public fb:FormBuilder;
  public role: string="";
  public urlPrefix: string="";
  public permissions = [];
  public errorMessage : any;
  public backendErrorMsg : any = [];
  public insId :string="";
  formType:string = "add";
  genders=['Male','Female'];
  status : any = CommonConfig.STATUS.ACTIVE;
  locationMaster: any=[];
  countries: any=[];
  country: any;
  stateDetails: any;
  states: any=[];
  cities: any=[];
  _id: string;
 // studentId:string;
  
    constructor(
    @Inject(FormBuilder)
    fb:FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef,
    private instructorService : InstructorService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private countrieService :  CountrieService,
    ){
    this.fb=fb;
    this.initializeForm();
  }

  //intialize form 
  initializeForm(data:any={}):void {
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
        data['address']=data['address']['address'];
      }
    this.instructorFormData=this.fb.group({
      name: [data.name || '',[Validators.required]],
      email: [data.email || '',[Validators.required,Validators.pattern(ValidationConfig.EMAIL_PATTERN)]],
      mobile: [data.mobile || '',[Validators.required,Validators.maxLength(10),Validators.pattern(ValidationConfig.MOB_NO_PATTERN)]],
      gender:[data.gender || '',[Validators.required]],
      address: [data.address || '',[Validators.required]],
      city: [data.city || '',[Validators.required,Validators.pattern(ValidationConfig.LETTERS_PATTERN)]],
      state: [data.state || '',[Validators.required]],
      country: [data.country || '',[Validators.required]],
      pincode: [data.pincode || '',[Validators.required,Validators.pattern(/^\d{6}$/)]],
      status: [data.status || CommonConfig.STATUS.ACTIVE]    
    });
  }

  ngOnInit() {
    this.role=this.authenticationService.userRole;
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.insId = this.route.snapshot.params['id'];
    this.getCountries();
  }
   
  // get country data from database
   getCountries() {
    	this.countrieService.getCountries().subscribe(response=>{
    		if(response['data']) {
    			this.locationMaster=response['data'];
    			this.countries=this.locationMaster.map(ele => ele.country);
    			
    		}
      if(this.insId){
 	  	this.formType='edit';
 	  	this.fetchInstructor(this.insId);
     	}
    	}, error=>{
    		this.errorMessage=error.json().msg;
    		this.handleError(error);
    	});
    }

   //get cities by state
  getCities(stateName: string) {
    this.cities=[];
    this.stateDetails=this.country['states'].find(ele=> ele.state==stateName);
    if(this.stateDetails && this.stateDetails['cities']) {
      this.cities=this.stateDetails.cities.map(ele=> ele.city);
    }
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

//get form value
  getFormValue():any {
    return {
      name: this.instructorFormData.get('name').value,
      email: this.instructorFormData.get('email').value,
      mobile: this.instructorFormData.get('mobile').value,
      gender: this.instructorFormData.get('gender').value,
      address: {
      address:this.instructorFormData.get('address').value,
      city: this.instructorFormData.get('city').value,
      state: this.instructorFormData.get('state').value,
      country: this.instructorFormData.get('country').value,
      pincode: this.instructorFormData.get('pincode').value
       },
      status: this.instructorFormData.get('status').value,
    }
  }

/* save instructor data */
save(instructorData:any) {
  let instructor= this.getFormValue();
  this.messageService.showLoader.emit(true);
  this.instructorService.save(instructor).subscribe((response)=>{
    if(response.success) {
      this.messageService.successMessage('Instructor', response.msg);
      this.router.navigate(['/', this.urlPrefix, 'instructors']);
      this.messageService.showLoader.emit(false);
    } else {
      this.errorMessage=response.msg;
      this.messageService.showErrorToast(this._vcr,this.errorMessage);
      this.messageService.showLoader.emit(false);
    }
  },(error: any)=> {
    this.errorMessage=error.json().msg;
    this.messageService.showLoader.emit(false);
    this.handleError(error);
  })
}

// get instructor info
getInstructorinfo(){
 // this.messageService.showLoader.emit(true);
  // this.instructorService.findInstructorInfo().subscribe((response)=>{
  //   if(response.success){
  //     console.log(JSON.stringify(response));
  //   }
  // },(error)=>{
  //   this.errorMessage=error.json().msg;
  //   this.messageService.showLoader.emit(false);
  //   this.handleError(error);
  // })
}

// update instructor data
update() {
  let instructor = this.getFormValue();
  this.messageService.showLoader.emit(true);
  this.instructorService.update(instructor,this._id).subscribe((response)=>{
    if(response.success) {
      this.messageService.successMessage('Instructor', response.msg);
      this.router.navigate(['/', this.urlPrefix, 'instructors']);
      this.messageService.showLoader.emit(false);
    } else {
      this.errorMessage=response.msg;
      this.messageService.showLoader.emit(false);
    }
  },(error: any)=> {
    this.errorMessage=error.json().msg;
    this.messageService.showErrorToast(this._vcr,this.errorMessage);
    this.messageService.showLoader.emit(false);
    this.handleError(error);
    
  })
}

//get instructor data based on id 
  fetchInstructor(insId):void {
  	this.messageService.showLoader.emit(true);
  	this.instructorService.getInstructor(insId)
  	.subscribe(response=>{
  		this.messageService.showLoader.emit(false);
  		this.instructorFormData.get('email').disable();
  		if(response['success'] && response['data']){
  		this.displayData(response.data)
  		}
  	},error=>{
  		this.errorMessage=error.json().msg;
  		this.handleError(error);
  	});
  }
  // display data on form 
  displayData(data:any):void {
  	this._id=data._id;
  	this.initializeForm(data);
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

  // Initialize form data
  // initializeForm() {
  //   this.instructorFormData.reset();
  // }
}
