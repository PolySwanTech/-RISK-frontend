import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from './core/interceptors/loading/loading.interceptor';
import { authenticatedInterceptor } from './core/interceptors/authenticated/authenticated.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),  
    provideHttpClient(withInterceptors([LoadingInterceptor, authenticatedInterceptor])),
  ]
};
