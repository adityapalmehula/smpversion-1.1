import { Injectable } from '@angular/core';
import { Http, Response, Headers,URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { RequestOptions, Request, RequestMethod } from '@angular/http';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service';
import { AuthenticationService } from './../../services/common/authentication.service';


@Injectable()
export class ProjectService{
  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    private router: Router,
    private autenticationService: AuthenticationService,
    ) { }

// fetch projects
fetchProjects() {
  return this.http.get(AppConfig.API_HOST+'/api/projects?q=1',this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// list projects
listProjects() {
  return this.http.get(AppConfig.API_HOST+'/api/projects/list',this.authorizationService.authorization()).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// Add Project
addProject(formData) {
  // let projectDetail=JSON.stringify(data);
  // let projectDetail=data;
  let headers = new Headers();
  headers.append('enctype', 'multipart/form-data');
  headers.append('Accept', 'application/json');
  headers.append('Authorization', this.autenticationService.getToken());
  // headers.append('projectData',projectDetail);

  let options = new RequestOptions({ headers: headers });
  return this.http.post(AppConfig.API_HOST+'/api/projects',formData, options).map(data =>
    data.json()
    , (error: any) => {
      error.json();
    });
}

// fetch project details on basis of id
getProjectData(_id){
  return this.http.get(AppConfig.API_HOST+'/api/projects/'+_id,this.authorizationService.authorization()).map(data=>
    data.json(),
    (error:any)=>{
      error.json();
    });
}

// get my projects for instructor - created by only him 
getMyProjectsForInstructor() {
  return this.http.get(AppConfig.API_HOST+'/api/projects/myprojects?q=1',this.authorizationService.authorization()).map(data=>
    data.json(),(error:any)=> error.json());
}

  //update Project
  updateProject(formData,projectId){
    // let projectDetail=JSON.stringify(data);
    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', this.autenticationService.getToken());
    // headers.append('projectData',projectDetail);
    let options = new RequestOptions({ headers: headers });
    
    return this.http.put(AppConfig.API_HOST+'/api/projects/'+projectId,formData,options).map(data=>
      data.json(),
      (error:any)=>{
        error.json();
      });
  }
  //update project status based on id
  updateProjectStatus(projectId: string, statusDetails:any ) {
    return this.http.put(AppConfig.API_HOST+'/api/projects/status/'+projectId,statusDetails,this.authorizationService.authorization()).map(data =>
      data.json(), (error: any)=>error.json());
  }
  //Delete project
  deleteProject(projectId) {
    return this.http.delete(AppConfig.API_HOST+'/api/projects/'+projectId,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }


	// Fetch Project Detail by Id
	fetchProjectDetail(id) {
    return this.http.post(AppConfig.API_HOST+'/api/projects/projectDetail', { id: id }, this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

	// Add epic
	addEpic(projectId:string, data: any) {
    return this.http.put(AppConfig.API_HOST+'/api/projects/'+projectId+'/epics', data,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

	// Update epic by epicId
	updateEpic(projectId:string, data:any,epicId:string) {
    return this.http.put(AppConfig.API_HOST+'/api/projects/'+projectId+'/epics/'+ epicId, data,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

	//Delete epic 
	deleteEpic(projectId:string,epicId:string) {
    return this.http.delete(AppConfig.API_HOST+'/api/projects/'+projectId+'/epics/'+ epicId,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

	// Fetch epic detail by epic id
  fetchEpicDetail(projectId:string,epicId:string) {
    return this.http.get(AppConfig.API_HOST+'/api/projects/'+projectId+'/epics/'+ epicId,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }
// Fetch epic detail by epic id
  getEpicListByProjectId(projectId:string) {
    return this.http.get(AppConfig.API_HOST+'/api/projects/'+projectId+'/epics',this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

    // Add story
  addStory(projectId:string, data: any) {
    return this.http.put(AppConfig.API_HOST+'/api/projects/'+projectId+'/stories', data,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

  // Update story by storyId
  updateStory(projectId:string, data:any,storyId:string) {
    return this.http.put(AppConfig.API_HOST+'/api/projects/'+projectId+'/stories/'+ storyId, data,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

  //Delete story 
  deleteStory(projectId:string,storyId:string) {
    return this.http.delete(AppConfig.API_HOST+'/api/projects/'+projectId+'/stories/'+ storyId,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

   // Fetch story detail by story id
  fetchStoryDetail(projectId:string,storyId:string) {
    return this.http.get(AppConfig.API_HOST+'/api/projects/'+projectId+'/stories/'+ storyId,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

  // Fetch task detail by task id
  fetchTaskDetail(projectId:string,storyId:string, taskId: string) {
    return this.http.get(AppConfig.API_HOST+'/api/projects/'+projectId+'/stories/'+ storyId +'/tasks/'+taskId ,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }
    // Add task
  addTask(projectId:string, storyId: String, data: any) {
    return this.http.put(AppConfig.API_HOST+'/api/projects/'+projectId+'/stories/'+storyId+'/tasks', data,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

  // Update task by taskId
  updateTask(projectId:string, storyId:string, taskId:string, data: any) {
    return this.http.put(AppConfig.API_HOST+'/api/projects/'+projectId+'/stories/'+ storyId +'/tasks/'+taskId, data,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

  //Delete task 
  deleteTask(projectId:string,storyId:string, taskId: string) {
    return this.http.delete(AppConfig.API_HOST+'/api/projects/'+projectId+'/stories/'+ storyId +'/tasks/'+taskId,this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }

  //getProjectValidationTracking
  getProjectValidationTracking(projectId:string){
     return this.http.get(AppConfig.API_HOST+'/api/projects/validation-tracking/'+projectId,this.authorizationService.authorization()).map((data)=>
         data.json()
        , (error: any) => {
        error.json();
        });
  }

 
  // get epics by project id
 /* getEpics(projectId:string) {
    return this.http.get(AppConfig.API_HOST+'/api/projects/'+projectId+'/epics',this.authorizationService.authorization()).map(data =>
      data.json()
      , (error: any) => {
        error.json();
      });
  }*/
}
