import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { DropEvent } from 'ng-drag-drop';
import { SubTopicService } from './../../../../../../services/subtopics/subtopic.service';
import { CommonConfig } from './../../../../../../config/common-config.constants';
import { ValidationService } from '../../../../../../services/common/validation.service';
import { MessageService } from './../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../services/common/error.service';
import { AssessmentService } from './../../../../../../services/assessments/assessment.service';

@Component({
	selector: 'app-learning-plan',
	templateUrl: './learning-plan.component.html',
	styleUrls: ['./learning-plan.component.css'],
	providers:[ValidationService,AssessmentService]
})
export class LearningPlanComponent implements OnInit, OnChanges{
	@Input() subTopicId;
	@Input() subTopicData;
	@Output() learningPlanUpdated = new EventEmitter();
	@Input() courseStatus;
	public subTopicDetails: any;
	videos: Array<{}>;
	assessments: Array<{}>;
	media: Array<{}>;
	notes: Array<{}>;
	keypoints: Array<{}>;
	references: Array<{}>;
	learningData: Array<{}>;
	public errorMessage: any;
	public mainContent: any;
	public otherContents: Array<{}>  = [];
	public title=CommonConfig.BUTTON_TYPE[0];
	public updateStepperId: any;
	public subTopicContent : Array<{}>=[];
	public learningPathTitle : any='';
  public cStatus : String;  //courseStatus
  CONFIG=CommonConfig;

	constructor(
		private _vcr: ViewContainerRef,
		private subTopicService: SubTopicService,
		private validationService : ValidationService,
		private assessmentService : AssessmentService,
		private messageService : MessageService,
		private errorService: ErrorService
		) { }

	ngOnInit() {
		let id=this.subTopicId.split('?');
		this.subTopicId=id[0];
	}
	ngOnChanges(){
   this.cStatus=this.courseStatus;
		this.subTopicData=this.subTopicData;
		this.getAllData();
	}
	
	getAllData(){
		this.subTopicDetails= this.subTopicData;
		this.subTopicContent= JSON.parse(JSON.stringify(this.subTopicData));
		this.videos=this.subTopicDetails.videos;
		this.media=this.subTopicDetails.media;
		this.notes=   this.subTopicDetails.notes;
		this.keypoints=this.subTopicDetails.keypoints;
		this.references=this.subTopicDetails.references;
		this.learningData= this.subTopicDetails.learningPaths;
		this.getAssessments(this.subTopicId);
	}

//get assessment by subtopic id
getAssessments(subTopicId:string) {
	this.messageService.showLoader.emit(true);
	this.assessmentService.getAssessmentsBySubTopicId(subTopicId)
	.subscribe(response=>{
		this.messageService.showLoader.emit(false);
		if(response['success'] && response['data']) {
			this.assessments=response['data'];
			this.subTopicContent['assessments']=this.assessments;
		}
	},(error:any)=> {
		this.messageService.showLoader.emit(false);
		this.errorMessage = error.json().msg;
		this.handleError(error);
	})
}

  // content drop on main content section
  onMainContentDrop(e:DropEvent) {

  	let data= {
  		"contentId":e.dragData._id,
  		"title":e.dragData.title,
  		"type": e.dragData.type
  	}
  	if(e.dragData.assessment) {
  		data['title']= e.dragData.assessment;
  		data['type']= CommonConfig.CONTENTS[5];
  	}
  	if(!this.mainContent){
  		this.mainContent = data;
  		this.removeItem(e.dragData._id,e.dragData.type);
  	}
  	this.errorMessage='';
  }

  // content drop on othercontent section
  onOtherContentDrop(e:DropEvent) {
  	let data= {
  		"contentId":e.dragData._id,
  		"title":e.dragData.title,
  		"type": e.dragData.type
  	}
  	this.otherContents.push(data);
  	this.removeItem(e.dragData._id,e.dragData.type);
  }

