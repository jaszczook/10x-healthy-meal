import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { RecipeListItemDto, RecipesListResponseDto } from '../../types/dto';
import { RecipeEntity } from '../../types/entities';
import { ErrorLogService } from './error-log.service';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private supabase = createClient(
    process.env['SUPABASE_URL'] || '',
    process.env['SUPABASE_ANON_KEY'] || ''
  );

  constructor(
    private errorLogService: ErrorLogService
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
      let query = this.supabase
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
} 