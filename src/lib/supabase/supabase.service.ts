import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async getCurrentUserId(): Promise<string> {
    if (!environment.production) {
      return environment.testUserId;
    }

    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Not authenticated');
    }
    return session.user.id;
  }
} 