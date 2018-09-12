import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from './../../services/common/authentication.service';
import { CommonConfig } from './../../config/common-config.constants';
import { InstructorService } from './../../services/instructors/instructors.service';
import { MessageService } from './../../services/common/message.service';
import { ErrorService } from './../../services/common/error.service';
import { HelpService } from './../../services/help/help.service';
import { AppConfig } from './../../config/app-config.constants';

@Component({
	selector: 'app-helps',
	templateUrl: './helps.component.html',
	styleUrls: ['./helps.component.css'],
	providers:[HelpService]
})
export class HelpsComponent implements OnInit {
	public role: string="";
	public urlPrefix: string="";
	public permissions = [];
	public errorMessage : any;
	public helps: any;
	public pdf = ['pdf'];
	public image= ['jpg','jpeg','png'];
	public docx= ['docx','doc'];
	public defaultValue=-1;
	public categories = CommonConfig.HELPS.CATEGORIES;
	public dates = CommonConfig.HELPS.DATES;
	public status = CommonConfig.HELPS.STATUS;
	public dateOrder = this.dates[0];
	public statusOrder = CommonConfig.HELPS.STATUS[0];
	public isStudent: boolean = false;
	public mediaPath=new CommonConfig().BASE_URL+CommonConfig.FOLDERS[4];
	public imgPath:string=new CommonConfig().STATIC_IMAGE_URL;

	constructor(
		private authenticationService: AuthenticationService,
		private helpService : HelpService,
		private messageService : MessageService,
		private errorService: ErrorService,
		private _vcr: ViewContainerRef
		) { 
	}
	
	ngOnInit() {
		this.role=this.authenticationService.userRole;
		this.permissions = this.authenticationService.setPermission(CommonConfig.PAGES.STUDENTS);
		this.urlPrefix = this.authenticationService.userRole.toLowerCase();
		if(this.role=== CommonConfig.USER_STUDENT ) {
			this.isStudent = true;
			this.getMyHelps();
		}else {
			this.getHelps();
		}
	}

	/* get all helps */
	getHelps(){
		this.helpService.getHelps().subscribe((response)=>{
			this.helps = response.data;
		},error=>{
			this.errorMessage=error.json().msg;
			this.handleError(error);
		})
	}

	/* get all helps */
	getMyHelps(){
		this.helpService.getMyHelps().subscribe((response)=>{
			this.helps = response.data;
		},error=>{
			this.errorMessage=error.json().msg;
			this.handleError(error);
		})
	}

	// Apply date filter
	dateFilter(dateOrder) {
		this.dateOrder = dateOrder;
		this.sortHelps();
	}

	// Apply status filter
	statusFilter(statusOrder) {
		this.statusOrder = statusOrder;
		this.sortHelps();
	}

	sortHelps() {
		if (this.dateOrder === this.dates[0]) {
			this.helps =this.helps.sort(this.sortAscFunction);
		} else if (this.dateOrder === this.dates[1]) {
			this.helps =this.helps.sort(this.sortDescFunction);
		}
	}

	sortAscFunction(a, b) {
		return Date.parse(b.createdBy.date) - Date.parse(a.createdBy.date);
	};

	sortDescFunction(a, b) {
		return Date.parse(a.createdBy.date) - Date.parse(b.createdBy.date);
	};
	// Handle error
	handleError(error) {
		this.errorService.handleError(error, this._vcr);
	}

}

