import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided in environment variables or environment configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async getCurrentUserId(): Promise<string> {
    // TODO: Remove this once we have a real user.
    return '00000000-0000-0000-0000-000000000001';
    // const { data: { session }, error } = await this.supabase.auth.getSession();
    // if (error || !session) {
    //   throw new Error('Not authenticated');
    // }
    // return session.user.id;
  }
} 