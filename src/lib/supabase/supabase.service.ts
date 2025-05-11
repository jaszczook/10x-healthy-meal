import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.supabaseUrl || process.env['SUPABASE_URL'];
    const supabaseKey = environment.supabaseKey || process.env['SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided in environment variables or environment configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
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