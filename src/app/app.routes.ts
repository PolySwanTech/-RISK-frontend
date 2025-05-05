import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authRoutes } from './features/auth/auth.routes';
import { userRoutes } from './features/user/user.routes'
import { incidentRoute } from './features/incident/incident.routes';
import { reglagesRoute } from './features/reglages/reglage.routes';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';
import { PermissionEnum } from './core/enum/permission.enum';
import { permissionRoutes } from './features/permissions/permissions.routes';

export const routes: Routes = [
  { pathMatch: 'full', path: '', redirectTo: 'auth/login' },
  { path: 'dashboard', component: HomeComponent, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionEnum.VIEW_DASHBOARD } },
  { path: 'auth', children: authRoutes },
  { path: 'user', children: userRoutes, canActivate: [AuthGuard] },
  { path: 'incident', children: incidentRoute, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionEnum.VIEW_INCIDENTS } },
  { path: 'reglages', children: reglagesRoute },
  { path: 'permissions', children: permissionRoutes, canActivate: [AuthGuard] },

];