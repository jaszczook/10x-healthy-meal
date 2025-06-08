import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.isAuthenticated();
  if (isAuthenticated) {
    return true;
  }

  // Redirect to login page
  return router.createUrlTree(['/auth/login']);
}; 