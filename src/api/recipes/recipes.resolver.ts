import { Request } from 'express';
import { RecipesApiController } from './recipes.controller';
import { RecipesListResponseDto } from '../../types/dto';

export class RecipesResolver {
  constructor(private controller: RecipesApiController) {}

  async resolve(req: Request): Promise<RecipesListResponseDto> {
    const { page, per_page, sort_by, sort_direction, search } = req.query;
    return this.controller.getRecipes(
      req,
      page as string,
      per_page as string,
      sort_by as string,
      sort_direction as string,
      search as string
    );
  }
} 