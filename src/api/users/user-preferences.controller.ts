import { UserPreferencesService } from '../../lib/services/user-preferences.service';
import { ValidationService } from '../../lib/services/validation.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { UserPreferencesDto } from '../../types/dto';
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
      await this.supabaseService.getCurrentUserId();

      // Get preferences using the service
      return await this.userPreferencesService.getCurrentUserPreferences();
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
} 