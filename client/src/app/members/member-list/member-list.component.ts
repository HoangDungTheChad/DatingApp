import { Component, OnInit } from '@angular/core';
import { Member } from '../../_models/member';
import { MembersService } from '../../_service/members.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MemberCardComponent } from '../member-card/member-card.component';
import { Observable, take } from 'rxjs';
import { PaginatedResult, Pagination } from '../../_models/pagination';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule, NgModel } from '@angular/forms';
import { User } from '../../_models/user';
import { UserParams } from '../../_models/userParams';
import { AccountService } from '../../_service/account.service';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MemberCardComponent,
    AsyncPipe,
    PaginationModule,
    FormsModule, 
    ButtonsModule 
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  members: Member[];
  pagination: Pagination;
  userParams: UserParams;
  user: User;
  genderList = [
    { value: 'male', display: 'Males' },
    { value: 'female', display: 'Females' },
  ];

  constructor(
    private memberService: MembersService,
  ) {
    this.userParams = this.memberService.getUserParams(); 
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.setUserParams(this.userParams); 
    this.memberService
      .getMembers(this.userParams)
      .subscribe((response: PaginatedResult<Member[]>) => {
        this.members = response.result;
        this.pagination = response.pagination;
      });
  }

  resetFilters() {
    this.userParams = this.memberService.resetUserParams(); 
    this.loadMembers();
  }                         

  pageChanged(event: any) {
    this.userParams.pageNumber = event.page;
    // Synchronize the userParams inside the service as well  
    this.memberService.setUserParams(this.userParams); 
    this.loadMembers();
  }
}
