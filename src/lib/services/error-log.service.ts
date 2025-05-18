import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

export class ErrorLogService {
  private supabaseService: SupabaseService;
  private supabase: SupabaseClient;

  constructor(supabaseService: SupabaseService) {
    this.supabaseService = supabaseService;
    this.supabase = supabaseService.client;
  }

  async logError(type: string, error: any, userId?: string): Promise<void> {
    try {
      await this.supabase
        .from('error_logs')
        .insert({
          user_id: userId || null,
          message: error?.message ?? JSON.stringify(error),
          type,
        });
    } catch {
      // Logging failure should not block main execution
      console.error('Failed to log error:', error);
    }
  }
} 