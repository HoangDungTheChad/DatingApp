import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/user';
import { AdminService } from '../../_service/admin.service';
import { NgFor, NgIf } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  imports: [NgFor, NgIf],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
  providers: [BsModalService],
})
export class UserManagementComponent implements OnInit {
  users: Partial<User>[] = [];
  bsModalRef: BsModalRef;

  constructor(
    private adminService: AdminService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe((res) => {
      this.users = res;
    });
  }

  openRolesModal(user: Partial<User>) {
    const config = {
      class: 'modal-dialog-center', // so the modal appears at the middle of our browser
      initialState: {
        user,
        roles: this.getRolesArray(user),
      },
    };
    this.bsModalRef = this.modalService.show(RolesModalComponent, config);
    this.bsModalRef.content.updateSelectedRoles.subscribe((values) => {
      // filter all the roles they want to update 
      const updatedRoles = values.filter((el) => el.checked === true).map((el) => el.name);

      this.adminService.updateUserRoles(user.username, updatedRoles).subscribe(() => {
          user.roles = updatedRoles;
        });
    });
  }

  private getRolesArray(user: Partial<User>) {
    // we need some logic hence this method !
    const roles = [];
    const userRoles = user.roles;
    const availableRoles: any[] = [
      { name: 'Admin', value: 'Admin' },
      { name: 'Moderator', value: 'Moderator' },
      { name: 'Member', value: 'Member' },
    ];

    availableRoles.forEach((role) => {
      let isMatch = false;
      for (let userRole of userRoles) {
        if (role.name === userRole) {
          isMatch = true;
          role.checked = true;
          roles.push(role);
        }
      }

      if (!isMatch) {
        role.checked = false;
        roles.push(role);
      }
    });

    return roles;
  }
}
function foreach(arg0: boolean) {
  throw new Error('Function not implemented.');
}
