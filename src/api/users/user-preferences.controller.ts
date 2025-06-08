import { UserPreferencesService } from '../../lib/services/user-preferences.service';
import { ValidationService } from '../../lib/services/validation.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { UserPreferencesDto, UserPreferencesCommandModel } from '../../types/dto';
import { SupabaseService } from '../../lib/supabase/supabase.service';

export class UserPreferencesApiController {
  constructor(
    private userPreferencesService: UserPreferencesService,
    private validationService: ValidationService,
    private errorLogService: ErrorLogService,
    private supabaseService: SupabaseService
  ) {}

  async getCurrentUserPreferences(): Promise<UserPreferencesDto> {
    try {
      // Verify user is authenticated
      const userId = await this.supabaseService.getCurrentUserId();

      // Get preferences using the service
      const preferences = await this.userPreferencesService.getCurrentUserPreferences();
      
      // If no preferences exist, create default preferences
      if (!preferences) {
        const defaultPreferences: UserPreferencesCommandModel = {
          allergies: [],
          intolerances: [],
          target_calories: null
        };
        return await this.userPreferencesService.upsertPreferences(userId, defaultPreferences);
      }

      return preferences;
    } catch (error) {
      // Log error
      await this.errorLogService.logError('getCurrentUserPreferences', error);

      // Rethrow with appropriate status code
      if (error instanceof Error && error.message === 'Not authenticated') {
        throw new Error('401 Unauthorized');
      }
      throw new Error('500 Internal Server Error');
    }
  }

  async updatePreferences(preferences: UserPreferencesCommandModel): Promise<UserPreferencesDto> {
    try {
      const userId = await this.supabaseService.getCurrentUserId();

      // Validate preferences
      this.validationService.validateUserPreferences(preferences);

      // Update preferences using the service
      return await this.userPreferencesService.upsertPreferences(userId, preferences);
    } catch (error) {
      // Log error
      await this.errorLogService.logError('updatePreferences', error);

      // Rethrow with appropriate status code
      if (error instanceof Error && error.message === 'Not authenticated') {
        throw new Error('401 Unauthorized');
      }
      throw error;
    }
  }
} 