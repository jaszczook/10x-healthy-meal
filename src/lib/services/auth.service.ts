import { SupabaseService } from '../supabase/supabase.service';
import { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export class AuthService {
  private supabaseService: SupabaseService;
  private supabase: SupabaseClient;

  constructor(supabaseService: SupabaseService) {
    this.supabaseService = supabaseService;
    this.supabase = supabaseService.client;
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data; // contains session and user
  }

  async signUp(email: string, password: string, redirectUrl: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    if (error) throw error;
    return data;
  }

  async getSession(req: Request) {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    if (!session) throw new Error('No active session');
    return session;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }
} 