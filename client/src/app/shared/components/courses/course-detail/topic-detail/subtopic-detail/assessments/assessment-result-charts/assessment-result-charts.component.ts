import { Component, OnInit, Input, OnChanges,ViewContainerRef} from '@angular/core';
import { CommonConfig } from './../../../../../../../config/common-config.constants';
import { CourseService } from './../../../../../../../services/courses/course.service';
import { MessageService } from './../../../../../../../services/common/message.service';
import { ErrorService } from './../../../../../../../services/common/error.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-assessment-result-charts',
  templateUrl: './assessment-result-charts.component.html',
  styleUrls: ['./assessment-result-charts.component.css'],
  providers: [ CourseService ]
})
export class AssessmentResultChartsComponent implements OnInit, OnChanges {
  @Input() assessmentType?: any;
  @Input() result:any;

  answerStaus:any=["Correct","Incorrect"];
  qusStatus:any= ['Attempted',"Skipped","Not Attempted"];
  levels=['Basic','Intermediate','Expert'];
  qusCategories:any=CommonConfig.ASSESSMENT.QUESTION_CATEGORIES;
  assessmentResult: any={};
  daughnutCharts:any=[];
  barCharts:any=[];
  recomandations:any=[];

  constructor(
    private courseService: CourseService,
    private messageService: MessageService,
    private errorService: ErrorService,
    private toastr: ToastsManager, 
    private _vcr: ViewContainerRef,
    ) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.assessmentResult= this.result;
    if(this.assessmentResult && this.assessmentResult.questions) {
      let questions= this.assessmentResult.questions;
      this.generateRecomandationData(questions);
      this.generateDaughnutChartData(questions,this.assessmentResult);
      this.generateBarChartData(questions,this.assessmentResult);
    }
  }

  //calculate daugnut chart data
  generateDaughnutChartData(questions: any,assessmentResult: any) {
    this.overAllStatus(questions);
    this.accuracyLevel(questions);
    this.marksAccuracyLevel(assessmentResult);
  }

  //over all status of assessment result
  overAllStatus(questions:any) {
    let {correctAns,incAns,skippedQus}=this.calculateAssesmentStatus(questions);
    this.daughnutCharts.push({
      labels: [" Correct"," Incorrect"," Not Attempted"],
      data: [correctAns,incAns,skippedQus],
      text: questions.length,
      title: 'Question Wise Performance',
      toolTipTitle: 'Total Questions : '+questions.length,
    });
  }

  //calculate assessment over all status (correct, incorrect, skipped)
  calculateAssesmentStatus(questions) {
    let correctAns=0,incAns=0,skippedQus=0;
    questions.forEach(q=> {
      if(q.ansStatus== this.answerStaus[0]) ++correctAns;
      if(q.ansStatus== this.answerStaus[1]) (q.status==this.qusStatus[1] || q.status==this.qusStatus[2])? ++skippedQus : ++incAns;
    });
    return {correctAns,incAns,skippedQus}
  }

  //accuracy level charts data
  accuracyLevel(questions:any) {
    let correctAns=0,incAns=0;
    let attemptedQuestions = questions.filter(q=> q.status==this.qusStatus[0]);
    attemptedQuestions.forEach(q=> {
      if(q.ansStatus== this.answerStaus[0]) ++correctAns;
      if(q.ansStatus== this.answerStaus[1]) ++incAns;
    });
    let accuracyStr,accuracy=((correctAns*100)/+attemptedQuestions.length);
    if(isNaN(accuracy)) {
      accuracyStr=0;
    }else {
      accuracyStr=accuracy.toFixed(2);
    }
    this.daughnutCharts.push({
      labels: [" Correct"," Incorrect"],
      data: [correctAns,attemptedQuestions.length-correctAns],
      text: accuracyStr+ ' %',
      type: '1_to_1',
      title: 'Accuracy',
      toolTipTitle: 'Total Attempted : '+attemptedQuestions.length,
    });
  }

  //marks accuracy level
  marksAccuracyLevel(assessmentResult:any) { 
    if(!assessmentResult.totalMarks) return;
    let score=assessmentResult.score || 0,totalMarks=assessmentResult.totalMarks;
    this.daughnutCharts.push({
      labels: [" Marks Obtained"," Marks Not Obtained"],
      data: [score,totalMarks-score],
      text:  score+' / '+assessmentResult.totalMarks,
      type: '1_to_1',
      title: 'Score',
      toolTipTitle: 'Total Marks : '+totalMarks,
    });
  }

  //generate bar chart data
  generateBarChartData(questions: any, assessmentResult: any) {
    this.levelWiseFilterData(questions);
    this.questionCategoriesWise(questions);
  }

  //calculate assessment result based on question level
  levelWiseFilterData(questions: any) {
    let datasets= [
    { label: "Correct", backgroundColor: "#28a745", data: [] },
    { label: "Incorrect", backgroundColor: "#dc3545", data: [] },
    { label: "Unattempted", backgroundColor: "#17a2b8", data: [] }
    ],basicQustions=[],itmQustions=[],expQustions=[];

    questions.forEach(q=> {
      if(q.level== this.levels[0]) basicQustions.push(q);
      else if(q.level== this.levels[1]) itmQustions.push(q);
      else if(q.level== this.levels[2]) expQustions.push(q);
    });
    [basicQustions,itmQustions,expQustions].forEach((qusArr,i)=> {
      let {correctAns,incAns,skippedQus}=this.calculateAssesmentStatus(qusArr);
      datasets[0].data[i]=correctAns;
      datasets[1].data[i]=incAns;
      datasets[2].data[i]=skippedQus;
    });
    this.barCharts.push({
      labels: [[this.levels[0]],[this.levels[1]],[this.levels[2]]],
      data: datasets,
      labelText: {x:'Difficulty Level',y:'No. of Questions'},
      title: 'Difficulty Wise Performance',
    });
  }

  //calculate assessment result based on question categories
  questionCategoriesWise(questions: any) {
    let datasets= [
    { label: "Correct", backgroundColor: "#28a745", data: [] },
    { label: "Incorrect", backgroundColor: "#dc3545", data: [] },
    { label: "Unattempted", backgroundColor: "#17a2b8", data: [] }
    ], categoriesWise = {};
    this.qusCategories.forEach(cat=> {
      categoriesWise[cat]=[0,0,0];
    });
    questions.forEach(q=> {
      let isCorrrect=false, isIncorrrect=false, isSkipped=false;
      if(q.ansStatus== this.answerStaus[0]) {
        isCorrrect= true;
      }
      if(q.ansStatus== this.answerStaus[1]) {
        if(q.status==this.qusStatus[1] || q.status==this.qusStatus[2]) {
          isSkipped=true;
        } else {
          isIncorrrect=true;
        }
      }
      q.qusCategories.map(cat=> {
        if(categoriesWise[cat]) {
          if(isCorrrect) {
            categoriesWise[cat][0]=categoriesWise[cat][0]+1;
          }else if(isSkipped) {
            categoriesWise[cat][2]=categoriesWise[cat][2]+1;
          }else {
            categoriesWise[cat][1]=categoriesWise[cat][1]+1;
          }
        }
      });
    });
    this.qusCategories.forEach((cat,i)=> {
      datasets[0].data[i]=categoriesWise[cat][0];
      datasets[1].data[i]=categoriesWise[cat][1];
      datasets[2].data[i]=categoriesWise[cat][2];
    });
    this.barCharts.push({
      labels: [[this.qusCategories[0]],[this.qusCategories[1]],[this.qusCategories[2]],[this.qusCategories[3]],[this.qusCategories[4]],[this.qusCategories[5]]],
      data: datasets,
      labelText: { x:'Skill', y:'No. of Questions' },
      title: 'Skill Wise Performance',
    });
  }

  //generate bar chart data
  generateRecomandationData(questions: any) {
    let topics=[],subtopics=[];
    questions.filter(q=> {
      if((q.ansStatus== this.answerStaus[1]) && (q.status!=this.qusStatus[1] && q.status!=this.qusStatus[2])) return true;
    }).forEach(q=> {
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
          this.recomandations=response['data'];
        }
      },error=> {
        this.handleError(error);
      });
    }
  }
  
 //handle error
 handleError(error) {
   this.messageService.showLoader.emit(false);
   this.toastr.error('Something went wrong!', 'Oops!');
   this.errorService.handleError(error, this._vcr);
 }

}