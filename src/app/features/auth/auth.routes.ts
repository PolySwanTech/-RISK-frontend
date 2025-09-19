import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ResetTokenComponent } from './reset-token/reset-token.component';

export const authRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetTokenComponent },
];