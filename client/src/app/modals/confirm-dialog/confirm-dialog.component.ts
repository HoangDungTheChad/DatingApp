import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  title: string;
  message: string;
  btnOkText: string;
  btnCancelText: string;
  // their answer
  result: boolean = false; // really important that you initialized to false, otherwise prevent unsaved guard will assume underfined equals tru and proceed navi

  constructor(public bsModalRef: BsModalRef) {}

  confirm() {
    this.result = true;  
    console.log("result is set to " + this.result + ", are you happy about that  bro")
    this.bsModalRef.hide(); 
  }

  decline() {
    this.result = false;  
    console.log("result is set to false")
    this.bsModalRef.hide(); 
  }
}
