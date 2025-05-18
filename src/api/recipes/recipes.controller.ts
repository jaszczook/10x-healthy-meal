import { RecipesService } from '../../lib/services/recipes.service';
import { ValidationService } from '../../lib/services/validation.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { RecipesListResponseDto } from '../../types/dto';
import { SupabaseService } from '../../lib/supabase/supabase.service';

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
      await this.errorLogService.logError(null, error);

      // Rethrow with appropriate status code
      if (error instanceof Error && error.message === 'Not authenticated') {
        throw new Error('401 Unauthorized');
      }
      throw new Error('500 Internal Server Error');
    }
  }
} 