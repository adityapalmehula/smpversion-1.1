import { Component, OnInit, AfterViewInit, Inject,ViewContainerRef,ViewChild } from '@angular/core';
import {
	FormGroup,
	FormBuilder,
	Validators,
	FormControl
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationConfig } from './../../../../shared/config/validation-config.constants';
import { CategoryService } from './../../../services/categories/category.service';
import { CourseService } from './../../../services/courses/course.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';
import { AuthenticationService } from './../../../../shared/services/common/authentication.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { MessageConfig } from './../../../config/message-config.constants';
import { AppConfig } from './../../../config/app-config.constants';
import { Config } from './add-course.config';


@Component({
	selector: 'app-add-course',
	templateUrl: './add-course.component.html',
	styleUrls: ['./add-course.component.css'],
	providers: [CategoryService, CourseService, MessageService]
})

export class AddCourseComponent implements OnInit, AfterViewInit {
  @ViewChild('setOnClose') setOnClose;
  public courseForm: FormGroup;
  public categories: any;
  public errMessage: any;
  public errorMessage: any;
  public subCategories: any;
  public role: string = "";
  private fb: FormBuilder;
  public courseId: string = "";
  public urlPrefix: String;
  public isPaid =false;
  public activationMethod = false;
  public shortDescription: any ='';
  public longDescription: any ='';
  public prerequisites: any ='';
  public status : any = CommonConfig.STATUS.ACTIVE;
  public courseType:  any = CommonConfig.COURSE_TYPE;
  public activationMethodType: any = CommonConfig.ACTIVATION_METHOD;
  public currency: any = CommonConfig.CURRENCY;
  tags:any=[];
  imgPath:string="";
  public imgError: any;
  public imageChangedEvent: any;
  public croppedImage: any;
  public coursePicture: any;
  public courseCroppedIcon='';
  public imageStatus=false;
 //  offeredPrice:number;
 public backendErrorMsg = [];
 public Config : any=Config;


 constructor(
   @Inject(FormBuilder) fb: FormBuilder,
   private router: Router,
   private route: ActivatedRoute,
   private categoryService: CategoryService,
   private courseService: CourseService,
   private errorService: ErrorService,
   private messageService: MessageService,
   private authenticationService: AuthenticationService,
   private _vcr : ViewContainerRef,
   ) {
   this.fb = fb;
   this.intializeForm();
 }

 onFileChange(event) {
   if(event.target.files.length > 0) {
     let file = event.target.files[0];
     if(file.size>AppConfig.COURSE_IMAGE_SIZE[0])  {
       this.courseForm.get('icon').setValue('');
       return this.messageService.showErrorToast(this._vcr,MessageConfig.FILE_UPLOAD.FILE_SIZE_ERROR + AppConfig.COURSE_IMAGE_SIZE[1] +" kb");
     }else {
       this.courseForm.get('icon').setValue(file);
     }
   }
 }
// method to be called when file upload button is clicked
fileChangeEvent(event: any): void {
  this.imgError='';
  this.croppedImage=''; 
  this.imageChangedEvent = event;
}

/* method to be called when image cropped*/
imageCropped(image: string) {
  this.croppedImage = image;
}

/* method to be called when image failed*/
loadImageFailed(){
  this.imgError=MessageConfig.FILE_UPLOAD.FILE_TYPE_ERROR;
}
setImage(){
  if(!this.croppedImage){
    this.imgError='';
    this.coursePicture='';
    this.imageChangedEvent='';
    return this.imgError=MessageConfig.FILE_UPLOAD.SELECT_FILE;
  }
  let y=1;
  let last2=this.croppedImage.slice(-2);
  if(last2=='==') {
    y=2;
  }
  let size=(this.croppedImage.length*(3/4))-y;
  if(size>AppConfig.COURSE_IMAGE_SIZE[0]) {
    this.imgError=MessageConfig.FILE_UPLOAD.FILE_SIZE_ERROR + AppConfig.COURSE_IMAGE_SIZE[1] +'KB';
    return this.imgError;
  }
  this.courseCroppedIcon=this.croppedImage;
  this.imageStatus=true;
  this.setOnClose.nativeElement.click();
}

close(){
  this.imgError='';
  this.coursePicture='';
  this.imageChangedEvent='';
  this.croppedImage='';
}

