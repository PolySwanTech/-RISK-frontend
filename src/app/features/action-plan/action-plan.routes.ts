import { Routes } from '@angular/router';
import { PlanActionPageComponent } from '../../pages/plan-action-page/plan-action-page.component';
import { PlanActionPageDetailComponent } from '../../pages/plan-action-page-detail/plan-action-page-detail.component';

export const actionPlanRoutes: Routes = [
  { path: 'list', component: PlanActionPageComponent },
  { path: 'create', component: PlanActionPageComponent },
  { path: 'create/:incidentId', component: PlanActionPageComponent },
  { path: ':id', component:  PlanActionPageDetailComponent},
];
