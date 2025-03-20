import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authRoutes } from './features/auth/auth.routes';
import { userRoutes } from './features/user/user.routes'
import { incidentRoute } from './features/incident/incident.routes';
import { reglagesRoute } from './features/reglages/reglage.routes';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { pathMatch: 'full', path: '', redirectTo: 'auth/login' },
  { path: 'dashboard', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'auth', children: authRoutes },
  { path: 'user', children: userRoutes, canActivate: [AuthGuard] },
  { path: 'incident', children: incidentRoute, canActivate: [AuthGuard] },
  { path: 'reglages', children: reglagesRoute, canActivate: [AuthGuard] },
];