  //intialize form 
  intializeForm(data: any={}): void {
  	let category = "";
  	let subCategory = "";
  	let offeredPrice ="";
    let actualPrice ="";
    let isPaid ="";
    let discount:number =0;
    if(data.isPaid!=null && data.isPaid!= undefined) {
      isPaid=data.isPaid;
    }
    if (data.category) {
      category = data.category;
    }
    if (data.subcategory) {
      subCategory = data.subcategory;
    }
    if(data.price) {
      if(data.price.offered) {
        offeredPrice =data.price.offered;
      }
      if(data.price.actual) {
        actualPrice =data.price.actual;
      }
      if(data.price.discount) {
        discount =data.price.discount;
      }
    }
    if(data.tags) {
      this.tags=data.tags || [];
    }

    this.courseForm = this.fb.group({
      category: [category, [Validators.required]],
      subCategory: [subCategory, [Validators.required]],
      title: [data.title || '', [Validators.required, Validators.minLength(this.Config.title.minlength[0]),
      Validators.maxLength(this.Config.title.maxlength[0])]],
      type : [data.type || '', [Validators.required]],
      isPaid : [isPaid, [Validators.required]],
      activationMethod : [data.activationMethod || '', [Validators.required]],
      currency : [data.currency || '', [Validators.required]],
      actualPrice : [ actualPrice || '', [Validators.required,Validators.pattern(ValidationConfig.NUMBER_PATTERN)]],
      discount: [{value: discount, disabled:false}, [Validators.required,,Validators.pattern(ValidationConfig.NUMBER_PATTERN),Validators.max(100)]],
      offeredPrice : [offeredPrice || '', [Validators.required, Validators.pattern(ValidationConfig.NUMBER_PATTERN)]],
      duration : [data.duration || '', [Validators.required,Validators.pattern(ValidationConfig.NUMBER_PATTERN), Validators.min(this.Config.duration.min[0]),Validators.max(this.Config.duration.max[0])]],
      icon: [data.icon || ''],
    },{ validator: this.compareWithActualPrice });
    this.courseForm.get('discount').valueChanges.subscribe(()=> {
      this.calculateOfferPrice();
    },error=>{
      this.handleError(error);
    });
    this.courseForm.get('actualPrice').valueChanges.subscribe(()=>{
      this.calculateOfferPrice()
    },error=>{
      this.handleError(error);
    });
    this.courseForm.get('isPaid').valueChanges.subscribe(()=>{
      let isPaid=this.courseForm.get('isPaid').value;
      this.onIsPaidChange(isPaid);
    },error=>{
      this.handleError(error);
    });
    this.courseForm.get('activationMethod').valueChanges.subscribe(()=>{
      let activationMethod=this.courseForm.get('activationMethod').value;
      this.onActiMethodChange(activationMethod);
    },error=>{
      this.handleError(error);
    });
  }

  ngOnInit() {
  	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  	this.courseId = this.route.snapshot.params['id'];
  }


  /*on onActivationMethod changes change discount and offered price*/
  onActiMethodChange(value){
    if(value=='Promotion' || value=='Auto'){
      this.courseForm.controls['discount'].setValue(100);
      this.courseForm.get('discount').disable();
      this.courseForm.get('offeredPrice').disable();
    }else {
      this.courseForm.controls['discount'].setValue(0);
      this.courseForm.get('discount').enable();
      this.courseForm.get('offeredPrice').enable();
    }
  }


  /*on ispaid changes change discount, offered price and activation method */
  onIsPaidChange(value){
    if(value=='true'){
      this.courseForm.controls['discount'].setValue(0);
      this.courseForm.get('discount').enable();
      this.courseForm.get('offeredPrice').enable();
      this.courseForm.controls['activationMethod'].setValue('');
      this.courseForm.get('activationMethod').enable();
    } else {
      this.courseForm.controls['discount'].setValue(100);
      this.courseForm.get('discount').disable();
      this.courseForm.get('offeredPrice').disable();
      this.courseForm.controls['activationMethod'].setValue('Auto');
      this.courseForm.get('activationMethod').disable();
    }
  }

  //price validation
  compareWithActualPrice(group: FormGroup) {
    let offeredPrice= group.controls.offeredPrice,
    actualPrice = group.controls.actualPrice;
    if(parseInt(offeredPrice.value) > parseInt(actualPrice.value)) {
      return offeredPrice.setErrors({ maxOfferPrice: true })
    }else {
      return offeredPrice.setErrors(null);
    }
  }

  //calculate offer price
  calculateOfferPrice():any {
    let discount= this.courseForm.get('discount').value || 0;
    let actualPrice= this.courseForm.get('actualPrice').value || 0;
    let discountAmount= (parseInt(actualPrice)*parseInt(discount))/100;;
    let offerPrice=actualPrice-discountAmount;
    this.courseForm.controls['offeredPrice'].setValue(offerPrice);
  }

  ngAfterViewInit() {
    if(this.courseId !== '' && this.courseId !== undefined) {
      this.getCourse(this.courseId);
    }
    this.getCategory();
  }
  // Get all categories
  getCategory() {
  	this.categoryService.categoryGet().subscribe(res => {
      this.categories = res.data.filter((data => data.status === CommonConfig.STATUS.ACTIVE));
    },error => {
      let errMsg = error.json();
      this.errMessage = error.msg;
      this.handleError(error);
    });
  }

  // on category basis get subcategory
  selectedCategory() {
  	this.getSubCategories(this.courseForm.get('category').value);
  }