  // remove items from contents
  removeItem(item: any, contentType) {
  	if(contentType===CommonConfig.CONTENTS[0]){
  		let index = this.videos.map(function (e, index) {
  			return e['_id'];
  		}).indexOf(item);
  		this.videos.splice(index, 1);
  	} else if(contentType===CommonConfig.CONTENTS[1]){
  		let index = this.notes.map(function (e) {
  			return e['_id'];
  		}).indexOf(item);
  		this.notes.splice(index, 1);	
  	} else if(contentType===CommonConfig.CONTENTS[2]){
  		let index = this.keypoints.map(function (e) {
  			return e['_id'];
  		}).indexOf(item);
  		this.keypoints.splice(index, 1);	
  	} else if(contentType===CommonConfig.CONTENTS[3]){
  		let index = this.references.map(function (e) {
  			return e['_id'];
  		}).indexOf(item);
  		this.references.splice(index, 1);	
  	} else if(contentType===CommonConfig.CONTENTS[4]){
  		let index = this.media.map(function (e) {
  			return e['_id'];
  		}).indexOf(item);
  		this.media.splice(index, 1);	
  	} else if(contentType===CommonConfig.CONTENTS[5]) {
  		let index = this.media.map(function (e) {
  			return e['_id'];
  		}).indexOf(item);
  		this.media.splice(index, 1);  
  	}
  }

