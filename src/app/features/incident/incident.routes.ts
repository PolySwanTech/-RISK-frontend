import { Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { CreateOperationalImpactComponent } from './impact/create-operational-impact/create-operational-impact.component';

export const incidentRoute: Routes = [
  { path: '', component:  ListComponent},
  { path: ':id', component:  ViewComponent},
  { path: ':id/impacts', component:  CreateOperationalImpactComponent},
];