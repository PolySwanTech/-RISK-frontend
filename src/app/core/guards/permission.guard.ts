import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const PermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data?.['permission'] as string;

  
  if (!requiredPermission || authService.hasPermission(requiredPermission)) {
    return true;
  }
  
  router.navigate(['/auth/login']);
  return false;
};
