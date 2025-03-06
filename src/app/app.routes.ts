import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authRoutes } from './features/auth/auth.routes';
import { userRoutes } from './features/user/user.routes'
import { incidentRoute } from './features/incident/incident.routes';
import { reglagesRoute } from './features/reglages/reglage.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes'

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'auth', children: authRoutes },
    { path: 'user', children: userRoutes },
    { path: 'incident', children: incidentRoute },
    { path: 'reglages', children: reglagesRoute },
    { path: 'dashboard', children: dashboardRoutes },
  ];