import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppConfig } from './../../../config/app-config.constants';
import { AuthorizationService } from './../../common/authorization.service'


@Injectable()
export class NotesService{

  constructor(
    private http: Http,
    private authorizationService: AuthorizationService,
    ) { }


  //save Notes
    saveNotes(notesData:any, subTopicId:string){
      return this.http.post(AppConfig.API_HOST+'/api/notes/'+subTopicId,notesData,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }

       //delete notes
    deleteNotes(notesId:string,subTopicId:string){
      return this.http.delete(AppConfig.API_HOST+'/api/notes/'+notesId+'/'+subTopicId,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }

       //update notes
    updateNotes(notesData : any){
      return this.http.put(AppConfig.API_HOST+'/api/notes',notesData,this.authorizationService.authorization())
      .map(data=>data.json(),error=>error.json())
    }
}