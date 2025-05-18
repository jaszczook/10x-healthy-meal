import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    // TODO: Add NonAuthGuard
    loadComponent: () => import('./features/auth/auth-page/auth-page.component').then(m => m.AuthPageComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./features/auth/login-form/login-form.component').then(m => m.LoginFormComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register-form/register-form.component').then(m => m.RegisterFormComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/password-reset-form/password-reset-form.component').then(m => m.PasswordResetFormComponent) }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
    // TODO: Add AuthGuard
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
