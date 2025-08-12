import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_service/account.service';
import { map, Observable } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const toastr = inject(ToastrService); 
  const accountService = inject(AccountService); 
  const router = inject(Router); 
  // we just need to check the user's roles 
  return accountService.currentUser$.pipe(
    map(user => {
      if (user.roles.includes("Admin") || user.roles.includes("Moderator")) {
        return true 
      }
      toastr.error("You cannot enter this area"); 
      // optional redirect  
      // router.redirect(['/'])
      return false 
    })
  );
};
