import { HttpEvent, HttpRequest, HttpInterceptorFn, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../../services/loading/loading.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export const LoadingInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const loadingService = inject(LoadingService);  

  const shouldShowLoader = req.headers.get('X-Show-Loader') === 'true';

  if (shouldShowLoader) {
    loadingService.show("🕐 Génération du PDF en cours, merci de patienter...");
  }

  return next(req).pipe(
    finalize(() => {
      if (shouldShowLoader) loadingService.hide();
    })
  );
};