	// Validate learning path data
	validateStep(learningPath) {
		let msg = '';
		let isValid = true;
		if(learningPath.title.trim() === '' ) {
			msg = 'Learning path title';
			isValid = false;
		} else if (!learningPath.mainContent) {
			msg = 'Main content';
			isValid = false;
		}
		return {msg: msg+" should not be blank",
		isValid: isValid};
	}

// add stepper
addStepper(){
	let stepperContent= {
		'title': this.learningPathTitle,
		'mainContent':this.mainContent,
		'otherContents':this.otherContents
	}
	let validation = this.validateStep(stepperContent);
	if (validation.isValid) {
		this.messageService.showLoader.emit(true);
		this.subTopicService.insertLearningData(this.subTopicId,stepperContent).subscribe(response=>{
			if(response['success']) {
				this.learningData=response.data.learningPaths;
				this.messageService.showLoader.emit(false);
				this.learningPlanUpdated.emit();
				this.clearLearningContent();
				this.messageService.successMessage('Learning Path', 'Added successfully');
			}
		},(error: any) => {
			this.messageService.showLoader.emit(false);
			let errorObj = error.json();
			if (errorObj.msg) {
				this.errorMessage = errorObj.msg;
				this.handleError(error);
			}
			this.handleError(error);
		})
	} else {
		this.errorMessage= validation.msg;
	}

}

//get data for update stepper
setLearningPath(stepperId: any) {
	this.updateStepperId=stepperId;
	this.title=CommonConfig.BUTTON_TYPE[1];
	let selectedLearningPath= this.learningData.filter((data: any)=>
		data._id===this.updateStepperId
		)[0];
	this.learningPathTitle= selectedLearningPath['title'];
	this.mainContent=selectedLearningPath['mainContent'];
	this.otherContents=selectedLearningPath['otherContents'];
}


// update stepper
updateStepper(){
	let stepperData={
		'title': this.learningPathTitle,
		'mainContent':this.mainContent,
		'otherContents':this.otherContents,
		_id:this.updateStepperId
	}
	let validation = this.validateStep(stepperData);
	if (validation.isValid) {
		this.messageService.showLoader.emit(true);
		this.subTopicService.updateLearningData(this.subTopicId,this.updateStepperId,stepperData).subscribe(response=>{
			if(response['success']){
				this.messageService.showLoader.emit(false);
				this.learningPlanUpdated.emit();
				this.messageService.successMessage('Learning Path', 'Updated successfully');
				this.clearLearningContent();
				let index: any;
				this.learningData.map((data ,i)=>{ if(data['_id']==stepperData._id){ index=i; return }  });
				this.learningData[index]=stepperData;
				this.title=CommonConfig.BUTTON_TYPE[0];
			}
		},(error: any) => {
			this.messageService.showLoader.emit(false);
			let errorObj = error.json();
			if (errorObj.msg) {
				this.errorMessage = errorObj.msg;
				this.handleError(error);
			}
			this.handleError(error);
		})
	} else {
		this.errorMessage= validation.msg;
	}
}

// delete stepper
deleteStepper(stepperId:any){
	this.messageService.deleteConfirmation(()=>{
		this.messageService.showLoader.emit(true);
		this.subTopicService.deleteLearningData(this.subTopicId, stepperId).subscribe(response=>{
			if(response['success']) {
				let index: any;
				this.learningData.map((data ,i)=>{ if(data['_id']==stepperId){ index=i; return }  });
				this.learningData.splice(index,1);
				this.clearLearningContent();
				this.messageService.showLoader.emit(false);
				this.messageService.successMessage('Learning Path', 'Deleted successfully');
			}
		},(error: any) => {
			this.messageService.showLoader.emit(false);
			let errorObj = error.json();
			if (errorObj.msg) {
				this.errorMessage = errorObj.msg;
				this.handleError(error);
			}
			this.handleError(error);
		})
	});
}

// remove maincontent data
removeMainContentData(data: any) {
	this.addItem(data.contentId, data.type);
	this.mainContent='';
	this.errorMessage="Main content should not be blank";

}

// remove otherContent data
removeOtherContentData(data: any, index) {
	this.addItem(data.contentId, data.type);
	this.otherContents.splice(index, 1);
}


// add data to content
addItem(contentId, contentType) {

	let subTopicContent = <Array<any>>this.subTopicContent[contentType];

	let data = subTopicContent.filter(function (e, index) {
		return e['_id']==contentId;
	});
	let index = subTopicContent.indexOf(data[0]);

	if(contentType===CommonConfig.CONTENTS[0]){
		let arry = this.videos.filter(function (e, index) {
			return e['_id']==contentId;
		});
		if(arry.length==0){
			this.videos.splice(index,0,data[0]);
		}
	} else if(contentType===CommonConfig.CONTENTS[1]){
		let arry = this.notes.filter(function (e, index) {
			return e['_id']==contentId;
		});
		if(arry.length==0){
			this.notes.splice(index,0,data[0]);
		}
	} else if(contentType===CommonConfig.CONTENTS[2]){
		let arry = this.keypoints.filter(function (e, index) {
			return e['_id']==contentId;
		});
		if(arry.length==0){
			this.keypoints.splice(index,0,data[0]);
		}
	} else if(contentType===CommonConfig.CONTENTS[3]){
		let arry = this.references.filter(function (e, index) {
			return e['_id']==contentId;
		});
		if(arry.length==0){
			this.references.splice(index,0,data[0]);
		}
	} else if(contentType===CommonConfig.CONTENTS[4]){
		let arry = this.media.filter(function (e, index) {
			return e['_id']==contentId;
		});
		if(arry.length==0){
			this.media.splice(index,0,data[0]);
		}
	}
}

// get updated data
getLearningPaths(){
	this.subTopicService.learningPlanUpdatedEvent.emit();
}

// Rotate the arrow icon
rotate(id) {
	document.getElementById(id).classList.toggle('rotate-up');
	document.getElementById(id).classList.toggle('rotate-down');
}

/* clear all learning content*/
clearLearningContent(){
	this.mainContent='';
	this.otherContents=[];
	this.learningPathTitle = '';
}

rearrangeLP(){
	this.subTopicService.rearrangeLP(this.learningData,this.subTopicId).subscribe((res)=>{
		if(res['success']){
			this.messageService.showLoader.emit(false);
			this.messageService.successMessage('Learning Path', 'Successfully Rearranged');
		}
	}, (error:any)=>{
		let errorObj = error.json();
		if (errorObj.msg) {
			this.errorMessage = errorObj.msg;
			this.handleError(error);
		}
		this.handleError(error);
	})
}

  // Handle error
  handleError(error) {
  	this.errorService.handleError(error, this._vcr);
  }
}