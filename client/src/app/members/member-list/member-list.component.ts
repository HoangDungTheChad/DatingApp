import { Component, OnInit } from '@angular/core';
import { Member } from '../../_models/member';
import { MembersService } from '../../_service/members.service';
import { NgFor, NgIf } from '@angular/common';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-member-list',
  imports: [NgFor, NgIf, MemberCardComponent],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {
  members: Member[] = []; 
  
  constructor(private memberService: MembersService)
  {}
  
  ngOnInit(): void {
    this.loadMembers()
  }

  loadMembers() {
    this.memberService.getMembers().subscribe({
      next: members => {
        this.members = members; 
      }
    })
  }
}
