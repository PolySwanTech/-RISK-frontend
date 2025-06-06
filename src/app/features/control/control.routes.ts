import { Routes } from '@angular/router';
import { ControlChartComponent } from './control-chart/control-chart/control-chart.component';
import { ControlPageComponent } from '../../pages/control-page/control-page.component';

export const controlRoutes: Routes = [
  { path: 'chart', component: ControlPageComponent }
];
