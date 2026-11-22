import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return next(request);
  }

  const token = localStorage.getItem('token');
  const authenticatedRequest =
    token && !request.url.endsWith('/api/Auth/Login')
      ? request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error) => {
      if (
        error.status === 401 &&
        !request.url.endsWith('/api/Auth/Login')
      ) {
        localStorage.removeItem('token');
        void router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
