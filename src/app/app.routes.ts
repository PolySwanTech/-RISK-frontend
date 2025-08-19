import { organigrammeRoutes } from './features/organigramme/organigramme.routes';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
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
import { CalculInputParametersComponent } from './pages/calcul-input-parameters/calcul-input-parameters.component';
import { CalculViewComponent } from './pages/calcul-view/calcul-view.component';
import { CreateEvaluationComponent } from './features/cartographie/create-evaluation/create-evaluation.component';
import { SelectCartoComponent } from './shared/components/select-carto/select-carto/select-carto.component';
import { CreateCartoComponent } from './features/cartographie/create-carto/create-carto/create-carto.component';

export const routes: Routes = [
  { pathMatch: 'full', path: '', redirectTo: 'auth/login' },
  { path: 'dashboard', component: HomeComponent, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_DASHBOARDS } },
  { path: 'risk/:id', component : RiskPageComponent, canActivate : [AuthGuard] },
  { path: 'cartographie', component: CartographieComponent, canActivate: [AuthGuard]},
  { path: 'cartographie/create', component: CreateCartoComponent, canActivate: [AuthGuard] },
  { path: 'cartographie/consulter', component: SelectCartoComponent, canActivate: [AuthGuard] },
  { path: 'cartographie/evaluation', component: CreateEvaluationComponent, canActivate: [AuthGuard] },
  { path: 'calcul', component : CalculInputParametersComponent, canActivate : [AuthGuard] },
  { path: 'calcul/view', component : CalculViewComponent, canActivate : [AuthGuard] },
  { path: 'auth', children: authRoutes },
  { path: 'user', children: userRoutes, canActivate: [AuthGuard] },
  { path: 'incident', children: incidentRoute, canActivate: [AuthGuard, PermissionGuard], data: { permission: PermissionName.VIEW_INCIDENTS } },
  { path: 'reglages', children: reglagesRoute },
  { path: 'permissions', children: permissionRoutes, canActivate: [AuthGuard] },
  { path: 'organigramme', children: organigrammeRoutes, canActivate: [AuthGuard] },
  { path: 'action-plan', children: actionPlanRoutes, canActivate: [AuthGuard] },
  { path: 'control', children: controlRoutes, canActivate: [AuthGuard] },
];