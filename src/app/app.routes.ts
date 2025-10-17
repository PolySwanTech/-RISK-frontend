import { organigrammeRoutes } from './features/organigramme/organigramme.routes';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/dashboard/home/home.component';
import { authRoutes } from './features/auth/auth.routes';
import { userRoutes } from './features/user/user.routes'
import { incidentRoute } from './features/incident/incident.routes';
import { reglagesRoute } from './features/reglages/reglage.routes';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';
import { permissionRoutes } from './features/permissions/permissions.routes';
import { PermissionName } from './core/enum/permission.enum';
import { actionPlanRoutes } from './features/action-plan/action-plan.routes';
import { controlRoutes } from './features/control/control.routes';
import { RiskPageComponent } from './pages/risk-page/risk-page.component';
import { CartographieComponent } from './pages/cartographie/cartographie.component';
import { CalculViewComponent } from './pages/calcul-view/calcul-view.component';
import { CreateEvaluationComponent } from './features/cartographie/create-evaluation/create-evaluation.component';
import { SelectCartoComponent } from './shared/components/select-carto/select-carto/select-carto.component';
import { TodoComponent } from './pages/todo/todo.component';
import { AttenuationMetricsListComponent } from './features/control/attenuation-metrics-list/attenuation-metrics-list.component';

export const routes: Routes = [
  { pathMatch: 'full', path: '', redirectTo: 'auth/login' },
  { path: 'dashboard', component: HomeComponent, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_DASHBOARDS } },
  { path: 'risk/:id', component : RiskPageComponent, canActivate : [AuthGuard] },
  { path: 'cartographie', component: CartographieComponent, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_CARTOGRAPHIE } },
  { path: 'cartographie/create', component: CreateEvaluationComponent, canActivate: [AuthGuard] },
  { path: 'cartographie/consulter', component: SelectCartoComponent, canActivate: [AuthGuard] },
  { path: 'calcul/view', component : CalculViewComponent, canActivate : [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_CALCUL_FONDS_PROPRE } },
  { path: 'auth', children: authRoutes },
  { path: 'user', children: userRoutes, canActivate: [AuthGuard] },
  { path: 'incident', children: incidentRoute, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_INCIDENTS } },
  { path: 'reglages', children: reglagesRoute },
  { path: 'permissions', children: permissionRoutes, canActivate: [AuthGuard] },
  { path: 'organigramme', children: organigrammeRoutes, canActivate: [AuthGuard] },
  { path: 'action-plan', children: actionPlanRoutes, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_ACTION_PLAN } },
  { path: 'control', children: controlRoutes, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_CONTROLES } },
  { path: 'attenuationMetrics', component : AttenuationMetricsListComponent, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_CONTROLES } },
  { path: 'todo', component: TodoComponent, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_TODO } },
];