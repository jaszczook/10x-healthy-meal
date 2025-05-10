import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { ErrorLogDto } from '../../types/dto';

@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {
  private supabase = createClient(
    process.env['SUPABASE_URL'] || '',
    process.env['SUPABASE_ANON_KEY'] || ''
  );

  async logError(userId: string | null, error: unknown): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await this.supabase
        .from('error_logs')
        .insert({
          user_id: userId,
          message: errorMessage,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      // If we can't log the error, at least log it to console
      console.error('Failed to log error:', logError);
      console.error('Original error:', error);
    }
  }
} 