  // Get subcategory on category basis
  getSubCategories(categoryId: string) {
  	return new Promise(resolve => {
  		this.categoryService.getSubCategories(categoryId).subscribe(
  			data => {
  				this.subCategories = data.filter((data => data.status === CommonConfig.STATUS.ACTIVE));
  				resolve();
  			},
  			error => {
  				let errMsg = error.json();
  				this.errMessage = errMsg.msg;
          this.handleError(error);
        });
  	})
  }

  // Save Course
  saveCourse(data: any) {
    let formData =new FormData();
    let iconValue= this.courseForm.get('icon').value;

    if(this.shortDescription.length<=this.Config.shortDescription.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.shortDescription.minlength[1]);
    } else if (this.shortDescription.length>=this.Config.shortDescription.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.shortDescription.maxlength[1]);
    }

    if(this.longDescription.length<=this.Config.longDescription.minlength[0]){
      return this.messageService.showErrorToast(this._vcr,this.Config.shortDescription.minlength[1]);
    } else if (this.longDescription.length>=this.Config.longDescription.maxlength[0]) {
      return this.messageService.showErrorToast(this._vcr,this.Config.longDescription.maxlength[1]);
    }
    
    if(this.tags.length<1) {
      return this.messageService.showErrorToast(this._vcr,"Tags required");
    }
    if(!this.courseCroppedIcon || this.courseCroppedIcon==null){
      return this.messageService.showErrorToast(this._vcr,"Course icon is required");
    }

    // if(!iconValue || iconValue==null) {
    //   return this.messageService.showErrorToast(this._vcr,"Course icon is required");
    // } else{
    //   formData.append('icon',iconValue);
    // }
    this.messageService.showLoader.emit(true);
    
    let courseData = {
      subcategory: data.get('subCategory').value,
      category: data.get('category').value,
      title: data.get('title').value,
      shortDescription: this.shortDescription,
      longDescription: this.longDescription,
      type: data.get('type').value,
      isPaid: data.get('isPaid').value,
      activationMethod: data.get('activationMethod').value,
      currency: data.get('currency').value,
      prerequisites: this.prerequisites,
      tags: this.tags,
      price: {
        actual: data.get('actualPrice').value,
        offered: data.get('offeredPrice').value,
        discount: data.get('discount').value,
      },
      duration: data.get('duration').value,
      status: this.status,
      icon:this.courseCroppedIcon
    }
    this.courseService.addCourse(courseData).subscribe((res: any) => {
      if(res['success']) {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Course', 'Successfully Saved');
        this.router.navigate(['/',this.urlPrefix, 'courses', ])
      }
    }, error => {
      let errMsg = error.json();
      this.errMessage = errMsg.msg;
      this.handleError(error);
    })
  }

  // Get course on basis of courseId
  getCourse(courseId) {
  	this.courseService.getCourseData(courseId).subscribe(res => {
  		this.messageService.showLoader.emit(true);
  		this.getSubCategories(res.data.category).then(success => {
  			this.longDescription=res.data.longDescription;
  			this.shortDescription=res.data.shortDescription;
        this.prerequisites= res.data.prerequisites;
        if(res.data && res.data.icon) {
          this.imgPath=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[0]+res.data.icon;
        }
        this.status=res.data.status;
        this.messageService.showLoader.emit(false);
        this.intializeForm(res.data);
      });
  	},error=> {
  		this.messageService.showLoader.emit(false);
  		let errMsg = error.json();
  		this.errMessage = errMsg.msg;
      this.handleError(error);
    });
  }


  // update Course
  updateCourse(data: any) {
    let formData=null;
    if(!this.shortDescription){
      return this.messageService.showErrorToast(this._vcr,"Short description is required");
    } else if(!this.longDescription){
      return this.messageService.showErrorToast(this._vcr,"Long description is required");
    }
    if(this.tags.length<1) {
      return this.messageService.showErrorToast(this._vcr,"Tags required");
    } 

    let courseData = {
      subcategory: data.get('subCategory').value,
      category: data.get('category').value,
      title: data.get('title').value,
      shortDescription:this.shortDescription,
      longDescription: this.longDescription,
      type: data.get('type').value,
      isPaid: data.get('isPaid').value,
      activationMethod: data.get('activationMethod').value,
      currency: data.get('currency').value,
      tags: this.tags,
      prerequisites: this.prerequisites,
      price: {
        offered: data.get('offeredPrice').value,
        actual: data.get('actualPrice').value,
        discount: data.get('discount').value,
      },
      duration: data.get('duration').value,
      status: this.status,
    }
    if(this.courseCroppedIcon) {
      courseData['icon']=this.courseCroppedIcon
    }
    this.messageService.showLoader.emit(true);
    this.courseService.updateCourse(courseData, this.courseId).subscribe((res: any) => {
      if (res['success']) {
        this.messageService.showLoader.emit(false);
        this.messageService.successMessage('Course', 'Successfully updated');
        this.router.navigate(['/',this.urlPrefix, 'courses', ])
      }
    }, (error: any) => {
      this.messageService.showErrorToast(this._vcr,error.json().msg);
      this.handleError(error);

    });
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

 }
