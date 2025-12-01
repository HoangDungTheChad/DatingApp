import { Component, OnInit } from '@angular/core';
import { Member } from '../_models/member';
import { MembersService } from '../_service/members.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MemberCardComponent } from '../members/member-card/member-card.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { Pagination } from '../_models/pagination';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AnySrvRecord } from 'node:dns';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [FormsModule, NgFor, MemberCardComponent, ButtonsModule, NgIf, PaginationModule],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css',
})
export class ListsComponent implements OnInit {
  // Every properties inside member is optional  
  members: Partial<Member[]> = []; 
  predicate: string = 'likedByMe'; 
  pageNumber: number = 1;  
  pageSize: number = 5; 
  pagination: Pagination; 

  constructor(private memberService: MembersService) {}

  ngOnInit(): void {
    this.loadLikes(); 
  }

  loadLikes() {
    this.memberService.getLikes(this.predicate, this.pageNumber, this.pageSize).subscribe({
      next: res => {
        this.members = res.result; 
        this.pagination = res.pagination; 
      }
    })
  }

  pageChanged(event: any) {
    this.pageNumber = event.page;  
    this.loadLikes(); 
  }

  handleRemoveAction(data: any) {
    this.members = this.members.filter(m => m.username != data.username); 
  }
}
