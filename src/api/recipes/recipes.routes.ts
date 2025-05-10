import { Routes } from '@angular/router';
import { RecipesResolver } from './recipes.resolver';

export const RECIPES_ROUTES: Routes = [
  {
    path: 'api/recipes',
    children: [
      {
        path: '',
        resolve: {
          recipes: RecipesResolver
        }
      }
    ]
  }
]; 