import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const PermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data?.['permission'] as string;

  
  if (!requiredPermission || authService.hasPermission(requiredPermission, 'd30634c8-5db0-49d9-9540-403ebb42f836')) {
    return true;
  }
  
  router.navigate(['/unauthorized']);
  return false;
};
