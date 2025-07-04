import { Routes } from '@angular/router';
import { ManagePermissionsComponent } from '../../features/permissions/manage-permissions/manage-permissions.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const permissionRoutes: Routes = [
  {
    path: '',
    component: ManagePermissionsComponent,
    canActivate: [AuthGuard]
  }
];
