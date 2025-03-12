import { HttpInterceptorFn } from '@angular/common/http';

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

  return next(modifiedReq);
};
