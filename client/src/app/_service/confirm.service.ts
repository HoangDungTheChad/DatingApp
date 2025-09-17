import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';
import { unsubscribe } from 'diagnostics_channel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  bsModalRef: BsModalRef;

  constructor(private modalService: BsModalService) {}

  confirm(
    title = 'Confirmation',
    message = 'Are you sure you want to do this?',
    btnOkText = 'Ok',
    btnCancelText = 'Cancel'
  ) {
    const config = {
      initialState: {
        title,  
        message, 
        btnOkText,  
        btnCancelText 
      }
    }
    this.bsModalRef = this.modalService.show(ConfirmDialogComponent, config); 

    return new Observable<boolean>(this.getResult()); 
  }

  private getResult() {
    return (subscriber) => {
      const subscription = this.bsModalRef.onHidden.subscribe(() => {
        subscriber.next(this.bsModalRef.content.result);  
        // complete() automatically run the teardown logic 
        subscriber.complete(); 
      });  
      
      // teardown logic - if someone calls unsubscribe() on your observable 
      return {
        unsubscribe() {
          subscription.unsubscribe(); 
        }
      }
    }
  }
}
