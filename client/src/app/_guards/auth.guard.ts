import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_service/account.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService); 
  const toastr = inject(ToastrService); 
  const router = inject(Router)
  console.log("This is auth guard")

  return accountService.currentUser$.pipe(
    take(1), 
    map(user => {
      if(user) return true;  
      toastr.error("You're not authorized to access this protected resource")
      router.navigate(['/']); 
      return false; 
    })
  ); 
};
