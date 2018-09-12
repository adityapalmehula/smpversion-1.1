import { Component, OnInit, Inject, ViewContainerRef,Input,EventEmitter, Output} from '@angular/core';
import { FormGroup,FormBuilder,Validators} from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';
import { ProfileService } from './../../../services/profiles/profiles.service';
import { CountrieService } from './../../../services/countries/countries.service';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { ValidationConfig } from './../../../config/validation-config.constants';
import { CommonConfig } from './../../../config/common-config.constants';
import { MessageConfig } from './../../../config/message-config.constants';
import { AppConfig } from './../../../config/app-config.constants';
import { StudentService } from './../../../services/students/student.service';
import { InstructorService } from './../../../services/instructors/instructors.service';
import { AdminService } from './../../../services/admins/admins.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';

@Component({
	selector: 'app-address',
	templateUrl: './address.component.html',
	styleUrls: ['./address.component.css'],
	providers : [StudentService, InstructorService,AdminService,CountrieService]
})
export class AddressComponent implements OnInit {
	@Input() userAddresscData: any = {} ;
	@Output() getDetailsFromChild = new EventEmitter();
	profileAddressForm: FormGroup;
	public fb:FormBuilder;
	public options: RequestOptions;
	public errorMessage : any = '';
	public userData: any = {} ;
	public userId : any;
	public userRole : any;
	public countries : any= [];
	public countriesArr : any= [];
	public state : any;
	public states : any=[];
	public selectedCountry : any = {};
	public selectedState : any = {};
	public selectedCity : any = {};
	public cities : any=[];
	

	constructor(
		@Inject(FormBuilder)fb:FormBuilder,
		private profileService : ProfileService,
		private countrieService :  CountrieService,
		private loginService: AuthenticationService,
		private studentService: StudentService,
    private adminService:AdminService,
		private instructorService : InstructorService,
		private messageService : MessageService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef
		) {
		this.fb=fb;
		this.intializeForm(fb);
	}

	intializeForm(fb:FormBuilder,data:any={}):void{
		this.profileAddressForm=fb.group({
			address1: [data.address1 || '',[Validators.required,Validators.minLength(5),Validators.maxLength(200)]],
			address2: [data.address2 || '',[]],
			city: [data.city || '',[Validators.required,Validators.minLength(2),Validators.maxLength(50)]],
			state: [data.state || '',[Validators.required,Validators.minLength(2),Validators.maxLength(50)]],
			pincode: [data.pincode || '',[Validators.required,Validators.maxLength(6)]],
			country: [data.country || '',],
		});
	}

	ngOnInit() {
		this.userRole= this.loginService.userRole;
		this.getUserDetail();
		this.getCountries();
		//this.getDetailsFromChild.emit();
	}

	clearState() {
		this.profileAddressForm.get('state').setValue('');
		this.states =[];
		this.clearCity();
	}

	clearCity() {
		this.profileAddressForm.get('city').setValue('');
		this.cities =[];
	}
	
	getStates(isInit?:boolean) {
		if (!isInit) {
			this.clearState();
		}
		this.states = this.countriesArr.find((countryObj) =>{
			return countryObj.country === this.selectedCountry;
		}).states;
	} 

  getCities(isInit?:boolean) {
  	if (!isInit) {
			this.clearCity();
		}	
  	this.cities = this.states.find((stateObj) =>{
			return stateObj.state === this.selectedState;
		}).cities;
  }

  // get countries 
  getCountries() {
  	this.countrieService.getCountries().subscribe(response=>{
			this.countriesArr=response.data;
			console.log("--------->"+this.countriesArr);
			this.countries = this.countriesArr.map((countryObj) =>{
				return  { 'country': countryObj.country};
			});
			if (this.selectedState) {
				this.getStates(true);
			}
			if (this.selectedCity) {
	      this.getCities(true);
			}
		}, error=>{
			this.errorMessage=error.json().msg;
			this.handleError(error);
		});
  }

    // update profile address data into db 
    profileAddress(data:any)
    {
    	let addressData= {
    		address1:data.get('address1').value.trim(),
    		address2:data.get('address2').value.trim(),
    		city:data.get('city').value.trim(),
    		state:data.get('state').value.trim(),
    		pincode:data.get('pincode').value.trim(),
    		country:data.get('country').value.trim(),
    		role : this.userRole
    	}
    	this.messageService.showLoader.emit(true);
    	this.profileService.profileAddress(addressData).subscribe(response=>{
    		if(response['success']) {
    			this.messageService.showLoader.emit(false);
    			this.messageService.successMessage('Address', 'Successfully Changed');
    			this.getDetailsFromChild.emit();
    		}
    	}, error=>{
    		this.errorMessage=error.json().msg;
    		this.handleError(error);
    	});
    }
    
    // Get user details from db by role
    getUserDetail(){
      if(this.userAddresscData.address){
           // this.profileService.updateProfile.emit(response.data);
            this.userData=this.userAddresscData.address;
            
	            this.selectedCountry=this.userAddresscData.address.country || {};
	            this.selectedState=this.userAddresscData.address.state || {};
	            this.selectedCity=this.userAddresscData.address.city || {};         
            
						this.getCountries();
            this.intializeForm(this.fb,this.userAddresscData.address);
          }
      // let $userService= this.getUserInfo(this.userRole);
      // if($userService) {
      //   $userService.subscribe(response=>{
      //     if(response.data){
      //       this.profileService.updateProfile.emit(response.data);
      //       this.userData=response.data;
      //       if(response.data.address) {
	     //        this.selectedCountry=response.data.address.country || {};
	     //        this.selectedState=response.data.address.state || {};
	     //        this.selectedCity=response.data.address.city || {};         
      //       }
						// this.getCountries();
      //       this.intializeForm(this.fb,this.userData.address);
      //     }
      //     else {}
      //   }, (error:any)=> {
      //     this.errorMessage=error.json().msg; 
      //     this.handleError(error);
      //   });
      // }
    }
    // switch to user service by role
     getUserInfo(role){
       let $userService;
       switch(role) {
         case CommonConfig.USER_INSTRUCTOR:
         $userService= this.instructorService.findInstructorInfo();
         break;
         case CommonConfig.USER_STUDENT:
         $userService= this.studentService.findStudentInfo();
         break;
         case CommonConfig.USER_ADMIN:
         $userService= this.adminService.findAdminInfo();
         break;
       }
       return $userService;
     }

    handleError(error) {
    	this.messageService.showLoader.emit(false);
    	this.errorService.handleError(error, this._vcr);
    }
  }
