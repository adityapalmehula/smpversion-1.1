import { Component, OnInit,Inject ,Input, ViewContainerRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SchoolService } from './../../../services/schools/school.service';
import { TeacherService } from './../../../services/teachers/teacher.service';
import { ValidationConfig } from './../../../config/validation-config.constants';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { CountrieService } from './../../../services/countries/countries.service';

@Component({
	selector: 'app-manage-teacher',
	templateUrl: './manage-teacher.component.html',
	styleUrls: ['./manage-teacher.component.css'],
	providers:[ TeacherService,SchoolService,CountrieService]
})
export class ManageTeacherComponent implements OnInit {
	public teacherForm: FormGroup;
	public fb:FormBuilder;
	public teacher:any;
	public teacherId :string="";
	public urlPrefix :string="";
	schoolsList:any=[];
	schools:any=[];
	errorMessage: string;
	successMessage: string;
	formType:string = "add";
	role: string="";
	genders=['Male','Female'];
	CONFIG: any=CommonConfig;
	status : any = CommonConfig.STATUS.ACTIVE;
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
		private teacherService: TeacherService,
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
  	this.teacherForm=this.fb.group({
  		schoolId: [data.schoolId || '',[]],   
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
  	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  	this.teacherId = this.route.snapshot.params['id'];  
  	this.getCountries();

  }

   // get coutries data
   getCountries() {
   	this.countrieService.getCountries().subscribe(response=>{
   		if(response['data']) {
   			this.locationMaster=response['data'];
   			this.countries=this.locationMaster.map(ele => ele.country);
   			if(this.teacherId){
   				this.formType='edit';
   				this.fetchTeacher();
   			}
   		}
   		if(this.role==CommonConfig.USER_ADMIN || this.role==CommonConfig.USER_INSTRUCTOR) {
      if(this.teacherForm.get('schoolId')) {
        this.teacherForm.get('schoolId').setValidators([Validators.required]);
      }
      this.getSchools();
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

  //get schools for filter
  getSchools() {
  	this.messageService.showLoader.emit(true);
  	this.schoolService.getSchoolsFilter()
  	.subscribe(response=>{ 
  		this.messageService.showLoader.emit(false);
  		if(response['data']){
  			this.schools=response['data'];
  		}
  	},error=>{
  		this.handleError(error);
  	});
  }

  //get form value
  getFormValue():any {
  	return {
  		schoolId: this.teacherForm.get('schoolId').value,
  		name: this.teacherForm.get('name').value,
  		email: this.teacherForm.get('email').value,
  		mobile: this.teacherForm.get('mobile').value,
  		gender: this.teacherForm.get('gender').value,
  		address: {
  			address:this.teacherForm.get('address').value,
  			city: this.teacherForm.get('city').value,
  			state: this.teacherForm.get('state').value,
  			country: this.teacherForm.get('country').value,
  			pincode: this.teacherForm.get('pincode').value
  		},
  		status: this.teacherForm.get('status').value,
  	}
  }

  //on registration form submit 
  register():void {
  	this.errorMessage="";
  	this.successMessage="";
  	let teacher= this.getFormValue();
  	this.messageService.showLoader.emit(true);
  	this.teacherService.save(teacher).subscribe(data=>{
  		this.messageService.showLoader.emit(false);
  		if(data['success']){
  			this.successMessage=data.msg;
  			this.messageService.successMessage("Teacher","Added successfully",()=>{
  				this.router.navigate(['/', this.urlPrefix, 'teachers']);
  			});
  		}
  	},error=>{
  		this.errorMessage=error.json().msg;
  		this.handleError(error);
  	})
  }

  //on update 
  update():void {
  	this.errorMessage="";
  	this.successMessage="";
  	let teacher = this.getFormValue();
  	this.messageService.showLoader.emit(true);
  	this.teacherService.update(teacher,this.teacherId).subscribe(data=>{
  		this.messageService.showLoader.emit(false);
  		if(data['success']) {
  			this.successMessage=data.msg;
  			this.messageService.successMessage("Teacher","Updated successfully ",()=>{
  				this.router.navigate(['/', this.urlPrefix, 'teachers']);
  			});
  		}
  	}, error=>{
  		this.errorMessage=error.json().msg;
  		this.handleError(error);
  	});
  }

  //get teacher data based on id 
  fetchTeacher():void {
  	this.messageService.showLoader.emit(true);
  	this.teacherService.getTeacher(this.teacherId)
  	.subscribe(response=>{
  		this.messageService.showLoader.emit(false);
  		this.teacherForm.get('email').disable();
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
  	this.teacherId=data._id;
  	this.initializeForm(data);
  }

 // Handle error
 handleError(error) {
 	this.messageService.showLoader.emit(false);
 	this.errorService.handleError(error, this._vcr);
 }
}