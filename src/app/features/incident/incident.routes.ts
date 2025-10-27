import { Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { PermissionName } from '../../core/enum/permission.enum';
import { CreateOperationalImpactComponent } from './impact/create-operational-impact/create-operational-impact.component';

export const incidentRoute: Routes = [
  { path: '', component:  ListComponent},
  { path: 'create', component: CreateComponent, canActivate: [PermissionGuard], data: { permission: PermissionName.CREATE_INCIDENT } },
  { path: ':id', component:  ViewComponent},
  { path: ':id/impacts', component:  CreateOperationalImpactComponent},
];