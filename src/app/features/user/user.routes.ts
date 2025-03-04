import { Routes } from '@angular/router';
import { CreateUserComponent } from './create/create-user/create-user.component';

export const userRoutes: Routes = [
  {
    path: 'create',
    component: CreateUserComponent
  }
];
