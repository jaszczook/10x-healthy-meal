import { RecipeListItemDto, RecipesListResponseDto, RecipeDetailDto, RecipeDataDto } from '../../types/dto';
import { RecipeEntity } from '../../types/entities';
import { ErrorLogService } from './error-log.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRecipeCommandModel } from '../../types/dto';

export class RecipesService {
  constructor(
    private errorLogService: ErrorLogService,
    private supabaseService: SupabaseService
  ) {}

  async getRecipesList(
    userId: string,
    page: number = 1,
    perPage: number = 10,
    sortBy: 'title' | 'created_at' | 'updated_at' = 'created_at',
    sortDirection: 'asc' | 'desc' = 'desc',
    search?: string
  ): Promise<RecipesListResponseDto> {
    try {
      // Calculate pagination
      const offset = (page - 1) * perPage;

      // Build query
      let query = this.supabaseService.client
        .from('recipes')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Add search if provided
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      // Add sorting
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });

      // Add pagination
      query = query.range(offset, offset + perPage - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Map entities to DTOs
      const recipes = data.map((recipe: RecipeEntity) => this.mapToRecipeListItemDto(recipe));

      // Calculate total pages
      const totalPages = Math.ceil((count || 0) / perPage);

      return {
        total: count || 0,
        page,
        per_page: perPage,
        total_pages: totalPages,
        data: recipes
      };
    } catch (error) {
      // Log error
      await this.errorLogService.logError(userId, error);
      throw error;
    }
  }

  async getRecipeById(userId: string, recipeId: string): Promise<RecipeDetailDto> {
    try {
      // Build query
      const { data, error } = await this.supabaseService.client
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('404 Not Found');
        }
        throw error;
      }

      if (!data) {
        throw new Error('404 Not Found');
      }

      // Map entity to DTO
      return this.mapToRecipeDetailDto(data);
    } catch (error) {
      // Log error
      await this.errorLogService.logError(userId, error);
      throw error;
    }
  }

  async createRecipe(userId: string, recipeData: CreateRecipeCommandModel): Promise<RecipeDetailDto> {
    try {
      const now = new Date().toISOString();
      const recipeEntity = {
        user_id: userId,
        title: recipeData.title,
        recipe_data: recipeData.recipe_data,
        created_at: now,
        updated_at: now
      };

      // Insert recipe into database
      const { data, error } = await this.supabaseService.client
        .from('recipes')
        .insert(recipeEntity)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create recipe');
      }

      // Map entity to DTO
      return this.mapToRecipeDetailDto(data);
    } catch (error) {
      // Log error
      await this.errorLogService.logError(userId, error);
      throw error;
    }
  }

  async deleteRecipe(userId: string, recipeId: string): Promise<void> {
    try {
      // First verify that the recipe exists and belongs to the user
      const { data, error: fetchError } = await this.supabaseService.client
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

      if (!data) {
        throw new Error('404 Not Found');
      }

      // Delete the recipe
      const { error: deleteError } = await this.supabaseService.client
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      // Log successful deletion
      await this.errorLogService.logError(userId, {
        message: `Recipe ${recipeId} successfully deleted`,
        type: 'INFO',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Log error
      await this.errorLogService.logError(userId, error);
      throw error;
    }
  }

  private mapToRecipeListItemDto(recipe: RecipeEntity): RecipeListItemDto {
    const recipeData = recipe.recipe_data as { calories?: number };
    return {
      id: recipe.id,
      title: recipe.title,
      total_calories: recipeData?.calories || null,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at
    };
  }

  private mapToRecipeDetailDto(recipe: RecipeEntity): RecipeDetailDto {
    const recipeData = this.validateAndTransformRecipeData(recipe.recipe_data);
    
    return {
      id: recipe.id,
      title: recipe.title,
      recipe_data: recipeData,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at
    };
  }

  private validateAndTransformRecipeData(data: any): RecipeDataDto {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid recipe data format');
    }

    const { ingredients, steps, notes, calories } = data;

    // Validate ingredients
    if (!Array.isArray(ingredients)) {
      throw new Error('Recipe ingredients must be an array');
    }
    const validatedIngredients = ingredients.map(ing => {
      if (!ing.name || typeof ing.name !== 'string' ||
          typeof ing.amount !== 'number' ||
          !ing.unit || typeof ing.unit !== 'string') {
        throw new Error('Invalid ingredient format');
      }
      return {
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      };
    });

    // Validate steps
    if (!Array.isArray(steps)) {
      throw new Error('Recipe steps must be an array');
    }
    const validatedSteps = steps.map(step => {
      if (!step.description || typeof step.description !== 'string') {
        throw new Error('Invalid step format');
      }
      return {
        description: step.description
      };
    });

    // Validate optional fields
    if (notes !== undefined && typeof notes !== 'string') {
      throw new Error('Recipe notes must be a string');
    }
    if (calories !== undefined && typeof calories !== 'number') {
      throw new Error('Recipe calories must be a number');
    }

    return {
      ingredients: validatedIngredients,
      steps: validatedSteps,
      notes: notes,
      calories: calories
    };
  }
} 