import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import {ErrorService } from './../../../../services/common/error.service';
import { CourseService } from './../../../../services/courses/course.service';
import { AuthenticationService } from './../../../..//services/common/authentication.service';

@Component({
	selector: 'app-b2c-courses-detail',
	templateUrl: './b2c-courses-detail.component.html',
	styleUrls: ['./b2c-courses-detail.component.css'],
	providers : [CourseService]
})
export class B2cCoursesDetailComponent implements OnInit {

	constructor(
		private route : ActivatedRoute,
		private courseService: CourseService,
		private errorService: ErrorService,
        private _vcr : ViewContainerRef,
		private authenticationService: AuthenticationService,
		private router: Router) { }

	public courseId: any;
	public courseData: any;
	public errorMessage: any;
	public topicData : any;
	public subTopicData: any;
	public urlPrefix: any;
	public colors = ['#ba68c8','#7986cb','#81c784','#ffb74d','#e57373'];


	ngOnInit() {
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.courseId=this.route.snapshot.params.id;
		this.getCourseDetails(this.courseId);
		sessionStorage.setItem("courseId",this.courseId);
	}


/*get course detail on courseid basis*/
getCourseDetails(courseId: any) {
	if(courseId) {
		this.courseService.getCourse(this.courseId)
		.subscribe(response=> {
			if(response['data']) {
				this.courseData=response['data'];
				this.topicData=this.courseData.topics;
			}
		},error=> {
			this.errorMessage=error.json().msg;
			this.handleError(error);
		});
	}
}

  // Back button Method 
  back(){
  	this.router.navigate(['/', this.urlPrefix, 'allcourses']);
  }

    // Handle error
  handleError(error) {
    this.errorService.handleError(error, this._vcr);
  }
}
