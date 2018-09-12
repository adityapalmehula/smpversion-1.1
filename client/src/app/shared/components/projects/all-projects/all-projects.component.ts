import { Component, OnInit } from '@angular/core';
import { ProjectService } from './../../../services/projects/project.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { AuthenticationService } from './../../../services/common/authentication.service';
@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.css'],
  providers : [ ProjectService ]
})
export class AllProjectsComponent implements OnInit {
  public role: string="";
  public projects : any ;
  public permissions = [];
  public urlPrefix: string="";
  CONFIG=CommonConfig;
  public imgPath:string=new CommonConfig().STATIC_IMAGE_URL+'course';

  constructor(
      private authenticationService: AuthenticationService,
      private projectService: ProjectService,
      ) { }

  ngOnInit() {
    this.role=this.authenticationService.userRole;
    this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
    this.urlPrefix = this.authenticationService.userRole.toLowerCase();
    this.fetchProjects();
  }



// get all projects 
 fetchProjects(){
   this.projectService.fetchProjects().subscribe(response=>{
          if(response.data){
            this.projects=response.data;
            console.log(JSON.stringify(this.projects));
          }
          else {
            console.log("not data");
          }
        }, (error:any)=> {
          // this.errorMessage=error.json().msg; 
          // this.handleError(error);
        });
      }


 }
