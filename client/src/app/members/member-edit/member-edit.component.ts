import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { User } from '../../_models/user';
import { Member } from '../../_models/member';
import { AccountService } from '../../_service/account.service';
import { MembersService } from '../../_service/members.service';
import { take } from 'rxjs';
import { NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-member-edit',
  imports: [NgIf, FormsModule, TabsModule],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css',
  standalone: true,
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm;
  user: User;
  member: Member;
  // access to browser event
  @HostListener('window:beforeunload', ['$event']) unloadNotification(
    $event
  ): any {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private accountService: AccountService,
    private memberService: MembersService,
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember() {
    this.memberService.getMember(this.user.username).subscribe((member) => {
      this.member = member;
    });
  }

  updateMember() {
    this.memberService.updateMember(this.member).subscribe(() => {
      this.toastr.success('Profile updated successfully!');
      this.editForm.reset(this.member);
    });
  }
}
