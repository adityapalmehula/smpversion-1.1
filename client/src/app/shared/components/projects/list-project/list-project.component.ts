import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from './../../../services/common/authentication.service';
import { CommonConfig } from './../../../config/common-config.constants';
import { ProjectService } from './../../../services/projects/project.service';
import { MessageService } from './../../../services/common/message.service';
import { ErrorService } from './../../../services/common/error.service';

@Component({
	selector: 'app-list-project',
	templateUrl: './list-project.component.html',
	styleUrls: ['./list-project.component.css'],
	providers: [ProjectService]
})
export class ListProjectComponent implements OnInit {
	public role: string="";
	public urlPrefix: string="";
	public permissions = [];
	public projects : any ;
	public errMessage: any;
	public errorMessage: any;
	public dataArray : any;
	CONFIG=CommonConfig;
	imgPath="./../../../../../assets/images/projects";
	public totalItems: number = 0;
	public currentPage: number = 1;
	public itemsPerPage: number = 8;
	projectImgPath:string='projects/';

	constructor(
		private authenticationService: AuthenticationService,
		private projectService: ProjectService,
		private messageService: MessageService,
		private errorService: ErrorService,
		private _vcr : ViewContainerRef
		) { }

	ngOnInit() {
		this.role=this.authenticationService.userRole;
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		this.fetchProjects();
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
		this.projects = this.dataArray.slice(indexOfFirstItem, indexOfLastItem);
	}
	/*pagination logic end here*/


	  //fetch projects
	  fetchProjects(){
	  	this.messageService.showLoader.emit(true);
	  	this.projectService.listProjects().subscribe((res: any) => {
	  		this.messageService.showLoader.emit(false);
	  		this.projects = res.data;
	  		this.dataArray = res.data;
	  		this.totalItems= this.dataArray.length;
	  		this.paginationData();
	  	},  error => {
	  		this.handleError(error);
	  		let errMsg = error.json();
	  		this.errMessage = errMsg.msg
	  	});
	  }

 // Handle error
 handleError(error) {
 	this.messageService.showLoader.emit(false);
 	this.errorService.handleError(error, this._vcr);
 }

}
