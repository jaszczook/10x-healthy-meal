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
    const accessToken = req.cookies['sb-access-token'];
    if (!accessToken) {
      console.log('No access token found in cookies');
      throw new Error('No access token found in cookies');
    }

    const { data: { user }, error } = await this.supabase.auth.getUser(accessToken);
    
    if (error) throw error;
    if (!user) throw new Error('No active session');
    
    return {
      user,
      access_token: accessToken
    };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }
} 