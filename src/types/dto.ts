import { Json } from '../db/database.types';

/**
 * Base pagination response interface
 */
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  data: T[];
}

/**
 * User Preferences DTOs
 */
export interface UserPreferencesDto {
  allergies: string[] | null;
  intolerances: string[] | null;
  target_calories: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserPreferencesCommandModel {
  allergies?: string[] | null;
  intolerances?: string[] | null;
  target_calories?: number | null;
}

/**
 * Recipe DTOs
 */
export interface IngredientDto {
  name: string;
  amount: number;
  unit: string;
}

export interface StepDto {
  description: string;
}

export interface RecipeDataDto {
  ingredients: IngredientDto[];
  steps: StepDto[];
  notes?: string;
  calories?: number;
}

export interface RecipeListItemDto {
  id: string;
  title: string;
  total_calories: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export type RecipesListResponseDto = PaginatedResponse<RecipeListItemDto>;

export interface RecipeDetailDto {
  id: string;
  title: string;
  recipe_data: RecipeDataDto;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateRecipeCommandModel {
  title: string;
  recipe_data: RecipeDataDto;
}

export type UpdateRecipeCommandModel = CreateRecipeCommandModel;

export interface ParseRecipeCommandModel {
  recipe_text: string;
}

export interface ParsedRecipeDto {
  title: string;
  recipe_data: RecipeDataDto;
}

export type RecipeDataCommandModel = RecipeDataDto;

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResultDto {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Error Log DTOs
 */
export interface ErrorLogDto {
  id: string;
  user_id: string | null;
  message: string;
  created_at: string | null;
}

export type ErrorLogsListResponseDto = PaginatedResponse<ErrorLogDto>;

/**
 * Recipe Form ViewModels
 */
export interface RecipeFormViewModel {
  title: string;
  ingredients: IngredientViewModel[];
  steps: StepViewModel[];
  notes?: string;
  calories?: number;
}

export interface IngredientViewModel {
  name: string;
  amount: number;
  unit: string;
  isAllergen: boolean;
}

export interface StepViewModel {
  description: string;
  order: number;
}

export interface RecipeSummaryViewModel {
  totalCalories: number;
  ingredients: {
    name: string;
    amount: number;
    unit: string;
    isAllergen: boolean;
  }[];
} 