import { ControlDetailsPageComponent } from './../../pages/control-details-page/control-details-page.component';
import { Routes } from '@angular/router';
import { ControlPageComponent } from '../../pages/control-page/control-page.component';
import { ExecutionsListComponent } from '../../pages/executions-list/executions-list.component';

export const controlRoutes: Routes = [
  { path: 'chart', component: ControlPageComponent },
  { path: 'details/:id', component: ControlDetailsPageComponent },
  { path: 'details/:id/executions', component:  ExecutionsListComponent},
];
