import { Component, OnInit,Inject ,Input, ViewContainerRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SchoolService } from './../../../services/schools/school.service';
import { ValidationConfig } from './../../../config/validation-config.constants';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { CountrieService } from './../../../services/countries/countries.service';


@Component({
	selector: 'app-manage-school',
	templateUrl: './manage-school.component.html',
	styleUrls: ['./manage-school.component.css'],
	providers:[SchoolService,CountrieService]

})
export class ManageSchoolComponent implements OnInit {

	public schForm: FormGroup;
	public fb:FormBuilder;
	public schools:any;
	public schoolId :string="";
	public urlPrefix :string="";
	errorMessage: string;
	successMessage: string;
	formType:string = "add";
	_id: string;
 // status : any = CommonConfig.STATUS.ACTIVE;
 // states:any=CommonConfig.STATES;
 // countries:any=CommonConfig.COUNTRIES;
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
 	private schoolService: SchoolService,
 	private errorService: ErrorService,
 	private _vcr : ViewContainerRef,
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
   this.schForm=this.fb.group({
   	name: [data.name || '',[Validators.required,Validators.pattern(ValidationConfig.LETTERS_PATTERN)]],
   	email: [data.email || '',[Validators.required,Validators.pattern(ValidationConfig.EMAIL_PATTERN)]],
   	mobile: [data.mobile || '',[Validators.required,Validators.maxLength(10),Validators.pattern(ValidationConfig.MOB_NO_PATTERN)]],
   	phoneNo: [data.phoneNo || '',[]],
   	address: [data.address || '',[Validators.required]],
   	city: [data.city || '',[Validators.required,Validators.pattern(ValidationConfig.LETTERS_PATTERN)]],
   	state: [data.state || '',[Validators.required]],
   	country: [data.country || '',[Validators.required]],
   	pincode: [data.pincode || '',[Validators.required,Validators.pattern(/^\d{6}$/)]],
   	website: [data.website || '',[Validators.pattern(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/)]],
   	status: [data.status || CommonConfig.STATUS.ACTIVE]    
   });
 }

 ngOnInit() {
 	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
 	this.schoolId = this.route.snapshot.params['id'];
 	
 	this.getCountries();
 }

  //get form value
  getFormValue():any {
  	return {
  		name: this.schForm.get('name').value,
  		email: this.schForm.get('email').value,
  		mobile: this.schForm.get('mobile').value,
  		phoneNo: this.schForm.get('phoneNo').value,
  		address: {
      address:this.schForm.get('address').value,
      city: this.schForm.get('city').value,
      state: this.schForm.get('state').value,
      country: this.schForm.get('country').value,
      pincode: this.schForm.get('pincode').value
       },
  		website: this.schForm.get('website').value,
  		status: this.schForm.get('status').value,
  	}
  }

    //on registration form submit 
    register():void {
    	this.errorMessage="";
    	this.successMessage="";
    	let school= this.getFormValue();
    	this.messageService.showLoader.emit(true);
    	this.schoolService.save(school).subscribe(data=>{
    		this.messageService.showLoader.emit(false);
    		if(data['success']){
    			this.successMessage=data.msg;
    			this.messageService.successMessage("School","Added successfully",()=>{
    				this.router.navigate(['/', this.urlPrefix, 'schools']);
    			});
    		}
    	},error=>{
    		this.errorMessage=error.json().msg;
    		this.handleError(error);
    	})
    }
    // get coutries data
    getCountries() {
    	this.countrieService.getCountries().subscribe(response=>{
    		if(response['data']) {
    			this.locationMaster=response['data'];
    			this.countries=this.locationMaster.map(ele => ele.country);
    			
    		}
    		if(this.schoolId){
 		this.formType='edit';
 		this.fetchSchool(this.schoolId);
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

  //on update 
  update():void {
  	this.errorMessage="";
  	this.successMessage="";
  	let school = this.getFormValue();
  	this.messageService.showLoader.emit(true);
  	this.schoolService.update(school,this._id).subscribe(data=>{
  		this.messageService.showLoader.emit(false);
  		if(data['success']) {
  			this.successMessage=data.msg;
  			this.messageService.successMessage("School","Updated successfully ",()=>{
  				this.router.navigate(['/', this.urlPrefix, 'schools']);
  			});
  		}
  	}, error=>{
  		this.errorMessage=error.json().msg;
  		this.handleError(error);
  	});
  }

  //get school data based on id 
  fetchSchool(schoolId):void {
  	this.messageService.showLoader.emit(true);
  	this.schoolService.getSchool(schoolId)
  	.subscribe(response=>{
  		this.messageService.showLoader.emit(false);
  		this.schForm.get('email').disable();
  		if(response['success'] && response['data']){
  			this.displayData(response.data)
  		}
  	},error=>{
  		this.errorMessage=error.json().msg;
  		this.handleError(error);
  	});
  }

  //display data on form 
  displayData(data:any):void {
  	this._id=data._id;
  	this.initializeForm(data);
  }

 // Handle error
 handleError(error) {
 	this.messageService.showLoader.emit(false);
 	this.errorService.handleError(error, this._vcr);
 }
}