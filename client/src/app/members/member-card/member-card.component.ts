import { Component, Input, OnInit } from '@angular/core';
import { Member } from '../../_models/member';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MembersService } from '../../_service/members.service';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.css',
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member;

  constructor(
    private memberService: MembersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {} 

  addLike(username: string) {
    this.memberService.addLike(username).subscribe(() => {
      this.toastr.success("You have liked " + this.member.knownAs);
    })
  }
}
