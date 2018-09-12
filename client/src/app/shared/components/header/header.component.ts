import { Component, OnInit, ViewContainerRef, HostListener, ElementRef } from '@angular/core';
import { AuthorizationService } from '../../services/common/authorization.service';
import { AuthenticationService } from '../../services/common/authentication.service';
import { MessageService } from '../../services/common/message.service';
import { ErrorService } from '../../services/common/error.service';
import { MenuService } from '../../services/common/menu.service';
import { CommonConfig } from './../../config/common-config.constants';
import { SwitchConfig } from './../../config/switch-config.constants';
import { StudentService } from './../../services/students/student.service';
import { InstructorService } from './../../services/instructors/instructors.service';
import { ProfileService } from './../../services/profiles/profiles.service';


@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css'],
	providers:[ StudentService, InstructorService ]
})
export class HeaderComponent implements OnInit {

	public showNavBar: boolean = false;
	public menus : any=[];
	public urlPrefix : String;
	public userRole : String;
	public userData : any;
	public imgPath : any;
	public errorMessage : any;
	public commonConfig=CommonConfig;
	public userImgPath:string=new CommonConfig().BASE_URL+this.commonConfig.FOLDERS[2];
	public userDefaultImg:string=new CommonConfig().STATIC_IMAGE_URL+this.commonConfig.DEFAULT_USER_IMAGE.PATH;
	public logo: string= new CommonConfig().STATIC_IMAGE_URL+'logo/';
	private display: string='none';
	private backgroundColor: string='#ffffff';
	private color: string='#212121';
	private width: number;
	private hideSidebar: boolean = false;
	private contentPage = '';
	private elem :any;
	private sidebar :any;
	public currentApp = SwitchConfig.APP;
	public apps = SwitchConfig.APPS;

	constructor(
		private authorizationService : AuthorizationService,
		private menuService : MenuService,
		private errorService: ErrorService,
		private authenticationService : AuthenticationService,
		private messageService : MessageService,
		private _vcr: ViewContainerRef,
		private studentService: StudentService,
		private instructorService: InstructorService,
		private profileService : ProfileService,
		private elRef:ElementRef,
		) {

		this.authorizationService.showNavBar.subscribe((mode: any) => {
			this.showNavBar = mode;
			if (this.width === undefined) {
				this.width = window.screen.width;
			}

			if(this.showNavBar) {
				this.elem = document.getElementById('sidebar-container');
				this.sidebar = document.getElementById('side-bar');
				this.menuService.sidebar.subscribe((data) => {
					this.hideSidebar = data.hide;
					this.contentPage = data.contentPage;
					this.styleSidebar();
				})
				this.messageService.showLoader.emit(true);
				this.menuService.getMenus().subscribe((navs: any) => {
					this.userRole = navs.data.userRole;
					this.menus = navs.data.menus;
					this.menuService.menuData.emit({menus:this.menus,userRole:this.userRole});
					this.menuService.menuItems = {menus:this.menus,userRole:this.userRole};
					this.urlPrefix = this.userRole.toLowerCase();
					this.getUserDetail();
					this.messageService.showLoader.emit(false);
				},error=>{
					this.handleError(error);
				});
				this.styleSidebar();
			}
		},error=>{
			this.handleError(error);
		});


		this.authorizationService.hideNavBar.subscribe((mode: any) => {
			this.showNavBar = false;
			this.menus=[]; 
			this.menuService.menuData.emit({menus:this.menus,userRole:this.userRole});
			this.menuService.menuItems = {menus:this.menus,userRole:this.userRole};
		},error=>{
			this.handleError(error);
		});
	}

