import { Component, OnInit, ViewContainerRef,ViewChild,ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from './../../services/common/message.service';
import { CommonConfig } from './../../config/common-config.constants';
import { AuthenticationService } from '../../services/common/authentication.service';
import { ClassService } from './../../services/classes/class.service';
import { ReleaseCourseService } from './../../services/courses/release-course.service';
import { TeacherService } from './../../services/teachers/teacher.service';
import { AppConfig } from './../../config/app-config.constants';
import { ErrorService } from './../../services/common/error.service';
import { forkJoin } from "rxjs/observable/forkJoin";

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css'],
  providers: [ ClassService,ReleaseCourseService,TeacherService]
})

export class ClassesComponent implements OnInit {
  @ViewChild('closeModal')closeModal: ElementRef;
  classes:any=[];
  subCategoryId: string;
  classId:string;
  urlPrefix:string="";

  sections:any=[];
  
  courseConfig:any={};
  courseMaster:any=[];
  courseList:any=[];
  selectedCourses:any=[];

  teacherConfig:any={};
  teacherMaster:any=[];
  teacherList:any=[];
  selectedTeachers:any=[];

  constructor(
    private classService : ClassService,
    private releaseCourseService : ReleaseCourseService,
    private teacherService : TeacherService,
    private router : Router,
    private messageService : MessageService,
    private authenticationService : AuthenticationService,
    private errorService: ErrorService,
    private _vcr: ViewContainerRef,
    ) { }

  ngOnInit() {
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.loadConfig();
    this.getFilterData();
    this.getClasses();
  }

  //load config
  loadConfig() {
    this.courseConfig = { 
      singleSelection: false, 
      text:"Select courses",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 6,
    }; 

    this.teacherConfig = { 
      singleSelection: false, 
      text:"Select teachers",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 6,
    };
  }

  //get filter data
  getFilterData() {
    this.messageService.showLoader.emit(true);
    forkJoin([this.releaseCourseService.getCoursesWithSubCategory('courseFilter'),this.teacherService.getTeacherBySchool()])
    .subscribe((results: any) => {
      this.messageService.showLoader.emit(false);
      if(results[0]) {
        let res=results[0];
        if(res['data'] && res['data'].courses) {
          this.courseMaster=res['data'].courses;
        }
      }
      if(results[1]) {
        if(results[1]['data']) {
          this.teacherMaster=results[1]['data'].map(ele=> ({id: ele._id,itemName: ele.name}));
          this.teacherList=this.teacherMaster;
        }
      }
    },error => {
      this.handleError(error);
    });
  }

  //get classes
  getClasses() {
    this.messageService.showLoader.emit(true);
    this.classService.getClassesBySchool().subscribe((res: any) => {
      this.messageService.showLoader.emit(false);
      if(res['data']) {
        this.classes=res['data'];
      }
    },error => {
      this.handleError(error);
    });
  }

  //set class od
  setClassId(classId:string) {
    this.classId=classId;
  }

  //set subCategory id
  setSubCategory(subCategoryId: string,classId:string) {
    this.subCategoryId=subCategoryId;
    this.classId=classId;
    this.selectedCourses=[];
    this.selectedTeachers=[];
    this.setSubjects();
  }

  //set subjects
  setSubjects() {
    this.courseList=this.courseMaster
    .filter(course=> course.subcategory._id== this.subCategoryId)
    .map(ele=> ({id: ele.courseId,itemName: ele.title}));
    let classInfo=this.classes.find(cls=> cls._id==this.classId);
    if(classInfo) {
      if(classInfo['subjects']) {
        classInfo['subjects'].forEach(id=> {
          let course=this.courseMaster.find(c=>c.courseId==id);
          if(course) {
            this.selectedCourses=this.selectedCourses.concat({id: course.courseId,itemName: course.title});
          }
        })
      }
      if(classInfo['teachers']) {
        classInfo['teachers'].forEach(id=> {
          let teacher=this.teacherMaster.find(t=>t.id==id);
          if(teacher) {
            this.selectedTeachers=this.selectedTeachers.concat(teacher);
          }
        })
      }
    }
  }

  //clear assign course filters
  clearAssignCourseFilters() {
    this.courseList=[];
    this.selectedCourses=[];
  }

  //assign coursess
  assignCourses() {
    if(this.selectedCourses.length) {
      this.messageService.showLoader.emit(true);
      let courses= this.selectedCourses.map(ele=>ele.id);
      let data={courses};
      if(this.selectedTeachers.length) {
        data['teachers']=this.selectedTeachers.map(ele=>ele.id);
      }
      this.classService.assignCourses(this.classId,data)
      .subscribe(response=>{ 
        this.messageService.showLoader.emit(false);
        if(response['success']) {
          this.getClasses();
          this.messageService.showSuccessToast(this._vcr,'Assign courses successfully');
          this.clearAssignCourseFilters();
          this.closeModal.nativeElement.click();
        }
      },error=>{
        this.handleError(error);
      });
    }else {
      this.messageService.showErrorToast(this._vcr,'No course has been selected!');
    }
  }

 //handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 }

}
