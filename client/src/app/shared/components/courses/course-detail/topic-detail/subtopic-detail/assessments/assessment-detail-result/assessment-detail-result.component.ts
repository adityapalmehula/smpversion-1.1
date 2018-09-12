import { Component, OnInit,OnChanges,Input,ViewContainerRef} from '@angular/core';
import { CourseService } from './../../../../../../../services/courses/course.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';

@Component({
  selector: 'app-assessment-detail-result',
  templateUrl: './assessment-detail-result.component.html',
  styleUrls: ['./assessment-detail-result.component.css'],
  providers: [CourseService]
})
export class AssessmentDetailResultComponent implements OnInit,OnChanges {
  @Input() assessmentInfo;

  topics:Array<any>=[];

  constructor(
    private courseService: CourseService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private _vcr: ViewContainerRef,
    ) { }

  ngOnInit() {

  }

 //ng on changes event
 ngOnChanges() {
   if(this.assessmentInfo) {
     if(this.assessmentInfo.questions) {
       this.getTopicsDetails(this.assessmentInfo.questions);
     }
   }
 }

 //get topic details
 getTopicsDetails(questions: any) {
   let topics=[],subtopics=[];
   questions.forEach(q=> {
     q.topicId.map(t=> {
       if(topics.indexOf(t) === -1) topics.push(t);
     })
     q.subTopicId.map(st=> {
       if(subtopics.indexOf(st) === -1) subtopics.push(st);
     })
   });
   if(topics.length) {
     this.messageService.showLoader.emit(true);
     this.courseService.getTopicsWiseSubtopics({topics,subtopics}) 
     .subscribe(response=> {
       this.messageService.showLoader.emit(false);
       if(response['data']) {
         this.topics=response['data'];
       }
     },error=> {
       this.handleError(error);
     });
   }
 }

 //handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.errorService.handleError(error, this._vcr);
 }

}
