import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { AuthenticationService } from './../../services/common/authentication.service';
import { CommonConfig } from './../../config/common-config.constants';
import { SkillService } from './../../services/skills/skill.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';



@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
  providers: [SkillService]
})

export class SkillsComponent implements OnInit {
  @ViewChild('closeModal') closeModal;
  public role: string="";
  public urlPrefix: string="";
  public permissions = [];
  public errorMessage : any;
  public skills : any;
  public title : string;
  public status : string;
  public configStatus = CommonConfig.CONTENT_STATUS.slice(0,3);
  public updateSkillId : string;
  public dataArray : any;
  public backendErrorMsg: any = [];

  public totalItems: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 8;

  constructor(
  	private authenticationService: AuthenticationService,
    private skillService: SkillService,
    private errorService: ErrorService,
    private messageService: MessageService,
    private _vcr : ViewContainerRef,
    ) { }

  ngOnInit() {
  	this.role=this.authenticationService.userRole;
  	this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
  	this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.getAllSkills();
  }

  /*pagination logic start here*/
  public setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }

  public pageChanged(event: any): void {
    this.currentPage = event.page;
    this.paginationData();
  }

  paginationData() {
    const indexOfLastItem = this.currentPage * this.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
    this.skills = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
  }

  /*pagination logic end here*/


  /* to get all skill request */
  getAllSkills(){
    this.skillService.findAll().subscribe((response)=>{
      if(response.data){
        this.dataArray = response.data;
        this.totalItems= this.dataArray.length;
        this.skills = response.data;
        this.paginationData();
      }
    },error=>{
      this.errorMessage=error.json().msg;
      this.handleError(error);
    })
  }

  /* to save all skill request*/
  save(){
    let data = { title : this.title };
    this.skillService.save(data).subscribe((response)=>{
      this.afterExecution();
      this.getAllSkills();
      this.messageService.successMessage('Skills', response.msg);
    },error=>{
      this.errorMessage=error.json().msg;
      this.handleError(error);
    })
  }

  /* get skill data for update */
  getSkillData(skillId){
    this.updateSkillId=skillId;
    this.skills.filter((skill)=>{
      if(skill._id==skillId){
        this.title=skill.title;
        this.status=skill.status;
      }
    });
  }

  /* update skill based on id*/
  update() {
    if(!this.title) return this.errorMessage="Title should not be blank";
    if(!this.status) return this.errorMessage="Status should not be blank";
    let data = { 
      title : this.title,
      status: this.status,
      _id:this.updateSkillId
    };
    this.skillService.update(data).subscribe((response)=>{
      this.afterExecution();
      this.getAllSkills();
      this.messageService.successMessage('Skills', response.msg);
    },error=>{
      this.errorMessage=error.json().msg;
      this.handleError(error);
    })

  }

  /* delete skill based on id */
  delete(_id:string):void {
    this.messageService.deleteConfirmation(()=>{
      this.skillService.deleteRecord(_id).subscribe(data=>{
        this.getAllSkills();
        this.messageService.successMessage('Skills', 'Successfully Deleted');
      },(error:any)=>{
        this.errorMessage=error.json().msg;
        this.handleError(error);
      });
    })
  }

  afterExecution(){
    this.closeModal.nativeElement.click();
    this.title='';
    this.status='';
    this.updateSkillId='';
    this.errorMessage='';
    this.backendErrorMsg='';
  }

  // Handle error
  handleError(error) {
    console.log(error);
    this.messageService.showLoader.emit(false);
    if(error.status===500) {
      this.backendErrorMsg= this.errorService.iterateError(error);
    } else {
      this.errorService.handleError(error, this._vcr);
    }
  }
}
