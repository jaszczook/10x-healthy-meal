import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
    canActivate: [authGuard]
  },
  {
    path: 'preferences',
    loadComponent: () => import('./features/preferences/pages/preferences-page/preferences-page.component').then(m => m.PreferencesPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recipes',
    canActivate: [authGuard],
    children: [
      {
        path: 'new',
        loadComponent: () => import('./features/recipes/recipe-new/recipe-new.component')
          .then(m => m.RecipeNewComponent)
      },
      {
        path: 'edit/new',
        loadComponent: () => import('./features/recipes/recipe-edit/recipe-edit-view.component')
          .then(m => m.RecipeEditViewComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./features/recipes/recipe-edit/recipe-edit-view.component')
          .then(m => m.RecipeEditViewComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/recipes/recipe-details/recipe-details.component')
          .then(m => m.RecipeDetailsComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'recipes',
    pathMatch: 'full'
  }
];
