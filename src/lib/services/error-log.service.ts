import { SupabaseService } from '../supabase/supabase.service';

export class ErrorLogService {
  constructor(private supabaseService: SupabaseService) {}

  async logError(userId: string | null, error: unknown): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await this.supabaseService.client
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