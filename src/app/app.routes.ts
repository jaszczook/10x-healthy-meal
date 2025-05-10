import { Routes } from '@angular/router';
import { RECIPES_ROUTES } from '../api/recipes/recipes.routes';

export const APP_ROUTES: Routes = [
  ...RECIPES_ROUTES,
  // ... other routes
];
