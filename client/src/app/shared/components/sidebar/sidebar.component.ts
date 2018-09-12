import { Component, OnInit, ViewContainerRef, Output , EventEmitter} from '@angular/core';
import { MenuService } from '../../services/common/menu.service';
import { ErrorService } from '../../services/common/error.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
	public menus: any = [];
	public urlPrefix : String = '';
  @Output('menuClick') menuClick = new EventEmitter();
  constructor(
  	private menuService : MenuService,
    private errorService: ErrorService,
    private _vcr : ViewContainerRef
  	) {
  	this.menuService.menuData.subscribe((data) => {
  		this.menus = data.menus;
  		this.urlPrefix = data.userRole.toLowerCase();
  	},error=>{
      this.handleError(error);
    }); 
  }

  ngOnInit() {
  	if (this.menuService.menuItems) {
  		this.menus = this.menuService.menuItems.menus;
  		this.urlPrefix = this.menuService.menuItems.userRole.toLowerCase();
  	}
  }

  //rotate expend icon
  rotateExpendIcon(id) {
    if(document.getElementById(id) && document.getElementById(id).classList){
      document.getElementById(id).classList.toggle('fa-minus');
      document.getElementById(id).classList.toggle('fa-plus');
    }
  }

   // Handle error
 handleError(error) {
   this.errorService.handleError(error, this._vcr);
 }

 //handleClick to emit  menuClick event to parent
 handleClick() {
   this.menuClick.emit();
 }
}
