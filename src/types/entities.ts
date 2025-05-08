import { Json } from '../db/database.types';
import { Tables } from '../db/database.types';

/**
 * Entity types that map directly to database tables
 */

export type UserPreferencesEntity = Tables<'user_preferences'>;
export type RecipeEntity = Tables<'recipes'>;
export type ErrorLogEntity = Tables<'error_logs'>;

/**
 * Type for the structured recipe data stored in the recipe_data JSON field
 */
export interface RecipeData {
  ingredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
  steps: {
    description: string;
  }[];
  notes?: string;
  calories?: number;
}

/**
 * Helper type to ensure recipe_data is strongly typed when working with recipes
 */
export interface TypedRecipeEntity extends Omit<RecipeEntity, 'recipe_data'> {
  recipe_data: RecipeData;
} 