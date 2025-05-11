import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl || process.env['SUPABASE_URL'] || '',
      environment.supabaseKey || process.env['SUPABASE_ANON_KEY'] || ''
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async getCurrentUserId(): Promise<string> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Not authenticated');
    }
    return session.user.id;
  }
} 