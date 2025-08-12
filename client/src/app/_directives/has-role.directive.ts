import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../_service/account.service';
import { User } from '../_models/user';
import { take } from 'rxjs';

// this is a structural directive 
@Directive({
  selector: '[appHasRole]', // *appHasRole = '["Admin", "Moderator"]'
})
export class HasRoleDirective implements OnInit { 
@Input() appHasRole: string[]; 
  user: User; 

  constructor(
    private viewContrainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user; 
    })
  }
  ngOnInit(): void {
    // clear view if no roles  
    // there shouldn't be any user with no roles but just check!  
    if (!this.user?.roles || this.user == null) {
      this.viewContrainerRef.clear(); 
      return; 
    }

    if (this.user?.roles.some(r => this.appHasRole.includes(r))) {
      this.viewContrainerRef.createEmbeddedView(this.templateRef); 
    } else {
      this.viewContrainerRef.clear(); 
    }
  }
}
