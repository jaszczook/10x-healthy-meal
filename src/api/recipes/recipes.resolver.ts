import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { RecipesApiController } from './recipes.controller';
import { RecipesListResponseDto } from '../../types/dto';

@Injectable({
  providedIn: 'root'
})
export class RecipesResolver implements Resolve<RecipesListResponseDto> {
  constructor(private controller: RecipesApiController) {}

  resolve(route: ActivatedRouteSnapshot) {
    const { page, per_page, sort_by, sort_direction, search } = route.queryParams;
    return this.controller.getRecipes(page, per_page, sort_by, sort_direction, search);
  }
} 