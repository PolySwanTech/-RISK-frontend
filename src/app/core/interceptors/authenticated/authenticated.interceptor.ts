import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { inject } from '@angular/core';

export const authenticatedInterceptor: HttpInterceptorFn = (req, next) => {

  var snackBarService = inject(SnackBarService);

  var token = sessionStorage.getItem('token');
  // Clone the request and add the Authorization header if the token exists
  const modifiedReq = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    : req;

  return next(modifiedReq).pipe(
    tap({
      next: (event: any) => {
        // Vérifie si un nouveau token est renvoyé dans le header X-New-Access-Token
        const newToken = event?.headers?.get?.('X-New-Access-Token');
        if (newToken) {
          sessionStorage.setItem('token', newToken);
        }
      },
      error: (error) => {
        if (error.status === 401) {
          sessionStorage.clear();
          window.location.href = '/auth/login';
        }
      },
    })
  );
};
