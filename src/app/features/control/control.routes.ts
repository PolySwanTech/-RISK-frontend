import { ControlDetailsPageComponent } from './../../pages/control-details-page/control-details-page.component';
import { Routes } from '@angular/router';
import { ExecutionsListComponent } from '../../pages/executions-list/executions-list.component';
import { ControlListComponent } from './control-list/control-list.component';

export const controlRoutes: Routes = [
  { path: '', component: ControlListComponent },
  { path: 'details/:id', component: ControlDetailsPageComponent },
  { path: 'details/:id/executions', component:  ExecutionsListComponent},
];
