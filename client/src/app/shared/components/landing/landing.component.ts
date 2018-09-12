import { Component, OnInit, Inject, ViewContainerRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup,FormBuilder,Validators} from '@angular/forms';
import { StudentService } from '../../services/students/student.service';
import { CommonConfig } from './../../config/common-config.constants';
import { MessageService } from './../../services/common/message.service';
import { MessageConfig } from './../../config/message-config.constants';
import { AuthenticationService } from './../../services/common/authentication.service';
import { ErrorService } from './../../services/common/error.service';
import { CategoryService } from './../../services/categories/category.service';


@Component({
	selector: 'app-landing',
	templateUrl: './landing.component.html',
	styleUrls: ['./landing.component.css'],
	providers: [StudentService,CategoryService]
})
export class LandingComponent implements OnInit {
	public errorMessage: any;
	public urlPrefix: any;
	updateClassForm: FormGroup;
	public fb:FormBuilder;
  @ViewChild('selectClass') selectClass;
  public classes = CommonConfig.ACADEMIC.CLASSES;
  public selectedClass: any;
  public boardSelected : any;
  public categoryDetails: any;
  public classSelected : any;
  public dataArray : any;
  public subCategories: any;
  public totalItems: number = 0;
  public textSelected : any;
  public selectedBoardId : any;
  public selectedClassName : any;
  public ClassObj : any;

	constructor(
		@Inject(FormBuilder)fb:FormBuilder,
		private router: Router,
		private studentService: StudentService,
		private messageService: MessageService,
		private authenticationService: AuthenticationService,
		private errorService: ErrorService,
		private categoryService: CategoryService,
		private _vcr : ViewContainerRef,
		) { 
		this.navigateUser();
		this.fb=fb;
		this.intializeForm(fb);
	}
   
   intializeForm(fb:FormBuilder,data:any={}):void{
		this.updateClassForm=fb.group({
			board: [data.board || '',[]],
			class: [data.class || '',[]],
		});
	}

	ngOnInit() {
		this.getCategories();
	}
  /* get all categories data*/
  getCategories() {
  	this.categoryService.categoryGet()
    .subscribe(res => {
      if(res.data){        
        this.categoryDetails=res.data;
      }
    },
    (error) => {
      this.handleError(error);
    });
  }
  getCourseBasisCategoryValue(){
  	if(this.selectedBoardId){
  	this.getSubCategories(this.selectedBoardId)
    }else{
    }
  }
  // getting all category 
  getCategory()
  {
  	const ClassObj = this.subCategories.find( Obj => Obj.name === this.selectedClassName )
    this.ClassObj=ClassObj;
  }
  //Update class value in database 
  UpdateClassInfo(){
   let ClassObject= {
    		id:this.ClassObj._id,
    		name:this.ClassObj.name,
    	}
    	this.studentService.updateClass(ClassObject).subscribe((res: any) => {
  		this.messageService.showLoader.emit(false);
  		if (res) {
  		
  		}
  	},error => {
  		this.handleError(error);
  	});
  
  }

  // Get SUbcategories on basis of category id
  getSubCategories(categoryId) {
    this.messageService.showLoader.emit(true);
    this.categoryService.getSubCategories(categoryId).subscribe(
      data => {
        this.messageService.showLoader.emit(false);
         this.subCategories =data;
      },
      error => {  
      let errorObj = error.json();
      this.handleError(error);
        if (errorObj.msg) {
          this.errorMessage = errorObj.msg;
        }
        });
  }

  openModel() {
  document.getElementById("selectClassByModal").click();
   }
  
  //fetch courses and navigate user 
  navigateUser(){
  	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
  	this.errorMessage='';
  	this.messageService.showLoader.emit(true);
  	this.studentService.getCourses(CommonConfig.COURSESFLAG.THREE).subscribe((res: any) => {
  		debugger;
  		this.messageService.showLoader.emit(false);
  		debugger;
  		if (res.data) {
  			if(res['data']['qualification'].name) {
	  			if(res['data'].courseCount) {
	  				this.router.navigate(['/', this.urlPrefix, 'mycourses']);
	  			} else {
	  				this.router.navigate(['/', this.urlPrefix, 'allcourses']);
	  			}
  			}else {
  				this.openModel();
  			}

  		}
  	},error => {
  		this.handleError(error);
  	});
  }
  
  // Handle error
  handleError(error) {
  	this.errorMessage = error.json().msg;
  	this.errorService.handleError(error, this._vcr);
  }

}
