import { Injectable, EventEmitter,ViewContainerRef } from '@angular/core';
import swal  from 'sweetalert2';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';


@Injectable()
export class MessageService {
  public showLoader: EventEmitter<any> = new EventEmitter();

  constructor(
    private toastr: ToastsManager, 
    ) {
  }

  //for success message
  successMessage(title: string, text: string, callback=null){
    swal({
      timer: 1440,
      title: title+"!",
      text: text,
      type: 'success',
      showConfirmButton: false,
    }).then(()=>{},
    (dismiss)=>{
      if (dismiss === 'timer' && callback) {
        callback();
      }
    });
  }

  //for error message
  errorMessage(title: string, text: string, callback=null){
    swal({
      timer: 1440,
      title: title+"!",
      text: text,
      type: 'warning',
      showConfirmButton: false,
    }).then(()=>{},
    (dismiss)=>{
      if (dismiss === 'timer' && callback) {
        callback();
      }
    });
  }

  deleteConfirmation(callback=null) {
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(()=> {
      if(callback){
        callback();
      }
    }).catch(cancel=>{
    })
  }

  // Show message about access token required to search private videos from Youtube/Vimeo 
  tokenConfirmation(title:string, successCB=null, cancelCB=null) {
    swal({
      title: title,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Generate Token'
    }).then(()=>{
      if(successCB){
        successCB();
      }
    },() => {
      if(cancelCB){
        cancelCB();
      }
    })
  }

/*
* confirmation alert
*/
confirmation(text:string,confirmButtonText:string,callback=null,title:string='Are you sure?',cancelCb:any=null) {
  text= text || '';
  confirmButtonText=confirmButtonText || 'Yes';
  swal({
    title: title,
    text: text,
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmButtonText
  }).then(()=>{
    if(callback){
      callback();
    }
  },()=>{
    if(cancelCb) {
      cancelCb();
    }
  })
}

//show image in modal
showImage(imageUrl:string,imageAlt: string,height:number=350,width:number=400) {
  swal({
    title: '',
    text: '',
    imageUrl: imageUrl,
    imageWidth: width,
    imageHeight: height,
    imageAlt: imageAlt,
    showCloseButton: true,
    showConfirmButton: false,
  }).catch(action=> {
  })
}

/*
* to display error toast
*/
showErrorToast(_vcr:ViewContainerRef,message:string,title:string='Oops!') {
  this.toastr.setRootViewContainerRef(_vcr);
  this.toastr.error(message, title);
}

/*
* to display success toast
*/
showSuccessToast(_vcr:ViewContainerRef,message:string,title:string='Success!') {
  this.toastr.setRootViewContainerRef(_vcr);
  this.toastr.success(message, title);
}


/*
* to display info toast
*/
showInfoToast(_vcr:ViewContainerRef,message:string) {
  this.toastr.setRootViewContainerRef(_vcr);
  this.toastr.info(message);
}


}
