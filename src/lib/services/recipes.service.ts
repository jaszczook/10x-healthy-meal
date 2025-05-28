import { RecipeListItemDto, RecipesListResponseDto, RecipeDetailDto, RecipeDataDto, ParsedRecipeDto } from '../../types/dto';
import { RecipeEntity } from '../../types/entities';
import { ErrorLogService } from './error-log.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRecipeCommandModel, UpdateRecipeCommandModel } from '../../types/dto';
import { OpenRouterBackendService } from './openrouter/openrouter-backend.service';
import { ChatMessage } from '../../types/openrouter';
import { AuthService } from './auth.service';
import { Request } from 'express';

export class RecipesService {
  constructor(
    private errorLogService: ErrorLogService,
    private supabaseService: SupabaseService,
    private openRouterService: OpenRouterBackendService,
    private authService: AuthService
  ) {}

  async getRecipesList(
    req: Request,
    page: number = 1,
    perPage: number = 10,
    sortBy: 'title' | 'created_at' | 'updated_at' = 'created_at',
    sortDirection: 'asc' | 'desc' = 'desc',
    search?: string
  ): Promise<RecipesListResponseDto> {
    const { user } = await this.authService.getSession(req);
    if (!user) {
      throw new Error('Unauthorized');
    }

    try {
      // Calculate pagination
      const offset = (page - 1) * perPage;

      // Build query
      let query = this.supabaseService.client
        .from('recipes')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

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
      await this.errorLogService.logError(user.id, error);
      throw error;
    }
  }

  async getRecipeById(req: Request, recipeId: string): Promise<RecipeDetailDto> {
    const { user } = await this.authService.getSession(req);
    if (!user) {
      throw new Error('Unauthorized');
    }

    try {
      // Build query
      const { data, error } = await this.supabaseService.client
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .eq('user_id', user.id)
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
      await this.errorLogService.logError(user.id, error);
      throw error;
    }
  }

  async createRecipe(req: Request, recipeData: CreateRecipeCommandModel): Promise<RecipeDetailDto> {
    const { user } = await this.authService.getSession(req);
    if (!user) {
      throw new Error('Unauthorized');
    }

    try {
      const now = new Date().toISOString();
      const recipeEntity = {
        user_id: user.id,
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
      await this.errorLogService.logError(user.id, error);
      throw error;
    }
  }

  async deleteRecipe(req: Request, recipeId: string): Promise<void> {
    const { user } = await this.authService.getSession(req);
    if (!user) {
      throw new Error('Unauthorized');
    }

    try {
      // First verify that the recipe exists and belongs to the user
      const { data, error: fetchError } = await this.supabaseService.client
        .from('recipes')
        .select('id')
        .eq('id', recipeId)
        .eq('user_id', user.id)
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
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Log successful deletion
      await this.errorLogService.logError(user.id, {
        message: `Recipe ${recipeId} successfully deleted`,
        type: 'INFO',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Log error
      await this.errorLogService.logError(user.id, error);
      throw error;
    }
  }

  async updateRecipe(
    req: Request,
    recipeId: string,
    recipeData: UpdateRecipeCommandModel
  ): Promise<RecipeDetailDto> {
    const { user } = await this.authService.getSession(req);
    if (!user) {
      throw new Error('Unauthorized');
    }

    try {
      // First verify that the recipe exists and belongs to the user
      const { data: existingRecipe, error: fetchError } = await this.supabaseService.client
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .eq('user_id', user.id)
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

      const now = new Date().toISOString();
      const updateData = {
        title: recipeData.title,
        recipe_data: recipeData.recipe_data,
        updated_at: now
      };

      // Update recipe in database
      const { data, error: updateError } = await this.supabaseService.client
        .from('recipes')
        .update(updateData)
        .eq('id', recipeId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error('Failed to update recipe');
      }

      // Map entity to DTO
      return this.mapToRecipeDetailDto(data);
    } catch (error) {
      // Log error
      await this.errorLogService.logError(user.id, error);
      throw error;
    }
  }

  async parseRecipe(req: Request, recipeText: string): Promise<ParsedRecipeDto> {
    const { user } = await this.authService.getSession(req);
    if (!user) {
      throw new Error('Unauthorized');
    }

    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a recipe parsing assistant. Your task is to analyze the provided recipe text and extract structured information.
          Return the data in the following JSON format:
          {
            "title": "Recipe title",
            "recipe_data": {
              "ingredients": [
                {"name": "ingredient name", "amount": number, "unit": "unit name"}
              ],
              "steps": [
                {"description": "step description"}
              ],
              "notes": "optional notes",
              "calories": number
            }
          }
          
          Guidelines:
          - Extract the recipe title
          - Parse ingredients with amounts and units
          - Break down preparation steps
          - Include any notes or tips
          - Estimate total calories if possible
          - Ensure all amounts are numeric values
          - Use standard units (g, kg, ml, l, tsp, tbsp, cup, etc.)
          - Return valid JSON only, no additional text`
        },
        {
          role: 'user',
          content: recipeText
        }
      ];

      console.log('Sending messages to OpenRouter:', JSON.stringify(messages, null, 2));
      const response = await this.openRouterService.sendChat(messages, {
        modelName: 'openai/gpt-4.1',
        modelParams: {
          temperature: 0.1,
          max_tokens: 2000
        }
      });

      console.log('Received response from OpenRouter:', JSON.stringify(response, null, 2));

      if (!response) {
        throw new Error('No response from AI service');
      }

      // The response.reply is already parsed JSON from OpenRouterBackendService
      const parsedContent = response.reply;
      this.validateParsedRecipe(parsedContent);

      return parsedContent;
    } catch (error) {
      // Log the error
      await this.errorLogService.logError(user.id, {
        message: error instanceof Error ? error.message : 'Unknown error during AI processing',
        type: 'AI_ERROR',
        details: {
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error
        }
      });

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('timeout');
        }
        if (error.message.includes('OpenRouter API error')) {
          throw new Error('500 AI service error');
        }
      }
      throw error;
    }
  }

  private validateParsedRecipe(parsed: any): void {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid AI response format');
    }

    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('Invalid recipe title in AI response');
    }

    if (!parsed.recipe_data || typeof parsed.recipe_data !== 'object') {
      throw new Error('Invalid recipe data in AI response');
    }

    const { ingredients, steps } = parsed.recipe_data;

    if (!Array.isArray(ingredients) || !Array.isArray(steps)) {
      throw new Error('Invalid ingredients or steps format in AI response');
    }

    // Validate ingredients
    for (const ingredient of ingredients) {
      if (!ingredient.name || typeof ingredient.name !== 'string' ||
          typeof ingredient.amount !== 'number' ||
          !ingredient.unit || typeof ingredient.unit !== 'string') {
        throw new Error('Invalid ingredient format in AI response');
      }
    }

    // Validate steps
    for (const step of steps) {
      if (!step.description || typeof step.description !== 'string') {
        throw new Error('Invalid step format in AI response');
      }
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