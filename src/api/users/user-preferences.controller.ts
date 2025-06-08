import { UserPreferencesService } from '../../lib/services/user-preferences.service';
import { ValidationService } from '../../lib/services/validation.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { UserPreferencesDto, UserPreferencesCommandModel } from '../../types/dto';
import { SupabaseService } from '../../lib/supabase/supabase.service';
import { AuthService } from '../../lib/services/auth.service';
import { Request } from 'express';

export class UserPreferencesApiController {
  constructor(
    private userPreferencesService: UserPreferencesService,
    private validationService: ValidationService,
    private errorLogService: ErrorLogService,
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  async getCurrentUserPreferences(req: Request): Promise<UserPreferencesDto> {
    try {
      // Get preferences using the service
      const preferences = await this.userPreferencesService.getCurrentUserPreferences(req);
      
      // If no preferences exist, create default preferences
      if (!preferences) {
        const { user } = await this.authService.getSession(req);
        if (!user) {
          throw new Error('Not authenticated');
        }

        const defaultPreferences: UserPreferencesCommandModel = {
          allergies: [],
          intolerances: [],
          target_calories: null
        };
        return await this.userPreferencesService.upsertPreferences(user.id, defaultPreferences);
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

  async updatePreferences(req: Request, preferences: UserPreferencesCommandModel): Promise<UserPreferencesDto> {
    try {
      const { user } = await this.authService.getSession(req);
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Validate preferences
      this.validationService.validateUserPreferences(preferences);

      // Update preferences using the service
      return await this.userPreferencesService.upsertPreferences(user.id, preferences);
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