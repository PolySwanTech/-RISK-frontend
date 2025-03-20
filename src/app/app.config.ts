import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from './core/interceptors/loading/loading.interceptor';
import { authenticatedInterceptor } from './core/interceptors/authenticated/authenticated.interceptor';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginatorIntl } from './shared/utils/custom-paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),  
    provideHttpClient(withInterceptors([LoadingInterceptor, authenticatedInterceptor])),
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ]
};
