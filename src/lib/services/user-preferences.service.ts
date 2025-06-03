import { UserPreferencesDto } from '../../types/dto';
import { ErrorLogService } from './error-log.service';
import { SupabaseService } from '../supabase/supabase.service';

export class UserPreferencesService {
  constructor(
    private errorLogService: ErrorLogService,
    private supabaseService: SupabaseService
  ) {}

  async getCurrentUserPreferences(): Promise<UserPreferencesDto> {
    try {
      const userId = await this.supabaseService.getCurrentUserId();
      
      const { data: preferences, error } = await this.supabaseService.client
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (!preferences) {
        return {
          allergies: null,
          intolerances: null,
          target_calories: null,
          created_at: null,
          updated_at: null,
        };
      }

      return {
        allergies: preferences.allergies,
        intolerances: preferences.intolerances,
        target_calories: preferences.target_calories,
        created_at: preferences.created_at,
        updated_at: preferences.updated_at,
      };
    } catch (error) {
      // Log error
      await this.errorLogService.logError('getCurrentUserPreferences', error);
      throw error;
    }
  }
} 