	ngOnInit() {
		this.profileService.updateProfile.subscribe((profile) => {
			this.userData=profile;
			if(profile.profilePic) {
				this.imgPath=this.userImgPath+profile.profilePic;
			} else {
				this.imgPath=this.userDefaultImg;
			}
		})
	}

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.width = event.target.innerWidth;
		if(this.width <=768) {
			this.elem.style.width = '100%';
			this.elem.style.left = '-100%';
		} else {
			this.elem.style.width = '100%';
			if (this.elem.style.left !== '-12%') {
				this.elem.style.left = '-12%';
			}
			this.sidebar.style.width = '15.9%';
		}
		this.styleSidebar();
	}

  // Get user detail on basis of userId
  getUserDetail(){
  	let $userService= this.getUserService(this.userRole);
  	if($userService) {
  		$userService.subscribe(response=>{
  			if(response.data){
  				this.userData=response.data;
  				if(response.data.profilePic) {
  					this.imgPath=this.userImgPath+response.data.profilePic;
  				} else {
  					this.imgPath=this.userDefaultImg;
  				}
  			}
  		}, (error:any)=> {
  			this.errorMessage=error.json().msg; 
  			this.handleError(error);
  		});
  	}
  }	

  getUserService(role){
  	let $userService;
  	switch(role) {
  		case CommonConfig.USER_INSTRUCTOR:
  		$userService= this.instructorService.findInstructorInfo();
  		break;
    // case CommonConfig.USER_SCHOOL:
    // UserSchRef= School; break;
    // case CommonConfig.USER_TEACHER:
    // UserSchRef= Teacher; break;
    case CommonConfig.USER_STUDENT:
    $userService= this.studentService.getStudentInfo('student_info_q2');
    break;
  }
  return $userService;
}

// Logout user and delete user details from local storage
logout() {
	this.userData='';
	this.imgPath='';
	this.menus=[];
	this.menuService.menuData.emit({menus:this.menus,userRole:this.userRole});
	this.menuService.menuItems = {menus:this.menus,userRole:this.userRole};
	this.showNavBar = false;
	this.display = 'none';
	this.elem.style.display = this.display;
	this.authenticationService.logout();
}

// Handle error
handleError(error) {
	this.messageService.showLoader.emit(false);
	this.errorService.handleError(error, this._vcr);
}
	//Toggle sidebar in mobile view
	toggelSidebar() {
		if(this.elem) {
			if(this.width <=768) {
				if(this.display === 'none') {
					this.display = 'block';
					this.elem.style.left = '0px';
					this.sidebar.style.width = '100%';
					this.elem.style.transition = '0.3s';
				}	else {
					this.display = 'none';
					this.elem.style.left = '-100%';
				}
			} else {
				this.sidebar.style.width = '15.9%';
				if(this.display === 'none') {
					this.display = 'block';
					this.elem.style.left = '0px';
					this.elem.style.transition = '0.3s';
				}	else {
					this.display = 'none';
					this.elem.style.left = '-100%';
				}
			}
			this.elem.style.display = this.display;
		}
	}

	styleSidebar(){
		this.elem.onmouseover = ()=>{
			this.elem.style.left ='0px';
		}
		this.elem.onmouseout = ()=>{
			this.elem.style.left ='-12%';
		}
		if (!this.showNavBar) {
			this.display = 'none';
			this.elem.style.display = this.display;
		} else {
			if(this.elem) {
				if ((this.hideSidebar && this.width <= 768) || (!this.hideSidebar && this.width <= 768) ) {
					this.elem.style.left = '-100%';
				} else if ((this.hideSidebar && this.width > 768)) {
					if (this.contentPage === 'playContent') {
						this.display = 'none';
						this.elem.style.left = '-100%';
					} else {
						this.display = 'block';
						this.elem.style.left = '-12%';
					}
				} else if ((!this.hideSidebar && this.width > 768)) {
					this.display = 'block';
					this.elem.style.left = '-12%';
				}
				this.elem.style.display = this.display;
				this.contentPage = '';
			}
		}
	}

	//handleClick to emit  menuClick event to parent
	handleClick() {
		if (this.width <= 768) {
			this.styleSidebar();
		}
	}
}
