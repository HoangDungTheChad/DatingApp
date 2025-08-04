import { HttpInterceptorFn } from '@angular/common/http';
import { AccountService } from '../_service/account.service';
import { inject } from '@angular/core';
import { User } from '../_models/user';
import { take } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  let accountService = inject(AccountService);
  let currentUser: User;

  accountService.currentUser$.pipe(take(1)).subscribe(user => currentUser = user);  
  if (currentUser) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    })
  }

  return next(request);
};
