import { UserPreferencesCommandModel } from '../../types/dto';
import { CreateRecipeCommandModel } from '../../types/dto';
import { UpdateRecipeCommandModel } from '../../types/dto';
import { RecipeDataDto } from '../../types/dto';
import { ValidationResultDto, ValidationError } from '../../types/dto';

export class ValidationService {
  validatePaginationParams(page: number, perPage: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page number must be a positive integer');
    }

    if (!Number.isInteger(perPage) || perPage < 1 || perPage > 50) {
      throw new Error('Items per page must be an integer between 1 and 50');
    }
  }

  validateSortParams(
    sortBy: string,
    sortDirection: string
  ): void {
    const allowedSortFields = ['title', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field. Allowed values: ${allowedSortFields.join(', ')}`);
    }

    const allowedDirections = ['asc', 'desc'];
    if (!allowedDirections.includes(sortDirection)) {
      throw new Error(`Invalid sort direction. Allowed values: ${allowedDirections.join(', ')}`);
    }
  }

  validateSearchParam(search: string): void {
    if (typeof search !== 'string') {
      throw new Error('Search parameter must be a string');
    }

    // Sanitize search string to prevent SQL injection
    const sanitizedSearch = this.sanitizeSearchString(search);
    if (sanitizedSearch !== search) {
      throw new Error('Search string contains invalid characters');
    }
  }

  private sanitizeSearchString(search: string): string {
    // Remove any characters that could be used for SQL injection
    return search.replace(/[%_]/g, '');
  }

  validateUserPreferences(preferences: UserPreferencesCommandModel): void {
    if (preferences.target_calories !== null && preferences.target_calories !== undefined) {
      if (typeof preferences.target_calories !== 'number' || preferences.target_calories < 0) {
        throw new Error('Target calories must be a positive number');
      }
    }

    if (preferences.allergies !== null && preferences.allergies !== undefined) {
      if (!Array.isArray(preferences.allergies)) {
        throw new Error('Allergies must be an array');
      }
    }

    if (preferences.intolerances !== null && preferences.intolerances !== undefined) {
      if (!Array.isArray(preferences.intolerances)) {
        throw new Error('Intolerances must be an array');
      }
    }
  }

  validateUuid(uuid: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      throw new Error('Invalid UUID format');
    }
  }

  validateCreateRecipeCommand(recipe: CreateRecipeCommandModel): void {
    if (!recipe.title || typeof recipe.title !== 'string') {
      throw new Error('400 Recipe title is required and must be a string');
    }

    if (!recipe.recipe_data) {
      throw new Error('400 Recipe data is required');
    }

    const { ingredients, steps, notes, calories } = recipe.recipe_data;

    // Validate ingredients
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error('400 Recipe must have at least one ingredient');
    }

    ingredients.forEach((ingredient, index) => {
      if (!ingredient.name || typeof ingredient.name !== 'string') {
        throw new Error(`400 Invalid ingredient name at index ${index}`);
      }
      if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
        throw new Error(`400 Invalid ingredient amount at index ${index}`);
      }
      if (!ingredient.unit || typeof ingredient.unit !== 'string') {
        throw new Error(`400 Invalid ingredient unit at index ${index}`);
      }
    });

    // Validate steps
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('400 Recipe must have at least one step');
    }

    steps.forEach((step, index) => {
      if (!step.description || typeof step.description !== 'string') {
        throw new Error(`400 Invalid step description at index ${index}`);
      }
    });

    // Validate optional fields
    if (notes !== undefined && typeof notes !== 'string') {
      throw new Error('400 Recipe notes must be a string');
    }

    if (calories !== undefined && (typeof calories !== 'number' || calories < 0)) {
      throw new Error('400 Recipe calories must be a non-negative number');
    }
  }

  validateUpdateRecipeCommand(recipe: UpdateRecipeCommandModel): void {
    if (!recipe) {
      throw new Error('400 Recipe data is required');
    }

    if (!recipe.title || typeof recipe.title !== 'string' || recipe.title.trim().length === 0) {
      throw new Error('400 Recipe title is required and must be a non-empty string');
    }

    if (!recipe.recipe_data) {
      throw new Error('400 Recipe data is required');
    }

    this.validateRecipeData(recipe.recipe_data);
  }

  validateRecipeData(recipeData: RecipeDataDto): ValidationResultDto {
    const errors: ValidationError[] = [];

    // Validate ingredients
    if (!Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
      errors.push({
        field: 'ingredients',
        message: 'Recipe must have at least one ingredient'
      });
    } else {
      recipeData.ingredients.forEach((ingredient, index) => {
        if (!ingredient.name || typeof ingredient.name !== 'string') {
          errors.push({
            field: `ingredients[${index}].name`,
            message: 'Ingredient name is required and must be a string'
          });
        }
        if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
          errors.push({
            field: `ingredients[${index}].amount`,
            message: 'Ingredient amount must be a positive number'
          });
        }
        if (!ingredient.unit || typeof ingredient.unit !== 'string') {
          errors.push({
            field: `ingredients[${index}].unit`,
            message: 'Ingredient unit is required and must be a string'
          });
        }
      });
    }

    // Validate steps
    if (!Array.isArray(recipeData.steps) || recipeData.steps.length === 0) {
      errors.push({
        field: 'steps',
        message: 'Recipe must have at least one step'
      });
    } else {
      recipeData.steps.forEach((step, index) => {
        if (!step.description || typeof step.description !== 'string') {
          errors.push({
            field: `steps[${index}].description`,
            message: 'Step description is required and must be a string'
          });
        }
      });
    }

    // Validate optional fields
    if (recipeData.notes !== undefined && typeof recipeData.notes !== 'string') {
      errors.push({
        field: 'notes',
        message: 'Recipe notes must be a string'
      });
    }

    if (recipeData.calories !== undefined && (typeof recipeData.calories !== 'number' || recipeData.calories < 0)) {
      errors.push({
        field: 'calories',
        message: 'Recipe calories must be a non-negative number'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateDeleteRecipeParams(recipeId: string): void {
    // Validate UUID format
    this.validateUuid(recipeId);

    // Additional validation specific to deletion could be added here
    // For example, checking if the recipe ID is not empty
    if (!recipeId.trim()) {
      throw new Error('400 Recipe ID cannot be empty');
    }
  }
} 