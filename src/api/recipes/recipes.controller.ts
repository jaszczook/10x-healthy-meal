import { RecipesService } from '../../lib/services/recipes.service';
import { ValidationService } from '../../lib/services/validation.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { RecipesListResponseDto, RecipeDetailDto, UpdateRecipeCommandModel, RecipeDataDto } from '../../types/dto';
import { SupabaseService } from '../../lib/supabase/supabase.service';
import { CreateRecipeCommandModel } from '../../types/dto';
import { ValidationResultDto } from '../../types/dto';
import { ParsedRecipeDto } from '../../types/dto';
import { Request } from 'express';

export class RecipesApiController {
  constructor(
    private recipesService: RecipesService,
    private validationService: ValidationService,
    private errorLogService: ErrorLogService,
    private supabaseService: SupabaseService
  ) {}

  async getRecipes(
    req: Request,
    page?: string,
    perPage?: string,
    sortBy?: string,
    sortDirection?: string,
    search?: string
  ): Promise<RecipesListResponseDto> {
    try {
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
        req,
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

  async getRecipe(req: Request, recipeId: string): Promise<RecipeDetailDto> {
    try {
      // Validate recipe ID
      this.validationService.validateUuid(recipeId);

      // Get recipe using the service
      return await this.recipesService.getRecipeById(req, recipeId);
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

  async createRecipe(req: Request, recipeData: CreateRecipeCommandModel): Promise<RecipeDetailDto> {
    try {
      // Validate recipe data
      this.validationService.validateCreateRecipeCommand(recipeData);

      // Create recipe using the service
      return await this.recipesService.createRecipe(req, recipeData);
    } catch (error) {
      // Log error
      await this.errorLogService.logError('createRecipe', error);

      // Rethrow with appropriate status code
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          throw new Error('401 Unauthorized');
        }
        if (error.message.startsWith('400')) {
          throw new Error(error.message);
        }
      }
      throw new Error('500 Internal Server Error');
    }
  }

  async deleteRecipe(req: Request, recipeId: string): Promise<void> {
    try {
      // Validate recipe ID
      this.validationService.validateUuid(recipeId);

      // Delete recipe using the service
      await this.recipesService.deleteRecipe(req, recipeId);
    } catch (error) {
      // Log error
      await this.errorLogService.logError('deleteRecipe', error);

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

  async updateRecipe(
    req: Request,
    recipeId: string,
    recipeData: UpdateRecipeCommandModel
  ): Promise<RecipeDetailDto> {
    try {
      // Validate recipe ID and data
      this.validationService.validateUuid(recipeId);
      this.validationService.validateUpdateRecipeCommand(recipeData);

      // Update recipe using the service
      return await this.recipesService.updateRecipe(req, recipeId, recipeData);
    } catch (error) {
      // Log error
      await this.errorLogService.logError('updateRecipe', error);

      // Rethrow with appropriate status code
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          throw new Error('401 Unauthorized');
        }
        if (error.message === '404 Not Found') {
          throw new Error('404 Not Found');
        }
        if (error.message.startsWith('400')) {
          throw new Error(error.message);
        }
      }
      throw new Error('500 Internal Server Error');
    }
  }

  async validateRecipe(recipeId: string, recipeData: RecipeDataDto): Promise<ValidationResultDto> {
    try {
      const userId = await this.supabaseService.getCurrentUserId();

      // Validate recipe ID
      this.validationService.validateUuid(recipeId);

      // Check if recipe exists and belongs to user
      const { data: existingRecipe, error: fetchError } = await this.supabaseService.client
        .from('recipes')
        .select('id')
        .eq('id', recipeId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('404 Not Found');
        }
        throw fetchError;
      }

      if (!existingRecipe) {
        throw new Error('404 Not Found');
      }

      // Validate recipe data
      const validationResult = this.validationService.validateRecipeData(recipeData);

      // Log validation failures with detailed information
      if (!validationResult.valid) {
        await this.errorLogService.logError('validateRecipe', {
          message: 'Recipe validation failed',
          type: 'VALIDATION_ERROR',
          details: {
            recipeId,
            userId,
            errors: validationResult.errors,
            recipeData: {
              ingredientsCount: recipeData.ingredients?.length || 0,
              stepsCount: recipeData.steps?.length || 0,
              hasNotes: recipeData.notes !== undefined,
              hasCalories: recipeData.calories !== undefined
            }
          }
        });
      }

      return validationResult;
    } catch (error) {
      // Log error with enhanced context
      await this.errorLogService.logError('validateRecipe', {
        message: error instanceof Error ? error.message : 'Unknown error during recipe validation',
        type: 'VALIDATION_ERROR',
        details: {
          recipeId,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error
        }
      });

      // Rethrow with appropriate status code
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          throw new Error('401 Unauthorized');
        }
        if (error.message === '404 Not Found') {
          throw new Error('404 Not Found');
        }
        if (error.message.startsWith('400')) {
          throw error; // Keep the 400 error message as is
        }
      }
      throw new Error('500 Internal Server Error');
    }
  }

  async parseRecipe(req: Request, recipeText: string): Promise<ParsedRecipeDto> {
    try {
      // Verify user is authenticated
      await this.supabaseService.getCurrentUserId();

      // Validate recipe text
      if (!recipeText || recipeText.trim().length === 0) {
        throw new Error('400 Recipe text cannot be empty');
      }

      // Parse recipe using the service
      return await this.recipesService.parseRecipe(req, recipeText);
    } catch (error) {
      // Log error with enhanced context
      await this.errorLogService.logError('parseRecipe', {
        message: error instanceof Error ? error.message : 'Unknown error during recipe parsing',
        type: 'PARSING_ERROR',
        details: {
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error
        }
      });

      // Rethrow with appropriate status code
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          throw new Error('401 Unauthorized');
        }
        if (error.message.startsWith('400')) {
          throw error; // Keep the 400 error message as is
        }
        if (error.message.includes('timeout')) {
          throw new Error('408 Request Timeout');
        }
      }
      throw new Error('500 Internal Server Error');
    }
  }
} 