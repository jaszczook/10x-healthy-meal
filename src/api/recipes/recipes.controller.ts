import { RecipesService } from '../../lib/services/recipes.service';
import { ValidationService } from '../../lib/services/validation.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { RecipesListResponseDto, RecipeDetailDto } from '../../types/dto';
import { SupabaseService } from '../../lib/supabase/supabase.service';
import { CreateRecipeCommandModel } from '../../types/dto';

export class RecipesApiController {
  constructor(
    private recipesService: RecipesService,
    private validationService: ValidationService,
    private errorLogService: ErrorLogService,
    private supabaseService: SupabaseService
  ) {}

  async getRecipes(
    page?: string,
    perPage?: string,
    sortBy?: string,
    sortDirection?: string,
    search?: string
  ): Promise<RecipesListResponseDto> {
    try {
      const userId = await this.supabaseService.getCurrentUserId();

      // Parse and validate query parameters
      const parsedPage = page ? parseInt(page, 10) : 1;
      const parsedPerPage = perPage ? parseInt(perPage, 10) : 10;
      const parsedSortBy = (sortBy || 'created_at') as 'title' | 'created_at' | 'updated_at';
      const parsedSortDirection = (sortDirection || 'desc') as 'asc' | 'desc';

      // Validate parameters
      this.validationService.validatePaginationParams(parsedPage, parsedPerPage);
      this.validationService.validateSortParams(parsedSortBy, parsedSortDirection);
      if (search) {
        this.validationService.validateSearchParam(search);
      }

      // Get recipes using the service
      return await this.recipesService.getRecipesList(
        userId,
        parsedPage,
        parsedPerPage,
        parsedSortBy,
        parsedSortDirection,
        search
      );
    } catch (error) {
      // Log error
      await this.errorLogService.logError('getRecipes', error);

      // Rethrow with appropriate status code
      if (error instanceof Error && error.message === 'Not authenticated') {
        throw new Error('401 Unauthorized');
      }
      throw new Error('500 Internal Server Error');
    }
  }

  async getRecipe(recipeId: string): Promise<RecipeDetailDto> {
    try {
      const userId = await this.supabaseService.getCurrentUserId();

      // Validate recipe ID
      this.validationService.validateUuid(recipeId);

      // Get recipe using the service
      return await this.recipesService.getRecipeById(userId, recipeId);
    } catch (error) {
      // Log error
      await this.errorLogService.logError('getRecipe', error);

      // Rethrow with appropriate status code
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          throw new Error('401 Unauthorized');
        }
        if (error.message === '404 Not Found') {
          throw new Error('404 Not Found');
        }
      }
      throw new Error('500 Internal Server Error');
    }
  }

  async createRecipe(recipeData: CreateRecipeCommandModel): Promise<RecipeDetailDto> {
    try {
      const userId = await this.supabaseService.getCurrentUserId();

      // Validate input data
      this.validationService.validateCreateRecipeCommand(recipeData);

      // Create recipe using the service
      return await this.recipesService.createRecipe(userId, recipeData);
    } catch (error) {
      // Log error
      await this.errorLogService.logError('createRecipe', error);

      // Rethrow with appropriate status code
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          throw new Error('401 Unauthorized');
        }
        if (error.message.startsWith('400')) {
          throw error; // Keep the 400 error message as is
        }
      }
      throw new Error('500 Internal Server Error');
    }
  }
} 