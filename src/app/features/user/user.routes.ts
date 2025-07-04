import { Routes } from '@angular/router';
import { CreateUserComponent } from './create/create-user/create-user.component';
import { UserListComponent } from './list/user-list/user-list.component';


export const userRoutes: Routes = [
  {
    path: 'create',
    component: CreateUserComponent
  },
  {
    path: 'list',
    component: UserListComponent
  }
];
