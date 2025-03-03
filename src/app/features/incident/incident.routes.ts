import { Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';

export const incidentRoute: Routes = [
  { path: '', component:  ListComponent},
  { path: 'create', component: CreateComponent },
  { path: ':id', component:  ViewComponent},
];