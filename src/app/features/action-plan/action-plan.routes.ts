import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ActionPlanChartComponent } from './action-plan-chart/action-plan-chart/action-plan-chart.component';

export const actionPlanRoutes: Routes = [
  { path: 'chart', component: ActionPlanChartComponent}
];
