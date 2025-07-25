import { Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
// import { HistoryComponent } from './history/history.component';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { SuiviComponent } from './suivi/suivi.component';
import { PermissionName } from '../../core/enum/permission.enum';

export const incidentRoute: Routes = [
  { path: '', component:  ListComponent},
  { path: 'create', component: CreateComponent, canActivate: [PermissionGuard], data: { permission: PermissionName.ENTER_INCIDENT } },
  { path: ':id', component:  ViewComponent},
  // { path: ':id/history', component: HistoryComponent },
  { path: ':id/suivi', component:  SuiviComponent},
];