import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const authenticatedInterceptor: HttpInterceptorFn = (req, next) => {
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
    tap(
      {
        error : (error) => {
          if (error.status === 401) {
            window.location.href = '/auth/login';
          }
        }
      }
    )
  );
};
