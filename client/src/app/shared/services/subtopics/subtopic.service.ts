import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../config/app-config.constants';
import { AuthorizationService } from './../common/authorization.service'


@Injectable()
export class SubTopicService{
  @Output() subTopicDataEvent: EventEmitter<any> = new EventEmitter();
  @Output() learningPlanUpdatedEvent: EventEmitter<any>  = new EventEmitter();

	constructor(
		private http: Http,
		private authorizationService: AuthorizationService,
		) { }


  // Post request to server
  saveSubTopic(data:any){
  	return this.http.post(AppConfig.API_HOST+'/api/subtopic', data,this.authorizationService.authorization()).map(data=>
  		data.json(),
  		(error:any)=>error.json());
  }

  // Put request to server for update subtopic
  updateSubTopic(subTopicData,subTopicId)
  {
  	return this.http.put(AppConfig.API_HOST+'/api/subtopic/'+subTopicId, subTopicData,this.authorizationService.authorization()).map(data=>
  		data.json(),
  		(error:any)=>error.json());
  }

  //Delete subtopic
  deleteSubTopic(subTopicId){
  	return this.http.delete(AppConfig.API_HOST+'/api/subtopic/'+subTopicId,this.authorizationService.authorization()).map(data=>
  		data.json(),
  		(error:any)=>error.json());
  }

  // get subtopic data on basis of subtopic Id
  getSubTopic(subTopicId:string) {
  	return this.http.get(AppConfig.API_HOST+'/api/subtopics/subTopicId/'+subTopicId,this.authorizationService.authorization())
  	.map(data=> data.json(),
  		(error:any)=> error.json());
  }

  // To insert learning data into subtopic
  insertLearningData(subTopicId: string, learningData) {
  	return this.http.put(AppConfig.API_HOST+'/api/subtopics/'+subTopicId+'/learningData',learningData,this.authorizationService.authorization())
  	.map(data=> data.json(),
  		(error:any)=> error.json());
  }

  // to delete learning data from subtopic
  deleteLearningData(subTopicId: string, learningDataId: string) {
  	return this.http.delete(AppConfig.API_HOST+'/api/subtopics/'+subTopicId+'/learningDataId/'+learningDataId,this.authorizationService.authorization())
  	.map(data=> data.json(),
  		(error:any)=> error.json());
  }

  // change path of learning data
  changeOrderLearningData(subTopicId: string, learningDataId: string, learningData) {
  	return this.http.put(AppConfig.API_HOST+'/api/subtopics/'+subTopicId+'/learningDataId/changeOrder',learningData,this.authorizationService.authorization())
  	.map(data=> data.json(),
  		(error:any)=> error.json());
  }

// To update learningdata 
updateLearningData(subTopicId: string, learningDataId: string,learningData) {
	return this.http.put(AppConfig.API_HOST+'/api/subtopics/'+subTopicId+'/learningData/'+learningDataId,learningData,this.authorizationService.authorization())
	.map(data=> data.json(),
		(error:any)=> error.json());
}

  //get request to server
  getMyPlaylists(){
  	return this.http.get(AppConfig.API_HOST+'/api/playlists/myplaylist',this.authorizationService.authorization()).map(data=>
  		data.json(),
  		(error:any)=>error.json());
  }

  // Save playlist item
  savePlayListItem(playListItemData){
  	return this.http.put(AppConfig.API_HOST+'/api/playlists',playListItemData,this.authorizationService.authorization()).map(data=>
  		data.json(),
  		(error:any)=>error.json());

  }


  //update playlistItem 

  updatePlayListItem(updateplaylistItemId,playListItemData)
  {
  	return this.http.put(AppConfig.API_HOST+'/api/playlists/'+updateplaylistItemId+'/playlistItem',playListItemData,this.authorizationService.authorization()).map(data=>
  		data.json(),
  		(error:any)=>error.json());
  }

  // Delete playList Item
  deletePlayListItem(playListId,playListItemId)
  {
  	return this.http.delete(AppConfig.API_HOST+'/api/playlists/'+playListId+'/playlistItem/'+playListItemId,this.authorizationService.authorization()).map(data=>
  		data.json(),
  		(error:any)=>error.json());
  }

  /* rearrange learning path on basis of subtopic Id*/
  rearrangeLP(learningData, subTopicId){
    return this.http.put(AppConfig.API_HOST+'/api/subtopics/'+subTopicId+'/learningPath/rearrange',learningData,this.authorizationService.authorization())
    .map(data=> data.json(),
      (error:any)=> error.json());
  }

}