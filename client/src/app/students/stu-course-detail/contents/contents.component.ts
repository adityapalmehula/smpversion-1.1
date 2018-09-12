import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { SubTopicService } from './../../../shared/services/subtopics/subtopic.service'
import { CommonConfig } from '../../../shared/config/common-config.constants';
import { AuthenticationService } from './../../../shared/services/common/authentication.service';

@Component({
  selector: 'app-contents',
  templateUrl: './contents.component.html',
  styleUrls: ['./contents.component.css'],
  providers: [SubTopicService]
})
export class ContentsComponent implements OnInit {
	@Input() subTopicId;
	@Input() subTopic;
	@Input() index;
	@Input() flow;
	public subTopicData: any;
	public subTopiTitile: any;
	public learningPaths = [];
  public learningProgressStatus= CommonConfig.LEARNING_PROCESS_STATUS;
  CONFIG:any=CommonConfig;
  role:string;

  constructor(
    private subTopicService: SubTopicService,
    private authenticationService: AuthenticationService,
    private _vcr : ViewContainerRef
    ) { }

  ngOnInit() {
  	// this.getSubtopicData(this.subTopicId);
  	this.learningPaths = this.subTopic.learningPaths;
    this.subTopiTitile = this.subTopic.title;
    this.role=this.authenticationService.userRole;


  }
  /*get subtopic data on basis of subtopic id*/
	// getSubtopicData(subTopicId) {
	// 	if(this.subTopicId){
	// 		this.subTopicService.getSubTopic(subTopicId)
	// 		.subscribe(response=>{
	// 			if(response['data']) {
	// 				this.subTopicData=response['data'];
	// 				this.learningPaths=this.subTopicData.learningPaths;
	// 				this.subTopiTitile=this.subTopicData.title;
	// 			}
	// 		})
	// 	}
	// }


  /* open content*/
  openContent(){
    
  }

	// Rotate the arrow icon
	rotate(id) {
		document.getElementById(id).classList.toggle('rotate-up');
		document.getElementById(id).classList.toggle('rotate-down');
	}

}
