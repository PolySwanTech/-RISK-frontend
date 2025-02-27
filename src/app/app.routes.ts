import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'auth', children: authRoutes },
  ];