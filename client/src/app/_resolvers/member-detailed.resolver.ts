import { ResolveFn } from '@angular/router';
import { MembersService } from '../_service/members.service';
import { inject } from '@angular/core';
import { Member } from '../_models/member';

export const memberDetailedResolver: ResolveFn<Member> = (route, state) => {
  let memberService = inject(MembersService);
  let username = route.paramMap.get("username");  

  if (!username) throw new Error("Username is missing in route parameters");

  return memberService.getMember(username); 
};
