import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { format } from 'path';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  let router = inject(Router);
  let toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error) => {
      if (error) {
        switch (error.status) {
          case 400:
            // we have 3 types of 400 error
            if (error.error.errors) {
              const modelStateErrors = [];
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modelStateErrors.push(error.error.errors[key]);
                }
              }
              throw modelStateErrors.flat();
            } else if (typeof error.error == 'object') {
              toastr.error(error.statusText, 'Bad request');
            } else {
              // in case the error is a string not an object
              toastr.error(error.error, error.status);
            }
            break;
          case 401:
            toastr.error(error.statusText, 'Unauthorized, bro');
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras: NavigationExtras = {
              state: { error: error.error },
            };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            if (error.status === 0 && error.message.includes('Unknown Error')) {
              // Silently ignore this weird case
              console.warn('⛔ Suppressed ghost error', error);
              break;
            }
            toastr.error(error);
            break;
        }
      }

      return throwError(() => error);
    })
  );
};

function formatErrorToJson(error: any): string {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error), 2); // Pretty print
  } catch {
    return JSON.stringify({ message: 'Unknown error occurred' });
  }
}
