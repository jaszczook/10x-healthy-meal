import { Injectable } from '@angular/core';
import { ErrorLogService } from './error-log.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UserPreferencesCommandModel, UserPreferencesDto } from '../../types/dto';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  constructor(
    private readonly errorLogService: ErrorLogService,
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService
  ) {}

  async getCurrentUserPreferences(req: Request): Promise<UserPreferencesDto | null> {
    try {
      const { user } = await this.authService.getSession(req);
      console.log('chuj');
      console.log(user);
      if (!user) {
        return null;
      }

      const { data, error } = await this.supabaseService.client
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      return data as UserPreferencesDto;
    } catch (error) {
      await this.errorLogService.logError('getCurrentUserPreferences', error);
      throw error;
    }
  }

  async upsertPreferences(
    userId: string,
    preferences: UserPreferencesCommandModel
  ): Promise<UserPreferencesDto> {
    try {
      // Validate input data
      this.validatePreferences(preferences);

      // Check if preferences exist
      const { data: existingPreferences, error: selectError } = await this.supabaseService.client
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw selectError;
      }

      const now = new Date().toISOString();
      const preferencesData = {
        user_id: userId,
        allergies: preferences.allergies,
        intolerances: preferences.intolerances,
        target_calories: preferences.target_calories,
        updated_at: now,
        ...(existingPreferences ? {} : { created_at: now })
      };

      // Perform upsert operation
      const { data, error } = await this.supabaseService.client
        .from('user_preferences')
        .upsert(preferencesData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as UserPreferencesDto;
    } catch (error) {
      await this.errorLogService.logError('upsertPreferences', error);
      throw error;
    }
  }

  private validatePreferences(preferences: UserPreferencesCommandModel): void {
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
} 