import { UserPreferencesCommandModel } from '../../types/dto';

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
} 