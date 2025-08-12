import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from '../../_models/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roles-modal',
  imports: [NgFor, FormsModule],
  templateUrl: './roles-modal.component.html',
  styleUrl: './roles-modal.component.css',
})
export class RolesModalComponent implements OnInit {
  // title: string;
  // list: any[];
  // closeBtnName: string;
  @Input() updateSelectedRoles = new EventEmitter(); 
  // be careful, Partial<User> can't map to User, hence here I use Partial<User> 
  user: Partial<User>;  
  roles: any[]; 

  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  updateRoles() {
    this.updateSelectedRoles.emit(this.roles);  
    this.bsModalRef.hide(); 
  }
}
