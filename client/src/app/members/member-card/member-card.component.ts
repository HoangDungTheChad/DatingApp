import { Component, Input, OnInit, Output } from '@angular/core';
import { Member } from '../../_models/member';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MembersService } from '../../_service/members.service';
import { PresenceService } from '../../_service/presence.service';
import { AsyncPipe, NgIf, NgClass } from '@angular/common';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf, NgClass],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.css',
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member;
  @Input() type: string | null = null; 
  // if this is an unlike card (type = 'unlike'), then relType must be set to 'likeByMe' or 'LikedMe'   
  @Input() relType: string = null;  

  @Output() removeAction = new EventEmitter<Object>();  

  @Input() liked: boolean = false; 

  constructor(
    private memberService: MembersService,
    private toastr: ToastrService,
    public presence: PresenceService
  ) {}

  ngOnInit(): void {} 

  addLike(username: string) {
    this.memberService.addLike(username).subscribe(() => {
      this.toastr.success('You have liked ' + this.member.knownAs);
      this.liked = true  
      // update the liked user list in the service   
      this.memberService.likedUsers.push(this.member)
    });
  }

  // remove a user from your lists 
  remove(username: string, relType) {
    this.memberService.removeLike(username, relType).subscribe(() => {
      if (relType === 'likedByMe')  this.toastr.info('You have unliked ' + this.member.knownAs); 
      else  this.toastr.info('You have ghosted ' + this.member.knownAs); 
      // update the liked user list in the service   
      this.memberService.likedUsers = this.memberService.likedUsers.filter(m => m.username !== username);  
    
      this.removeAction.emit({
        username: username, 
        relationshipType: relType
      }); 
    })
  }

  get isUnlikeCard(): boolean {
    return this.type === 'unlike-card'; 
  }
}
