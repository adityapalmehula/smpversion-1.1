import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthenticationService } from '../../services/common/authentication.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';
import { CommonConfig } from './../../config/common-config.constants';
import { CourseService } from './../../services/courses/course.service';

@Component({
	selector: 'app-rearrange',
	templateUrl: './rearrange.component.html',
	styleUrls: ['./rearrange.component.css'],
	providers : [CourseService]
})
export class RearrangeComponent implements OnInit {
	public courseId : string;
	public topicId : any;
	public urlPrefix : String;
	public permissions = [];
	public originalList=[];
	public rearrangeList=[];
	public errMessage: string;
	public courseData:any;
	public topicData : any;
	public itrateData=[];
	public contentType: any;


	constructor(
		private route: ActivatedRoute,
		private messageService: MessageService,
		private courseService : CourseService,
		private errorService: ErrorService,
        private _vcr : ViewContainerRef,
		private authenticationService : AuthenticationService,
		private router :Router) { }

	ngOnInit() {
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.SUBTOPICS);
		this.courseId = this.route.snapshot.params['courseId'].split('?')[0];
		this.topicId = this.route.snapshot.params['topicId'];
		if(this.topicId) {
			this.topicId = this.route.snapshot.params['topicId'].split('?')[0];
		}
		this.route.queryParams.subscribe((params: Params) => {
			if(params['tab']) {
				this.courseId = this.route.snapshot.params['courseId'].split('?')[0];
				this.topicId = this.route.snapshot.params['topicId'].split('?')[0];
			}
		},error=>{
			this.handleError(error);
		});
		if(this.topicId){
			this.topiDetails(this.topicId);
			this.contentType="Subtopics"
		} else {
			this.courseDetail(this.courseId);
			this.contentType="Topics"
		}
	}

	/* get topic details on basis of topic id*/
	topiDetails(topicId : any) {    
		this.messageService.showLoader.emit(true);
		this.courseService.fetchTopicDetail(topicId).subscribe((res: any) => {
			this.messageService.showLoader.emit(false);
			this.topicData = res.data;
			this.originalList = res.data.subtopics;
			this.rearrangeList = JSON.parse(JSON.stringify(this.topicData['subtopics']));;
		}, (error: any) => {
			this.handleError(error);
			let errMsg = error.json();
			this.errMessage = errMsg.msg;
		})
	}

	 // Get Course on basis of Id
	 courseDetail(courseId : any) {
	 	this.messageService.showLoader.emit(true);
	 	this.courseService.getCourseData(courseId).subscribe(
	 		res => {
	 			this.courseData=res.data;
	 			this.originalList = res.data.topics;
	 			this.rearrangeList = JSON.parse(JSON.stringify(this.courseData['topics']));
	 			this.messageService.showLoader.emit(false);

	 		},
	 		error => {
	 			let errMsg = error.json();
	 			this.errMessage = errMsg.msg;
	 			this.handleError(error);
	 		});
	 }

	 /* rearrange topic by course id*/
	 rearrangeTopic(){
	 	let topicData= {
	 		topics: this.getArrangedData()
	 	};
	 	this.messageService.showLoader.emit(true);
	 	this.courseService.rearrangeTopics(topicData,this.courseId).subscribe((res)=>{
	 		if(res['success']) {
	 			this.messageService.showLoader.emit(false);
	 			this.messageService.successMessage('Course topic', 'Successfully rearranged');
	 			this.router.navigate(['/',this.urlPrefix,'courses',this.courseId]);
	 		}
	 	}, (error:any)=>{
	 		let errMsg = error.json();
	 		this.errMessage = errMsg.msg;
	 		this.handleError(error);
	 	})
	 }

	 /* rearrange subtopic by topic id*/
	 rearrangeSubTopic(){
	 	let subTopicData ={
	 		subtopics:this.getArrangedData()
	 	};
	 	this.messageService.showLoader.emit(true);
	 	this.courseService.rearrangeSubTopics(subTopicData,this.topicId).subscribe((res)=>{
	 		if(res['success']) {
	 			this.messageService.showLoader.emit(false);
	 			this.messageService.successMessage('topic of subtopics', 'Successfully rearranged');
	 			this.router.navigate(['/',this.urlPrefix,'courses',this.courseId,'topics', this.topicId]);
	 		}
	 	}, (error:any)=>{
	 		let errMsg = error.json();
	 		this.errMessage = errMsg.msg;
	 		this.handleError(error);
	 	})

	 }
	 /* get rearranged data*/
	 getArrangedData(){
	 	let dataList= this.rearrangeList.map((data)=>{
	 		return data._id;
	 	});
	 	return dataList;
	 }

 // Handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 }
	}
